from asgiref.sync import async_to_sync
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UsageQueryParams
from .usage_service import fetch_usage, UsageInputError
from apps.account.permissions import RequiresAdminKey

class OrgUsageView(APIView):
    permission_classes = [IsAuthenticated, RequiresAdminKey]    # check for auth and valid admin key

    def get(self, request):
        qp = UsageQueryParams(data=request.query_params)
        qp.is_valid(raise_exception=True)
        data = qp.validated_data

        admin_key = request.user.admin_key
        
        if not admin_key:
            return Response(
                {"detail": "You haven’t linked an OpenAI key yet."},
                status=403,
            )

        models = ",".join(data.get("models", []))
        group_by = ",".join(data.get("group_by", []))
        bucket_width = data.get("bucket_width", "1d")

        try:
            usage_rows = async_to_sync(fetch_usage)(
                api_key=admin_key,
                start_time=data["start_time"],
                end_time=data["end_time"],
                bucket_width=bucket_width,
                models=models,
                group_by=group_by,
            )
        except UsageInputError as e:
            # forward OpenAI's 400 payload to the client
            return Response(e.args[0], status=400)

        return Response({"results": usage_rows})
