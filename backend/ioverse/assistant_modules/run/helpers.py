import openai
import logging
from functools import wraps

logger = logging.getLogger(__name__)

def handle_errors(func):
    """
    Decorator to handle OpenAI API errors.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except openai.APIConnectionError as e:
            logger.error(f"Failed to connect to OpenAI API: {e}")
            raise
        except openai.APITimeoutError as e:
            logger.error(f"Request timed out: {e}")
            raise
        except openai.AuthenticationError as e:
            logger.error(f"Authentication error: {e}")
            raise
        except openai.BadRequestError as e:
            logger.error(f"Invalid request: {e}")
            raise
        except openai.InternalServerError as e:
            logger.error(f"Internal server error: {e}")
            raise
        except openai.RateLimitError as e:
            logger.error(f"Rate limit exceeded: {e}")
            raise
        except Exception as e:
            logger.error(f"An unexpected error occurred: {e}")
            raise
    return wrapper

def clean(kwargs):
    """
    Filters out None values from a given dictionary.
    """
    return {key: value for key, value in kwargs.items() if value is not None}