import React from 'react';
import { ChatInputProps } from '@/types';

export default function ChatInput(props : ChatInputProps) {
    const {
        value,
        onChange,
        onSend
    } = props;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            onSend()
        }
    }

    return (
        <div className="p-2 flex items-center">
            <textarea
                className="flex-1 border rounded p-2 mr-2"
                placeholder="무엇이든 물어보세요"
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
            />
            <button
                type="button"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={(e) => onSend(e)}
            >
                Send
            </button>
        </div>
    )
}