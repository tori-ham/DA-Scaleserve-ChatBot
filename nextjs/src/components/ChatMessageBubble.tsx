'use client'

import React, { useEffect, useRef, useState } from 'react';
import { ChatWindowProps, ChatMessage, ModelRoutingCandidate } from '@/types';
import ReactMarkDown from 'react-markdown';

export default function ChatMessageBubble(props : ChatWindowProps) {
    const {
        messages
    } = props;
    const bottomRef= useRef<HTMLDivElement|null>(null);
    const [routingOpenMap, setRoutingOpenMap] = useState<Record<number, boolean>>({});

    const toggleRoutingMap = (index: number) => {
        setRoutingOpenMap(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }

    useEffect( () => {
        bottomRef.current?.scrollIntoView(
            {
                behavior: 'smooth'
            }
        )
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 bg-white">
            {
                messages.map( (message, index) => {
                    const isUser= message.role === 'user';
                    const routing= message.query_routing ? message.query_routing : message.routing;
                    // const [showRouting, setShowRouting]= useState<boolean>(false);

                    return (
                        <div
                            key={`message-${index}`}
                            className={`mb-2 p-2 rounded max-w-xl ${
                                message.role === "user" ? `bg-blue-100 self-end ml-auto text-right` : `bg-gray-100 self-start mr-auto text-left`
                            }`}
                        >
                            <div 
                                className={`text-sm text-gray-700 whitespace-pre-wrap ${
                                    message.isGenerating && message.content === 'AI가 답변을 생성하고 있습니다...' ? `animate-pulse bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent fomt-semibold` 
                                    : ``
                                }`}
                            >
                                {
                                    message.isGenerating 
                                    ? <div className="text-sm whitespace-pre-wrap">{ message.content }</div> 
                                    : <ReactMarkDown 
                                        skipHtml={false} 
                                        components={{
                                            p: ({children}) => (
                                                <p style={{ whiteSpace: 'pre-line', marginBottom: '1em' }}>{children}</p>
                                            )
                                        }}
                                    >
                                        {
                                            message.message ? message.message : message.content
                                        }
                                        </ReactMarkDown>
                                }
                                {/* <ReactMarkDown>
                                    {
                                        message.message ? message.message : message.content
                                    }
                                </ReactMarkDown> */}
                            </div>

                            {
                                !isUser && routing?.selected_model && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                Selected Model : { routing.selected_model }
                                            </div>
                                            <button
                                                className="text-blue-600 underline text-xs ml-2"
                                                onClick={() => toggleRoutingMap(index)}
                                            >
                                                {
                                                    // showRouting ? `Hide Scores` : `Show Scores`
                                                    routingOpenMap[index] ? `Hide Scores` : `Show Scores`
                                                }
                                            </button>
                                        </div>

                                        {
                                            routingOpenMap[index] && (
                                                <div className="mt-1 border border-gray-300 rounded p-2 bg-white shadow text-gray-600">
                                                    <div className="font-semibold text-xs mb-1">
                                                        Candidate Scores
                                                    </div>
                                                    <ul className="text-xs list-disc ml-4">
                                                        {
                                                            routing.grades?.map( (c: ModelRoutingCandidate) => (
                                                                <li key={c.model}>
                                                                    <div className="">
                                                                        {c.model}
                                                                    </div>
                                                                    <div className="">
                                                                        Score: {c.score.toFixed(1)}
                                                                    </div>    
                                                                    <div className="">
                                                                        Grade Label: {c.grade_label}
                                                                    </div>
                                                                    <div className="">
                                                                        Grade Value: {c.grade_value}
                                                                    </div>
                                                                    {/* {c.model} : {(c.score * 100).toFixed(1)}% */}
                                                                </li>
                                                            ))
                                                        }
                                                    </ul>
                                                </div>
                                            )
                                        }
                                    </div>
                                )
                            }
                        </div>
                    )
                } )
            }
            <div ref={bottomRef} />
        </div>
    )
}
