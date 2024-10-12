from core.chatbot import Chatbot
from services.openai_service import OpenAIService
from config.settings import get_settings
from core.chat_logic_service import ChatLogicService
from utils.logging_config import configure_logging

# Configure logging
logger, chat_logger = configure_logging()

def main():
    """
    Example usage of chatbot in command-line interface.
    """
    settings = get_settings()
    ai_service = OpenAIService(settings.openai_api_key)
    chat_logic = ChatLogicService()
    chatbot = Chatbot(ai_service, chat_logic)

    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break
        elif user_input.lower() == "clear":
            chatbot.clear_history()
            print("Chat history cleared.")
            continue

        response = chatbot.get_response(user_input)
        print(f"Chatbot: {response}")

if __name__ == "__main__":
    main()