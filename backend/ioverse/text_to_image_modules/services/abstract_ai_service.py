from abc import ABC, abstractmethod
from typing import Dict, Any

class AbstractAIService(ABC):
    @abstractmethod
    def generate_image(self, prompt: str, **kwargs) -> Dict[str, Any]:
        pass