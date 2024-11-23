from openai import OpenAI

class VectorStoreClient:
    def __init__(self):
        self.client = OpenAI()
    
    # Vector Stores
    def create_vector_store(self, **kwargs):
        return self.client.beta.vector_stores.create(**kwargs)
    
    def list_vector_stores(self, **params):
        return self.client.beta.vector_stores.list(**params)
    
    def retrieve_vector_store(self, vector_store_id):
        return self.client.beta.vector_stores.retrieve(vector_store_id)
    
    def update_vector_store(self, vector_store_id, **kwargs):
        return self.client.beta.vector_stores.update(vector_store_id, **kwargs)
    
    def delete_vector_store(self, vector_store_id):
        return self.client.beta.vector_stores.delete(vector_store_id)
    
    # Vector Store Files
    def create_vector_store_file(self, **kwargs):
        return self.client.beta.vector_stores.files.create(**kwargs)
    
    def list_vector_store_files(self, vector_store_id, **params):
        return self.client.beta.vector_stores.files.list(vector_store_id, **params)
    
    def retrieve_vector_store_file(self, vector_store_id, file_id):
        return self.client.beta.vector_stores.files.retrieve(vector_store_id, file_id)
    
    def delete_vector_store_file(self, vector_store_id, file_id):
        return self.client.beta.vector_stores.files.delete(vector_store_id, file_id)
    
    # Vector Store File Batches
    def create_vector_store_file_batch(self, **kwargs):
        return self.client.beta.vector_stores.file_batches.create(**kwargs)
    
    def retrieve_vector_store_file_batch(self, vector_store_id, batch_id):
        return self.client.beta.vector_stores.file_batches.retrieve(vector_store_id=vector_store_id, batch_id=batch_id)
    
    def cancel_vector_store_file_batch(self, vector_store_id, batch_id):
        return self.client.beta.vector_stores.file_batches.cancel(vector_store_id, batch_id)
    
    def list_vector_store_file_batch_files(self, vector_store_id, batch_id, **params):
        return self.client.beta.vector_stores.file_batches.list_files(vector_store_id, batch_id, **params)
