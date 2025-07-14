from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func 
import enum

Base = declarative_base()

class RoleEnum(str, enum.Enum):
    user = "user"
    assistant = "assistant"

class Chat(Base):
    __tablename__ = "chat"
    id = Column(Integer, primary_key = True)
    title = Column(String)
    user_prompt= Column(String)
    created_at = Column(DateTime, server_default= func.now())
    updated_at = Column(DateTime, server_default= func.now())

class ChatMessage(Base):
    __tablename__ = "message"
    id = Column(Integer, primary_key = True)
    chat_id = Column(Integer, ForeignKey("chat.id"))
    role = Column(Enum(RoleEnum))
    message = Column(Text)
    query_routing= Column(JSON)
    created_at = Column(DateTime, server_default= func.now())