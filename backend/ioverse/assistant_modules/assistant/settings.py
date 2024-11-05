import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

load_dotenv()

class AssistantSettings(BaseSettings):
    openai_api_key: str
    openai_api_base_url: str = 'https://api.openai.com/v1/'
    openai_api_version: str = 'v1'
    
    model_config = ConfigDict(
        extra='ignore',
        env_file='.env',
    )

def get_settings() -> AssistantSettings:
    return AssistantSettings()
