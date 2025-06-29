import requests

def verify_openai_api_key(api_key: str):
    """
    Verifies the validity of an OpenAI API key by making a request to the List Models endpoint.

    Args:
        api_key (str): The OpenAI API key to verify.

    Returns:
        dict: A dictionary containing the verification result and any relevant messages.
    """
    url = "https://api.openai.com/v1/models"
    headers = {
        "Authorization": f"Bearer {api_key}"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            # API key is valid
            return {
                "valid": True,
                "message": "API key is valid."
            }
        elif response.status_code == 401:
            # Unauthorized - Invalid API key
            return {
                "valid": False,
                "message": "Invalid API key. Please check and try again."
            }
        elif response.status_code == 429:
            # Too Many Requests - Rate limit exceeded
            return {
                "valid": False,
                "message": "Rate limit exceeded. Please try again later."
            }
        else:
            return {
                "valid": False,
                "message": f"Unexpected error occurred: {response.status_code} - {response.text}"
            }
    except requests.exceptions.RequestException as e:
        return {
            "valid": False,
            "message": f"Request failed: {str(e)}"
        }
        
def verify_openai_admin_key(admin_key: str):
    """
    Verifies that the supplied key is an *Admin* key and has the required privileges
    on the admin-only endpoints (June 2025 update).
    """
    ADMIN_PREFIX = "sk-admin-"
    if not admin_key.startswith(ADMIN_PREFIX):
        return {"valid": False, "message": "Not an Admin key (prefix mismatch)."}

    url = "https://api.openai.com/v1/organizations"          # admin-only endpoint
    headers = {"Authorization": f"Bearer {admin_key}"}

    try:
        r = requests.get(url, headers=headers, timeout=10)

        if r.status_code == 200:
            return {"valid": True,
                    "message": "Admin key is valid and has the required scope."}
        elif r.status_code == 403:
            return {"valid": False,
                    "message": "Key exists but lacks admin privileges."}
        elif r.status_code == 401:
            return {"valid": False,
                    "message": "Invalid key."}
        elif r.status_code == 429:
            return {"valid": False,
                    "message": "Rate limit exceeded. Please try again later."}
        else:
            return {"valid": False,
                    "message": f"Unexpected error {r.status_code}: {r.text}"}
    except requests.exceptions.RequestException as exc:
        return {"valid": False, "message": f"Request failed: {exc}"}
    
if __name__ == "__main__":
    # Accept *any* secret key; auto-detect whether it’s Admin or user-level
    secret = input("Paste your OpenAI key (user or admin): ").strip()

    if secret.startswith("sk-admin-"):
        result   = verify_openai_admin_key(secret)
        key_type = "Admin"
    elif secret.startswith("sk-proj-"):
        result   = verify_openai_api_key(secret)
        key_type = "User"
    else:
        result = {
            "valid": False,
            "message": "Unrecognized API key (only allowed initials are sk-admin- or sk-proj-)"
        }
        key_type = "Unknown"

    if result["valid"]:
        # ✅ green
        print(f"\033[92m✅ {key_type} key is valid. {result['message']}\033[0m")
    else:
        # ❌ red
        print(f"\033[91m❌ {key_type} Key Verification Failed: {result['message']}\033[0m")