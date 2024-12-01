from chatbot_modules.core.chatbot import Chatbot
from chatbot_modules.services.openai_service import OpenAIService
from chatbot_modules.core.chat_logic_service import ChatLogicService
from chatbot_modules.config.settings import get_settings

class TaskGeneratorService:
    """
    AI-powered task generator.
    
    Can generate three types of tasks:
    - System Instruction for a gpt model
    - Function tool for Assistant API ( compatible also with Chat Completions API )
    - Json Schema response format for Assistant API ( compatible also with Chat Completions API )
    """
    def __init__(self) -> None:
        """
        Initializes a Chatbot instance for task generation.
        
        - Default model: chatgpt-4o-latest
        """
        settings = get_settings()
        key = settings.openai_api_key
        openai_service = OpenAIService(api_key=key)
        sys_instructions = (
            "You are an AI assistant specialized in generating system instructions for other AI assistants. "
            "Your task is to translate a user's high-level requirements into precise, machine-readable system instructions. "
            "Ensure that the output directly addresses the Assistant role with second-person language."
            "The output must explicitly define the Assistant's purpose, scope, and behavior based on the user's prompt. "
            "Follow these guidelines:\n"
            "- Begin the instruction by specifying the Assistant's identity and role.\n"
            "- Clearly outline what the Assistant can and cannot do, providing explicit instructions.\n"
            "- Tailor the instructions for use with OpenAI's GPT models, ensuring clarity, relevance, and consistency.\n"
            "- You must respond with a single, complete message. No further follow-up messages are allowed.\n"
            "- Respond in plain text, without using an type of formatting, and don't be too verbose."
            "Always prioritize direct, unambiguous language to make the instructions actionable and effective."
        )

        chat_logic_service = ChatLogicService(system_instructions = sys_instructions)
        msg_history = chat_logic_service.prepare_initial_history()  # not required, but for ease of access for future tasks
        
        self.chatbot = Chatbot(
            ai_service=openai_service,
            chat_logic=chat_logic_service,
            model="chatgpt-4o-latest",
            history=msg_history,
        )
    
    def generate_system_instructions(self, prompt):
        """
        Generates System Instructions for a OpenAI Assistant API / Chat Completions API-compatible 
        model given an user prompt
        """
        return self.chatbot.get_response(prompt)