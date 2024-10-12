from fastapi import FastAPI, HTTPException
from core.chatbot import Chatbot
from services.openai_service import OpenAIService
from config.settings import get_settings
from core.chat_logic_service import ChatLogicService

app = FastAPI()
settings = get_settings()
ai_service = OpenAIService(settings.openai_api_key)
chat_logic = ChatLogicService()
chatbot = Chatbot(ai_service, chat_logic)

@app.post("/chat")
async def chat(prompt: str):
    try:
        response = chatbot.get_response(prompt)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clear_history")
async def clear_history():
    chatbot.clear_history()
    return {"detail": "Chat history cleared."}