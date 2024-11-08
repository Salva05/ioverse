from openai import OpenAI

class MessageClient:
    def __init__(self):
        self.client = OpenAI()

    def create_message(self, thread_id, **kwargs):
        return self.client.beta.threads.messages.create(thread_id, **kwargs)

    def retrieve_message(self, thread_id, message_id):
        return self.client.beta.threads.messages.retrieve(thread_id=thread_id, message_id=message_id)

    def update_message(self, thread_id, message_id, **kwargs):
        return self.client.beta.threads.messages.update(
            message_id=message_id,
            thread_id=thread_id,
            **kwargs
        )

    def delete_message(self, thread_id, message_id):
        return self.client.beta.threads.messages.delete(thread_id=thread_id, message_id=message_id)

    def list_messages(self, thread_id, **params):
        return self.client.beta.threads.messages.list(thread_id, **params)
