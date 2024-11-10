from assistant_modules.run.run import Run
from assistant_modules.run.run_steps import RunStep
from django.conf import settings

class RunService:
    # Any future processing and validation will be added here
    
    def __init__(self):
        self.run = Run(api_key=settings.OPENAI_API_KEY)

    def create_run(self, **kwargs):
        return self.run.create(**kwargs)

    def create_thread_and_run(self, **kwargs):
        return self.run.create_thread_and_run(**kwargs)

    def list_runs(self, **kwargs):
        return self.run.list(**kwargs)

    def retrieve_run(self, **kwargs):
        return self.run.retrieve(**kwargs)

    def update_run(self, **kwargs):
        return self.run.update(**kwargs)

    def submit_tool_outputs(self, **kwargs):
        return self.run.submit_tool_outputs(**kwargs)

    def cancel_run(self, **kwargs):
        return self.run.cancel(**kwargs)

    def create_and_poll_run(self, **kwargs):
        return self.run.create_and_poll(**kwargs)


class RunStepService:
    def __init__(self):
        self.run_step = RunStep(api_key=settings.OPENAI_API_KEY)

    def list_run_steps(self, **kwargs):
        return self.run_step.list(**kwargs)

    def retrieve_run_step(self, **kwargs):
        return self.run_step.retrieve(**kwargs)
