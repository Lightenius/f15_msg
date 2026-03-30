'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth, useChat } from '@/lib/store';
import { ChatWindow } from './ChatWindow';
import { signOut } from '@/lib/auth';

export function Dashboard() {
  const user = useAuth((state) => state.user);
  const currentServer = useChat((state) => state.currentServer);
  const currentChannel = useChat((state) => state.currentChannel);
  const setCurrentServer = useChat((state) => state.setCurrentServer);
  const setCurrentChannel = useChat((state) => state.setCurrentChannel);
  const [servers, setServers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);

  // Fetch user's servers
  useEffect(() => {
    if (!user) return;

    const fetchServers = async () => {
      const { data } = await supabase
        .from('server_members')
        .select('servers(*)')
        .eq('user_id', user.id);

      if (data) {
        const serverList = data.map((item: any) => item.servers).filter(Boolean);
        setServers(serverList);
        if (serverList.length > 0 && !currentServer) {
          setCurrentServer(serverList[0]);
        }
      }
    };

    fetchServers();
  }, [user, currentServer, setCurrentServer]);

  // Fetch channels for current server
  useEffect(() => {
    if (!currentServer) return;

    const fetchChannels = async () => {
      const { data } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', currentServer.id);

      if (data) {
        setChannels(data);
        if (data.length > 0 && !currentChannel) {
          setCurrentChannel(data[0]);
        }
      }
    };

    fetchChannels();
  }, [currentServer, currentChannel, setCurrentChannel]);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Server Sidebar */}
      <div className="w-20 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 space-y-4">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-blue-700 transition">
          B
        </div>
        <div className="border-t border-gray-700 w-full"></div>
        {servers.map((server) => (
          <div
            key={server.id}
            onClick={() => setCurrentServer(server)}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold cursor-pointer transition ${
              currentServer?.id === server.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {server.name.charAt(0).toUpperCase()}
          </div>
        ))}
        <div className="flex-1"></div>
        <button
          onClick={handleLogout}
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold transition"
        >
          ←
        </button>
      </div>

      {/* Channel Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {currentServer && (
          <>
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-white font-bold text-lg">{currentServer.name}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => setCurrentChannel(channel)}
                  className={`px-4 py-2 rounded cursor-pointer transition ${
                    currentChannel?.id === channel.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  # {channel.name}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {currentChannel && (
          <>
            <div className="border-b border-gray-700 p-4">
              <h1 className="text-white font-bold text-lg">
                # {currentChannel.name}
              </h1>
            </div>
            <ChatWindow />
          </>
        )}
      </div>
    </div>
  );
}
