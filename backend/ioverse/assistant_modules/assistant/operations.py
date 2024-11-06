from openai import OpenAI

class AssistantClient:
    def __init__(self):
        self.client = OpenAI()

    def create_assistant(self, **kwargs):
        return self.client.beta.assistants.create(**kwargs)

    def retrieve_assistant(self, assistant_id):
        return self.client.beta.assistants.retrieve(assistant_id)
    
    def list_assistants(self, **kwargs):
        return self.client.beta.assistants.list(**kwargs)

    def update_assistant(self, assistant_id, **kwargs):
        return self.client.beta.assistants.update(assistant_id, **kwargs)

    def delete_assistant(self, assistant_id):
        return self.client.beta.assistants.delete(assistant_id)
