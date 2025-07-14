import React, { useState } from 'react';
import { SidebarProps } from '@/types';

export default function ChatHistorySideBar(props : SidebarProps) {
    const {
        conversations,
        currentId,
        onSelect,
        onNewChat,
        onUpdateTitle,
        onDeleteChat
    } = props;

    const [editingId, setEditingId]= useState<number|null>(null);
    const [editingTitle, setEditingTitle]= useState<string>('');
    const [showDropdownId, setShowDropdownId]= useState<number|null>(null);

    const handleEditClick= (id: number, title: string) => {
        setEditingId(id);
        setEditingTitle(title);
    }

    const handleEditSubmit= async () => {
        setShowDropdownId(null);
        if (!editingId)  return;
        await fetch(`http://localhost:8081/api/chat/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({title: editingTitle})
        })
        onUpdateTitle(editingId, editingTitle);
        setEditingId(null);
        setEditingTitle('');
        // location.reload();
    }

    const handleDelete= async(id: number) => {
        setShowDropdownId(null);
        const confirmed= window.confirm('해당 대화를 삭제하시겠습니까?');
        if(confirmed) {
            await fetch(`http://localhost:8081/api/chat/${id}`, {
                method: 'DELETE',
            });
            // location.reload()
            onDeleteChat(id);
        }
    }

    return (
        <div className="w-64 bg-gray-100 p-4 overflow-y-auto border-r">
            <div>
                <button 
                    onClick={onNewChat} 
                    className="cursor-pointer"
                >
                    <b>새 대화 생성</b>
                </button>
            </div>
            <ul>
                {
                    conversations.map( (conversation) => (
                        <li
                            key={conversation.id}
                            className={`p-2 rounded cursor-pointer hover:bg-gray-200 ${ currentId === conversation.id ? `bg-blue-200 font-semibold` : `` }`}
                            onClick={() => onSelect(conversation.id)}
                        >
                            <div className="flex justify-between items-center">
                                <span className="cursor-pointer" onClick={() => onSelect(conversation.id)}>
                                    {
                                        conversation.title || `Chat ${conversation.id}`
                                    }
                                </span>
                                <div className="relative">
                                    <button onClick={() => setShowDropdownId(prev => prev === conversation.id ? null : conversation.id)}>
                                        ...
                                    </button>
                                    {
                                        showDropdownId === conversation.id && (
                                            <div className="absolute right-0 mt-1 w-28 bg-white border rounded shadow z-10">
                                                <button
                                                    className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm"
                                                    onClick={() => handleEditClick(conversation.id, conversation.title)}
                                                >
                                                    제목 수정
                                                </button>
                                                <button
                                                    className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm text-red-600"
                                                    onClick={() => handleDelete(conversation.id)}
                                                >
                                                    대화 삭제
                                                </button>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </li>
                    ))
                }
            </ul>

            {
                editingId !== null && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50">
                        <div className="bg-white p-4 rounded shadow w-80">
                            <h3 className="text-lg font-bold mb-2">
                                제목 수정
                            </h3>
                            <input className="w-full border px-2 py-1 mb-3"
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)} />
                            <div className="flex justify-end gap-2">
                                <button className='px-3 py-1 bg-gray-300 rounded hover:bg-gray-400'
                                    onClick={ () => setEditingId(null)}>
                                    삭제하기
                                </button>
                                <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    onClick={handleEditSubmit}
                                >
                                    수정하기
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}