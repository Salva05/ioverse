from rest_framework.exceptions import APIException

class MissingApiKeyException(APIException):
    status_code = 400
    default_detail = "Missing API key for the user."
    default_code = "missing_api_key"