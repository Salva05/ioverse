import asyncio
import httpx

BASE_URL = "https://api.openai.com/v1/organization/usage/"
CATEGORIES = [
    "completions",
    "images",
    "vector_stores",
    "code_interpreter_sessions",
]

# group-by rules of Usage APIs
_ALLOWED_GB = {
    "completions": {"model", "project_id"},
    "images": {"model", "project_id", "size"},
    "embeddings": {"model", "project_id"},
    "moderations": {"model", "project_id"},
    # code_interpreter_sessions allows only project_id (or nothing)
}

class UsageInputError(Exception):
    """Raised when OpenAI returns 400 for invalid query params"""


def _clean_params(category: str, params: dict) -> dict:
    """Drop disallowed group_by values and rename bucket_width → interval."""
    params = params.copy()
    # translate legacy param
    if "bucket_width" in params:
        params["interval"] = params.pop("bucket_width")

    # validate group_by for this category
    if "group_by" in params:
        allowed = _ALLOWED_GB.get(category, set())
        requested = set(params["group_by"].split(","))
        valid = requested & allowed
        if valid:
            params["group_by"] = ",".join(sorted(valid))
        else:
            params.pop("group_by")  # nothing valid left

    # prune falsy values (None / "")
    return {k: v for k, v in params.items() if v}


async def _fetch_one(
    client: httpx.AsyncClient,
    category: str,
    base_params: dict,
    api_key: str,
    per_page: int = 31,
):
    cursor = None
    rows = []

    while True:
        params = _clean_params(category, base_params)
        params["limit"] = per_page
        params["group_by"] = sorted(_ALLOWED_GB.get(category, []))
        
        if cursor:
            params["page"] = cursor

        resp = await client.get(
            f"{BASE_URL}{category}",
            headers={"Authorization": f"Bearer {api_key}"},
            params=params,
            timeout=20,
        )
        if resp.status_code == 400:
            raise UsageInputError(resp.json())
        resp.raise_for_status()

        payload = resp.json()
        for bucket in payload["data"]:
            ts = bucket["start_time"]
            # copy bucket time into every row so React can build YYYY-MM-DD
            for r in bucket["results"]:
                r["timestamp"] = ts
                rows.append(r)

        if not payload.get("has_more"):
            break
        cursor = payload.get("next_page")

    return rows


async def fetch_usage(
    api_key: str,
    start_time: int,
    end_time: int,
    **filters,
):
    """
    Fan-out to all eight usage endpoints and flatten the result.
    `filters` may include models=…, group_by=…
    """
    params = {
        "start_time": start_time,
        "end_time": end_time,
        **filters,
    }

    async with httpx.AsyncClient() as client:  # http/1.1 is fine
        chunks = await asyncio.gather(
            *[_fetch_one(client, c, params, api_key) for c in CATEGORIES]
        )
    return [item for sub in chunks for item in sub]
