from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions

class Chatbot(APIView):
    """
    Hanldes incoming POST requests (user messages), routing it's body 
    into chatbot_modules and returns a message representing the AI's reponse
    
    * Requires token authentication.
    """
    
    # authentication_classes = [authentication.TokenAuthentication]
    # permission_classes = [permissions.IsAdminUser]

    def post(self, request, format=None):
        pass