from abc import ABC, abstractmethod
from typing import List, Dict

class AbstractAIService(ABC):
    @abstractmethod
    async def chat_completion(self, model: str, messages: List[Dict[str, str]]) -> str:
        pass