from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from ioverse.exceptions import MissingApiKeyException
from ..serializers import GenericJSONSerializer
from ..services.run_services import RunService
import logging

logger = logging.getLogger(__name__)

class RunBaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_api_key(self):
        """
        Method to retrieve API key for a given user.
        """
        api_key = getattr(self.request.user, 'api_key', None)
        if not api_key:
            raise MissingApiKeyException()
        return api_key
    
class RunAPIView(RunBaseView):
    """
    Handles all Run-related operations.
    """
    def post(self, request, action):
        """
        Handles POST requests for creating runs, submitting tool outputs, etc.
        """
        serializer = GenericJSONSerializer(data={'data': request.data})
        if serializer.is_valid():
            data = serializer.validated_data['data']
            try:
                # Retrieve OpenAI API Key
                api_key = self.get_api_key()
                service = RunService(api_key=api_key)
                
                if action == 'create':
                    result = service.create_run(**data)
                    return Response(result, status=status.HTTP_201_CREATED)
                elif action == 'create_thread_and_run':
                    result = service.create_thread_and_run(**data)
                    return Response(result, status=status.HTTP_201_CREATED)
                elif action == 'submit_tool_outputs':
                    result = service.submit_tool_outputs(**data)
                    return Response(result, status=status.HTTP_200_OK)
                elif action == 'cancel':
                    result = service.cancel_run(**data)
                    return Response(result, status=status.HTTP_200_OK)
                elif action == 'create_and_poll':
                    result = service.create_and_poll_run(**data)
                    return Response(result, status=status.HTTP_201_CREATED)
                else:
                    return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error in RunAPIView [{action}]: {e}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, action):
        """
        Handles GET requests for listing runs, retrieving a run, etc.
        """
        data = {}
        if action == 'list_runs':
            data['thread_id'] = request.query_params.get('thread_id')
        elif action == 'retrieve_run':
            data['thread_id'] = request.query_params.get('thread_id')
            data['run_id'] = request.query_params.get('run_id')
        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Retrieve OpenAI API Key
            api_key = self.get_api_key()
            service = RunService(api_key=api_key)
            
            if action == 'list_runs':
                result = service.list_runs(**data)
                return Response(result, status=status.HTTP_200_OK)
            elif action == 'retrieve_run':
                result = service.retrieve_run(**data)
                return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in RunAPIView [{action}]: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, action):
        """
        Handles PUT requests for updating runs.
        """
        serializer = GenericJSONSerializer(data={'data': request.data})
        if serializer.is_valid():
            data = serializer.validated_data['data']
            try:
                # Retrieve OpenAI API Key
                api_key = self.get_api_key()
                service = RunService(api_key=api_key)
                
                if action == 'update_run':
                    result = service.update_run(**data)
                    return Response(result, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Error in RunAPIView [{action}]: {e}")
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RunStepAPIView(RunBaseView):
    """
    Handles all RunStep-related operations.
    """
    def get(self, request, action):
        """
        Handles GET requests for listing run steps and retrieving a run step.
        """
        data = {}
        if action == 'list_run_steps':
            data['thread_id'] = request.query_params.get('thread_id')
            data['run_id'] = request.query_params.get('run_id')
        elif action == 'retrieve_run_step':
            data['thread_id'] = request.query_params.get('thread_id')
            data['run_id'] = request.query_params.get('run_id')
            data['step_id'] = request.query_params.get('step_id')
        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Retrieve OpenAI API Key
            api_key = self.get_api_key()
            service = RunService(api_key=api_key)
            
            if action == 'list_run_steps':
                result = service.list_run_steps(**data)
                return Response(result, status=status.HTTP_200_OK)
            elif action == 'retrieve_run_step':
                result = service.retrieve_run_step(**data)
                return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in RunStepAPIView [{action}]: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
