'use client';

import { Message } from '@/lib/store';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const date = new Date(message.createdAt);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs rounded-lg px-4 py-2 ${
          isOwn
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-100'
        }`}
      >
        {!isOwn && (
          <div className="text-xs font-semibold text-gray-200">
            {message.author?.username || 'Unknown'}
          </div>
        )}
        <p className="text-sm break-words">{message.content}</p>
        <div className="text-xs opacity-70 mt-1">{time}</div>
      </div>
    </div>
  );
}
