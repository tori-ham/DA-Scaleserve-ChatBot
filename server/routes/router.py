from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select, desc
from sqlalchemy.orm import joinedload

from db.database import async_session
from db.models import Chat, ChatMessage, RoleEnum
from schemas.chat import CreateChat, CreateChatMessage, UpdateChatTitle

from openai import OpenAI
import os
import json

router = APIRouter()

llm_client= OpenAI(
    base_url= "https://api.deepauto.ai/openai/v1",
    api_key= os.getenv("DEEPAUTO_API_KEY")
)

@router.post("/chat")
async def create_chat(data: CreateChat):
    async with async_session() as session:
        chat= Chat(title= data.title)
        session.add(chat)
        await session.commit()
        await session.refresh(chat)
        return chat

@router.get("/chat")
async def list_chat():
    async with async_session() as session:
        result= await session.execute(
            select(Chat).order_by(desc(Chat.created_at))
        )
        return result.scalars().all()
@router.patch("/chat/{chat_id}")
async def edit_title(chat_id: int, body: UpdateChatTitle):
    async with async_session() as session:
        result= await session.execute(select(Chat).where(Chat.id == chat_id))
        chatItem= result.scalar_one_or_none()
        if not chatItem:
            raise HTTPException(status_code = 404, detail= "Chat Not Found")
        chatItem.title= body.title
        await session.commit()
        return {
            "message": "Chat Title Updated",
            "chat_id": chatItem.id,
            "title": chatItem.title
        }
@router.delete("/chat/{chat_id}")
async def delete_chat(chat_id: int):
    async with async_session() as session:
        result= await session.execute(select(Chat).where(Chat.id == chat_id))
        chatItem= result.scalar_one_or_none()
        if not chatItem:
            raise HTTPException(status_code = 404, detail= "Chat Not Found")
        await session.execute(
            ChatMessage.__table__.delete().where(ChatMessage.chat_id == chat_id)
        )
        await session.delete(chatItem)
        await session.commit()
        return {
            "message": "Chat Deleted",
            "chat_id": chat_id
        }

@router.get("/messages/{chat_id}")
async def get_messages(chat_id: int):
    async with async_session() as session:
        result= await session.execute(
            select(ChatMessage).where(ChatMessage.chat_id == chat_id)
        )
        return result.scalars().all()

@router.post("/messages")
async def create_message(data: CreateChatMessage):
    async with async_session() as session:
        chat_message= ChatMessage(**data.dict())
        session.add(chat_message)
        await session.commit()
        await session.refresh(chat_message)
        return chat_message

@router.get("/message/stream/{chat_id}")
async def stream_chat(chat_id: int, prompt: str):
    async def generate():
        async with async_session() as session:
            result= await session.execute(
                select(ChatMessage).where(ChatMessage.chat_id == chat_id).order_by(ChatMessage.created_at)
            )
            messages= result.scalars().all()
        
        context_messages= [
            {
                "role": "system", 
                "content": "You are a helpful assistant"
            }
        ]
        for msg in messages:
            context_messages.append(
                {
                    "role": msg.role.value,
                    "content": msg.message
                }
            )
        context_messages.append(
            {
                "role": "user",
                "content": prompt
            }
        )
        
        chat_stream= llm_client.chat.completions.create(
            model= "openai/gpt-4o-mini-2024-07-18,deepauto/qwq-32b",
            messages= context_messages,
            stream= True
        )
        query_routing_sent= False
        query_routing_data= None
        full_response= ""
        
        for chunk in chat_stream:
            delta= chunk.choices[0].delta
            if not query_routing_sent and hasattr(chunk, "query_routing"):
                query_routing_data= chunk.query_routing
                yield f"event: routing\n"
                yield f"data: {json.dumps(chunk.query_routing)}\n\n"
                query_routing_sent= True
            if delta and delta.content:
                yield f"data: {delta.content}\n\n"
                full_response += delta.content
        async with async_session() as session:
            message= ChatMessage(
                chat_id= chat_id,
                role= RoleEnum.assistant,
                message= full_response,
                query_routing= query_routing_data
            )
            session.add(message)
            await session.commit()
        yield f"data: [DONE]\n\n"
    return StreamingResponse(generate(), media_type= "text/event-stream")