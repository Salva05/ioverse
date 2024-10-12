from typing import List, Dict

class ChatLogicService:
    def __init__(self):
        self.default_system_message = {"role": "system", "content": "You are a helpful assistant responsible for fulfilling users' requests."}

    def prepare_initial_history(self) -> List[Dict[str, str]]:
        return [self.default_system_message]

    def append_user_message(self, history: List[Dict[str, str]], prompt: str) -> List[Dict[str, str]]:
        history.append({"role": "user", "content": prompt})
        return history

    def append_assistant_message(self, history: List[Dict[str, str]], response: str) -> List[Dict[str, str]]:
        history.append({"role": "assistant", "content": response})
        return history