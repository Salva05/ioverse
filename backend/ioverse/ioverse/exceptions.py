from rest_framework.exceptions import APIException

class MissingApiKeyException(APIException):
    status_code = 401
    default_detail = "Missing API key."
    default_code = "missing_api_key"