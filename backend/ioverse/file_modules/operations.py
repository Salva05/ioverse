from openai import OpenAI

class FileClient:
    """
    Represents the bridge between the application and OpenAI API File operations.
    """
    
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    def upload_file(self, file, purpose):
        """
        Upload a file that can be used across various OpenAI API endpoints.
        Individual files can be up to 512 MB, and the size of all files
        uploaded by one organization can be up to 100 GB.
        The Assistants API supports files up to 2 million tokens and of specific file types.
        The Fine-tuning API only supports .jsonl files. The input also has certain required formats for fine-tuning chat or completions models.
        The Batch API only supports .jsonl files up to 200 MB in size. The input also has a specific required format.
        """
        return self.client.files.create(file=file, purpose=purpose)

    def retrieve_file(self, file_id):
        """
        Returns information about a specific file.
        """
        return self.client.files.retrieve(file_id)
    
    def list_file(self):
        """
        Returns a list of OpenAI Files.
        """
        return self.client.files.list()

    def delete_file(self, file_id):
        """
        Delete a file from OpenAI.
        """
        return self.client.files.delete(file_id)
