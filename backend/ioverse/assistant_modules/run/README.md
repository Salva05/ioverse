## Run Entity and Usage

The `Run` entity and its related components follow a schema specific to OpenAI Assistant's Run Structure, differing from other Assistant entities in this module. Unlike other models, the `Run` and `RunStep` entities does not need to be included as models in the application. Instead, it serves as a mapping layer, linking the application to the available instruments within OpenAI Assistant's Run domain.

### Usage of Run and Run Step Entities

The `Run` and `RunStep` entities are standalone classes that require an API key to be provided upon instantiation.

Each method in these classes accepts a dictionary of keyword arguments (`**kwargs`). Some keyword arguments are mandatory, as per the API’s requirements, and are handled internally within the class methods.

### Error Handling

Error handling is managed by a custom decorator defined in `helpers.py`. This decorator centralizes error management, but any additional error handling may be needed at the calling point of the method, based on specific application needs.