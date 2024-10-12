import logging
from pythonjsonlogger import jsonlogger

def configure_logging():
    # General log setup
    logger = logging.getLogger("chatbot_project")
    logger.setLevel(logging.INFO)

    # File handler for general logs
    file_handler = logging.FileHandler("chatbot_project.log")
    file_formatter = jsonlogger.JsonFormatter('%(asctime)s %(name)s %(levelname)s %(message)s')
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)

    # Stream handler for console output
    stream_handler = logging.StreamHandler()
    stream_formatter = jsonlogger.JsonFormatter('%(asctime)s %(name)s %(levelname)s %(message)s')
    stream_handler.setFormatter(stream_formatter)
    logger.addHandler(stream_handler)

    # Chat-specific log setup
    chat_logger = logging.getLogger("chat_log")
    chat_logger.setLevel(logging.INFO)
    chat_file_handler = logging.FileHandler("chat.log")
    chat_file_formatter = logging.Formatter('%(asctime)s - %(message)s')
    chat_file_handler.setFormatter(chat_file_formatter)
    chat_logger.addHandler(chat_file_handler)

    return logger, chat_logger