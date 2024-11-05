# core/client.py

import openai
from ioverse.assistant_modules.assistant.settings import AssistantSettings

settings = AssistantSettings()

openai.api_key = settings.openai_api_key
openai.api_base = settings.openai_api_base_url

# client.py will initialize the OpenAI client
