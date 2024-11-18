from assistant_modules.common.models import ResponseFormatType

from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel

def serialize_pydantic_list(pydantic_list: Optional[List[BaseModel]]) -> Optional[List[Dict[str, Any]]]:
    """
    Serializes a list of Pydantic model instance into a Python-serializable dictionary.
    """
    if pydantic_list:
        return [item.model_dump(exclude_none=True) for item in pydantic_list]
    return []

def serialize_response_format(response_format: ResponseFormatType) -> Union[str, Dict[str, Any]]:
    if isinstance(response_format, BaseModel):
        return response_format.model_dump()
    return response_format

def serialize_pydantic_model(pydantic_model: Optional[BaseModel]) -> Optional[Dict[str, Any]]:
    """
    Serializes a single Pydantic model instance into a Python-serializable dictionary.
    """
    if pydantic_model:
        # exclude_none=True omits fields with None values
        serialized = pydantic_model.model_dump(exclude_none=True)
        return serialized if serialized else {}
    return {}

