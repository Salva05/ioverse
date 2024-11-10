from openai import OpenAI
from .helpers import handle_errors, clean

class RunStep:
    """
    Offers a set of methods to ease the interaction 
    with the Run Steps entity of OpenAI's Assistant API.
    """
    def __init__(self, api_key: str):
        """
        Initializes the Run class with the provided OpenAI API key.
        """
        self.client = OpenAI(api_key=api_key)
    
    @handle_errors
    def list(self, **kwargs):
        """
        Returns a list of Run Steps belonging to a Run.
        """
        # Remove None values
        kwargs = clean(kwargs)
        
        # Required params
        thread_id = kwargs.pop('thread_id', None)
        run_id = kwargs.pop('run_id', None)
        
        if not thread_id:
            raise ValueError("Missing required argument: 'thread_id'")
        if not run_id:
            raise ValueError("Missing required argument: 'run_id'")
        
        # API request
        return self.client.beta.threads.runs.steps.list(
            thread_id=thread_id,
            run_id=run_id,
            **kwargs,
        ).model_dump()
        
    @handle_errors
    def retrieve(self, **kwargs):
        """
        Retrieves a Run Step.
        """
        kwargs = clean(kwargs)
        
        thread_id = kwargs.pop('thread_id', None)
        run_id = kwargs.pop('run_id', None)
        step_id = kwargs.pop('step_id', None)
        
        if not thread_id:
            raise ValueError("Missing required argument: 'thread_id'")
        if not run_id:
            raise ValueError("Missing required argument: 'run_id'")
        if not step_id:
            raise ValueError("Missing required argument: 'step_id'")

        return self.client.beta.threads.runs.steps.retrieve(
            thread_id=thread_id,
            run_id=run_id,
            step_id=step_id,
            **kwargs,
        ).model_dump()