'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useChat, useAuth } from '@/lib/store';
import { MessageBubble } from './MessageBubble';

export function ChatWindow() {
  const currentChannel = useChat((state) => state.currentChannel);
  const messages = useChat((state) => state.messages);
  const setMessages = useChat((state) => state.setMessages);
  const addMessage = useChat((state) => state.addMessage);
  const user = useAuth((state) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentChannel) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, author:profiles(id, username, avatar_url)')
        .eq('channel_id', currentChannel.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(
          data.map((msg: any) => ({
            id: msg.id,
            channelId: msg.channel_id,
            authorId: msg.author_id,
            content: msg.content,
            createdAt: msg.created_at,
            edited: msg.edited,
            author: msg.author,
          }))
        );
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`channel:${currentChannel.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${currentChannel.id}`,
        },
        (payload) => {
          if (payload.new) {
            addMessage({
              id: payload.new.id,
              channelId: payload.new.channel_id,
              authorId: payload.new.author_id,
              content: payload.new.content,
              createdAt: payload.new.created_at,
              edited: payload.new.edited,
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentChannel, setMessages, addMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentChannel) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a channel to start chatting
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.authorId === user?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput channelId={currentChannel.id} />
    </div>
  );
}

function MessageInput({ channelId }: { channelId: string }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useAuth((state) => state.user);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setLoading(true);
    const { error } = await supabase.from('messages').insert({
      channel_id: channelId,
      author_id: user.id,
      content: content.trim(),
    });

    if (!error) {
      setContent('');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSend} className="border-t border-gray-700 p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
}
