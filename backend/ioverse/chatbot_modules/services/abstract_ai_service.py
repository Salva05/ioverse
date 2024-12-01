from abc import ABC, abstractmethod
from typing import List, Dict, Union, Type, Any
from pydantic import BaseModel

class AbstractAIService(ABC):
    @abstractmethod
    def chat_completion(self, model: str, messages: List[Dict[str, str]]) -> str:
        pass
    @abstractmethod
    def structured_output(
        self, 
        model: str, 
        messages: List[Dict[str, str]],
        response_format: Union[Type[BaseModel], Dict],
        **kwargs
    ) -> Any:
        pass