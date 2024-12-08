from openai import OpenAI
from .helpers import handle_errors, clean

class Run:
    """
    Offers a set of methods to ease the interaction 
    with the Run entity of OpenAI's Assistant API.
    """

    def __init__(self, api_key: str):
        """
        Initializes the Run class with the provided OpenAI API key.
        """
        self.client = OpenAI(api_key=api_key)
    
    @handle_errors
    def create(self, **kwargs):
        """
        Creates a Run Object in OpenAI domain.
        """
        # Remove None values
        kwargs = clean(kwargs)
        
        # Required params
        thread_id = kwargs.pop('thread_id', None)
        assistant_id = kwargs.pop('assistant_id', None)
        
        if not thread_id:
            raise ValueError("Missing required argument: 'thread_id'")
        if not assistant_id:
            raise ValueError("Missing required argument: 'assistant_id'")
        
        # API request
        return self.client.beta.threads.runs.create(
            thread_id=thread_id,
            assistant_id=assistant_id,
            **kwargs
        ).model_dump()

    @handle_errors
    def create_thread_and_run(self, **kwargs):
        """
        Creates a Thread and run it in one request.
        """
        kwargs = clean(kwargs)
        
        assistant_id = kwargs.pop('assistant_id', None)
        if not assistant_id:
            raise ValueError("Missing required argument: 'assistant_id'")
        

        return self.client.beta.threads.create_and_run(
            assistant_id=assistant_id,
            **kwargs
        ).model_dump()
    
    @handle_errors
    def list(self, **kwargs):
        """
        Returns a list of runs belonging to a thread
        """
        kwargs = clean(kwargs)
        
        thread_id = kwargs.pop('thread_id', None)
        if not thread_id:
            raise ValueError("Missing required argument: 'thread_id'")
        

        return self.client.beta.threads.runs.list(
            thread_id=thread_id,
            **kwargs
        ).model_dump()
        
    @handle_errors
    def retrieve(self, **kwargs):
        """
        Retrieves a run.
        """
        thread_id = kwargs.pop('thread_id', None)
        run_id = kwargs.pop('run_id', None)
        
        if not thread_id:
            raise ValueError("Missing required argument: 'thread_id'")
        if not run_id:
            raise ValueError("Missing required argument: 'run_id'")

        return self.client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run_id
        ).model_dump()
        
    @handle_errors
    def update(self, **kwargs):
        """
        Updates a run.
        """
        kwargs = clean(kwargs)
        
        thread_id = kwargs.pop('thread_id', None)
        run_id = kwargs.pop('run_id', None)
        
        if not thread_id:
            raise ValueError("Missing required argument: 'thread_id'")
        if not run_id:
            raise ValueError("Missing required argument: 'run_id'")

        return self.client.beta.threads.runs.update(
            thread_id=thread_id,
            run_id=run_id,
            **kwargs
        ).model_dump()
    
    @handle_errors
    def submit_tool_outputs(self, **kwargs):
        """
        Submits the outputs from the tool calls once they're completed.
        """
        kwargs = clean(kwargs)
        
        thread_id = kwargs.pop('thread_id', None)
        run_id = kwargs.pop('run_id', None)
        tool_outputs = kwargs.pop('tool_outputs', None)
        
        if not thread_id:
            raise ValueError("Missing required argument: 'thread_id'")
        if not run_id:
            raise ValueError("Missing required argument: 'run_id'")
        if not tool_outputs:
            raise ValueError("Missing required argument: 'tool_outputs")

        return self.client.beta.threads.runs.submit_tool_outputs(
            thread_id=thread_id,
            run_id=run_id,
            tool_outputs=tool_outputs
            **kwargs
        ).model_dump()
    
    @handle_errors
    def cancel(self, **kwargs):
        """
        Cancels a run whose status is 'in_progress'.
        """
        thread_id = kwargs.pop('thread_id', None)
        run_id = kwargs.pop('run_id', None)
        
        if not thread_id:
            raise ValueError("Missing required argument: 'thread_id'")
        if not run_id:
            raise ValueError("Missing required argument: 'run_id'")
        
        return self.client.beta.threads.runs.cancel(
            thread_id=thread_id,
            run_id=run_id
        ).model_dump()
        
    @handle_errors
    def create_and_poll(self, **kwargs):
        """
        Creates a Run and polls the status until it reaches
        a terminal state and then returns the resulting object.
        """
        kwargs = clean(kwargs)
        
        thread_id = kwargs.pop('thread_id', None)
        assistant_id = kwargs.pop('assistant_id', None)
        
        if not thread_id:
            raise ValueError("Missing required argument: 'thread_id'")
        if not assistant_id:
            raise ValueError("Missing required argument: 'assistant_id'")
        
        return self.client.beta.threads.runs.create_and_poll(
            thread_id=thread_id,
            assistant_id=assistant_id,
            **kwargs
        ).model_dump()
        
    @handle_errors
    def stream(self, event_handler, **kwargs):
        """
        Run a thread and stream the result.
        """
        thread_id = kwargs.pop('thread_id', None)
        assistant_id = kwargs.pop('assistant_id', None)
        
        if not thread_id:
            raise ValueError("Missing required argument: 'thread_id'")
        if not assistant_id:
            raise ValueError("Missing required argument: 'assistant_id'")
        
        with self.client.beta.threads.runs.stream(
            thread_id=thread_id,
            assistant_id=assistant_id,
            event_handler=event_handler,
            **kwargs,
        ) as stream:
            stream.until_done()