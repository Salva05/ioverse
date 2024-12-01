from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from pydantic import ValidationError
from html import escape
from ..services.generation_service import TaskGeneratorService

class GenerateSystemInstruction(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        task_gen_service = TaskGeneratorService()
        try:
            user_prompt = request.data.get("prompt", "")
            sanitized_prompt = escape(user_prompt)
            ai_response = task_gen_service.generate_system_instructions(sanitized_prompt)
            return Response({"message": ai_response}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class GenerateFunction(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        task_gen_service = TaskGeneratorService()
        try:
            user_prompt = request.data.get("prompt", "")
            sanitized_prompt = escape(user_prompt)
            ai_response = task_gen_service.generate_function_tool(sanitized_prompt)
            return Response({"message": ai_response}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
class GenerateSchema(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        task_gen_service = TaskGeneratorService()
        try:
            user_prompt = request.data.get("prompt", "")
            sanitized_prompt = escape(user_prompt)
            ai_response = task_gen_service.generate_schema(sanitized_prompt)
            return Response({"message": ai_response}, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": "An unexpected error occurred.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )