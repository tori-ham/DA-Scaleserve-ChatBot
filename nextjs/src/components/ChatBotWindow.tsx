'use client'

import { useEffect, useRef, useState } from "react";
import ChatHistorySideBar from "./ChatHistorySideBar";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatInput from "./ChatInput";
import ModelRoutingView from "./ModelRoutingView";

import { ChatMessage } from "@/types";

export default function ChatBotWindow() {
    const [chatId, setChatId]= useState<number | null>(null);
    const [conversations, setConversations]= useState<any[]>([]);
    const [messages, setMessages]= useState<ChatMessage[]>([]);
    const [currentInput, setCurrentInput]= useState('');
    const [routingInfo, setRoutingInfo]= useState<any | null>(null);
    const [isSending, setIsSending]= useState<boolean>(false);

    useEffect( () => {
        console.log("chatId", chatId)
        if(chatId !== null) {
            fetch(`http://localhost:8081/api/messages/${chatId}`)
            .then( (res) => res.json())
            .then(setMessages)
        }
    }, [chatId]);
    useEffect( () => {
        if(conversations && conversations.length > 0) {
            setChatId(conversations[0].id)
        }
    }, [conversations]);

    const handleNewChat = async () => {
        const res= await fetch('http://localhost:8081/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                {
                    'title': `New Chat ${chatId === null ? 1 : chatId+1}`
                }
            )
        })
        const chat= await res.json()
        setConversations( (prev) => [chat, ...prev] );
        setChatId(chat.id);
        setMessages([]);
        setRoutingInfo(null);
    }

    useEffect( () => {
        fetch('http://localhost:8081/api/chat')
        .then( (res) => res.json() )
        .then( setConversations )
    }, [])

    const appendFormattedText = (text: string) => {
        return text.replace(/\n{2,}/g, '\n\n').replace(/\n/g, '  \n')
    };

    const handleSend= async (e : React.MouseEvent<HTMLButtonElement>) => {
        if(e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        if(!currentInput.trim() || isSending) return
        setIsSending(true)
        try {
            await fetch('http://localhost:8081/api/messages', {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify(
                    {
                        chat_id: chatId,
                        role: 'user',
                        message: currentInput
                    }
                )
            })

            setMessages( (prev) => [
                    ...prev, 
                    { role: 'user', content: currentInput},
                    // { role: 'assistant', isGenerating: true, content: ''},
                    // { role: 'assistant', isGenerating: true, content: 'AI가 답변을 생성하고 있습니다...' }
                ] 
            )

            const eventSource= new EventSource(
                `http://localhost:8081/api/message/stream/${chatId}?prompt=${encodeURIComponent(currentInput)}`
            )
            let assistantContent= '';
            setMessages( prev => [ ...prev, { role: 'assistant', isGenerating: true, content: 'AI가 답변을 생성하고 있습니다...' } ])
            eventSource.onopen= () => {}
            eventSource.onmessage= (e) => {
                try{
                    const maybeRouting= JSON.parse(e.data);
                    if (maybeRouting?.selected_model && maybeRouting?.candidates) {
                        console.log("parsed routing via onmessage fallback", maybeRouting);
                        setMessages( prev => {
                            const updated= [...prev];
                            const lastIndex= updated.length - 1;
                            if(updated[lastIndex]?.role === "assisant") updated[lastIndex].query_routing= maybeRouting;
                            return updated;
                        } );
                    }
                } catch{}

                if (e.data === '[DONE]') {
                    setMessages( (prev) => {
                        const updated= [...prev];
                        const lastIndex= updated.length - 1;
                        if(updated[lastIndex]?.role === "assistant") updated[lastIndex].isGenerating = false;
                        return updated;
                    });
                    eventSource.close()

                    const currentChat= conversations.find((c) => c.id === chatId);
                    if(currentChat.title.startsWith("New Chat ")) {
                        const userMessage= messages[0]
                        const userMsg= new String(userMessage.content ? userMessage.content : userMessage.message)
                        const newTitle= userMsg.slice(0, 20) + (userMsg.length > 20 ? "..." : "");
                        fetch(`http://localhost:8081/api/chat/${chatId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: newTitle })
                        }).then( () => {
                            handleUpdateTitle(chatId!, newTitle)
                        });
                    }
                } else {
                    // setMessages( (prev) => [...prev, { role: 'assistant', content: assistantContent}] )
                    assistantContent += e.data;
                    const formattedContent= appendFormattedText(assistantContent);
                    setMessages( (prev) => {
                        const updated= [...prev];
                        const lastIndex= updated.length - 1;
                        if(updated[lastIndex]?.role === "assistant") 
                            // updated[lastIndex].content = assistantContent
                            updated[lastIndex].content= formattedContent
                        return updated;
                    })
                }
            }
            eventSource.addEventListener('routing', (e) => {
                const routingInfo= JSON.parse(e.data)
                // setRoutingInfo(routing)
                setMessages(
                    (prev) => {
                        const updated= [...prev];
                        const lastIndex= updated.length - 1;
                        if(updated[lastIndex]?.role === "assistant") updated[lastIndex].query_routing= routingInfo;
                        return updated
                    }
                )
            })
            setCurrentInput('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSending(false);
        }
    };

    useEffect( () => {
        console.log("messages", messages);
    }, [messages]);

    const handleUpdateTitle= (id: number, newTitle: string) => {
        setConversations(
            prev => prev.map(conversation => conversation.id === id ? { ...conversation, title: newTitle } : conversation)
        )
    }
    const handleDeleteChat= (id: number) => {
        setConversations(prev => prev.filter(conversation => conversation.id !== id));
    }

    return (
        <div className="flex h-screen">
            <ChatHistorySideBar 
                conversations={conversations}
                onSelect={setChatId}
                currentId={chatId}
                onNewChat={handleNewChat}
                onUpdateTitle={handleUpdateTitle}
                onDeleteChat={handleDeleteChat}
            />
            {
                chatId && chatId > 0 ? (
                    <div className="flex flex-col flex-1 h-full">
                        <div className="flex-grow overflow-y-auto">
                            <ChatMessageBubble messages={messages} />
                        </div>
                        <div className="border-t p-2">
                            <ChatInput
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                onSend={handleSend}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <b>새 대화 생성</b> 버튼을 눌러 대화를 시작해주세요
                    </div>
                )
            }
        </div>
    )
}