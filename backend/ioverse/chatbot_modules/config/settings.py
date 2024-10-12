import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    openai_api_key: str

    class Config:
        env_file = ".env"

def get_settings() -> Settings:
    return Settings()