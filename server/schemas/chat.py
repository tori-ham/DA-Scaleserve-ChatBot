from pydantic import BaseModel
from enum import Enum

class RoleEnum(str, Enum):
    user= "user"
    assistant= "assistant"

class CreateChat(BaseModel):
    title: str

class CreateChatMessage(BaseModel):
    chat_id: int
    role: RoleEnum
    message: str
    
class UpdateChatTitle(BaseModel):
    title: str