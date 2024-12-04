from openai import OpenAI

class ThreadClient:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    def create_thread(self, **kwargs):
        return self.client.beta.threads.create(**kwargs)

    def retrieve_thread(self, thread_id):
        return self.client.beta.threads.retrieve(thread_id)

    def update_thread(self, thread_id, **kwargs):
        return self.client.beta.threads.update(thread_id, **kwargs)

    def delete_thread(self, thread_id):
        return self.client.beta.threads.delete(thread_id)
