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
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Fetch user's servers
  useEffect(() => {
    if (!user) return;

    const fetchServers = async () => {
      const { data, error } = await supabase
        .from('server_members')
        .select('servers(*)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching servers:', error);
        return;
      }

      if (data) {
        const serverList = data.map((item: any) => item.servers).filter(Boolean);
        setServers(serverList);
        if (serverList.length > 0 && !currentServer) {
          setCurrentServer(serverList[0]);
        }
      }
    };

    fetchServers();
    
    // Refetch servers every 2 seconds to catch new ones
    const interval = setInterval(fetchServers, 2000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch channels for current server
  useEffect(() => {
    if (!currentServer) return;

    const fetchChannels = async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('server_id', currentServer.id);

      if (error) {
        console.error('Error fetching channels:', error);
        return;
      }

      if (data) {
        setChannels(data);
        if (data.length > 0 && !currentChannel) {
          setCurrentChannel(data[0]);
        }
      }
    };

    fetchChannels();
  }, [currentServer]);

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim() || !user) return;

    setLoading(true);
    setServerError(null);
    
    try {
      console.log('Creating server for user:', user.id, 'with name:', newServerName);
      
      // Create server
      const { data: serverData, error: serverError } = await supabase
        .from('servers')
        .insert({
          name: newServerName,
          owner_id: user.id,
        })
        .select();

      if (serverError) {
        console.error('Server creation error:', serverError);
        throw new Error(serverError.message || 'Failed to create server');
      }
      if (!serverData || serverData.length === 0) {
        throw new Error('Failed to create server - no data returned');
      }

      const newServer = serverData[0];
      console.log('Server created:', newServer);

      // Add user to server_members
      const { error: memberError } = await supabase
        .from('server_members')
        .insert({
          server_id: newServer.id,
          user_id: user.id,
        });

      if (memberError) {
        console.error('Member add error:', memberError);
        throw new Error(memberError.message || 'Failed to add user to server');
      }

      // Create default channels
      const { error: channelsError } = await supabase.from('channels').insert([
        { server_id: newServer.id, name: 'general', is_voice: false },
        { server_id: newServer.id, name: 'voice-lobby', is_voice: true },
      ]);

      if (channelsError) {
        console.error('Channels creation error:', channelsError);
        throw new Error(channelsError.message || 'Failed to create channels');
      }

      console.log('Server setup complete');
      // Update servers list
      setServers([...servers, newServer]);
      setCurrentServer(newServer);
      setNewServerName('');
      setShowCreateServer(false);
    } catch (err: any) {
      const errorMsg = err?.message || String(err) || 'Unknown error occurred';
      console.error('Error creating server:', errorMsg);
      setServerError(errorMsg);
    }
    setLoading(false);
  };

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
        <button
          onClick={() => setShowCreateServer(true)}
          className="w-12 h-12 rounded-full bg-gray-700 hover:bg-green-600 text-gray-300 hover:text-white font-bold text-xl transition flex items-center justify-center"
          title="Create Server"
        >
          +
        </button>
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
        {currentServer ? (
          <>
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-white font-bold text-lg">{currentServer.name}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {channels.length === 0 ? (
                <div className="text-gray-400 text-sm">No channels yet</div>
              ) : (
                channels.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => setCurrentChannel(channel)}
                    className={`px-4 py-2 rounded cursor-pointer transition ${
                      currentChannel?.id === channel.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {channel.is_voice ? '🎙️' : '#'} {channel.name}
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-center">
              <p className="mb-4">No servers yet</p>
              <button
                onClick={() => setShowCreateServer(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
              >
                Create Server
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {currentChannel && (
          <>
            <div className="border-b border-gray-700 p-4">
              <h1 className="text-white font-bold text-lg">
                {(currentChannel as any).is_voice ? '🎙️' : '#'} {currentChannel.name}
              </h1>
            </div>
            <ChatWindow />
          </>
        )}
        {!currentChannel && currentServer && (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a channel to start chatting
          </div>
        )}
        {!currentServer && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="mb-4">Create or join a server to get started</p>
              <button
                onClick={() => setShowCreateServer(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
              >
                Create Your First Server
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Server Modal */}
      {showCreateServer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Create a Server</h2>
            <form onSubmit={handleCreateServer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Server Name
                </label>
                <input
                  type="text"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  placeholder="My Awesome Community"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                  disabled={loading}
                />
              </div>
              {serverError && (
                <div className="p-3 bg-red-900/50 border border-red-600 rounded text-red-200 text-sm">
                  <p className="font-semibold">Error:</p>
                  <p>{serverError}</p>
                  <p className="text-xs mt-2 opacity-75">Check browser console for more details</p>
                </div>
              )}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateServer(false);
                    setNewServerName('');
                    setServerError(null);
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newServerName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
