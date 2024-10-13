import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

load_dotenv()

class Settings(BaseSettings):
    openai_api_key: str

    model_config = ConfigDict(
        extra='ignore',  # Ignore extra fields
        env_file='.env',
    )

def get_settings() -> Settings:
    return Settings()