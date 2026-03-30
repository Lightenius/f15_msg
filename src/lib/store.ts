import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  createdAt: string;
  edited: boolean;
  author?: User;
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  isVoice: boolean;
}

export interface Server {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  iconUrl?: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

interface ChatStore {
  currentServer: Server | null;
  currentChannel: Channel | null;
  messages: Message[];
  setCurrentServer: (server: Server | null) => void;
  setCurrentChannel: (channel: Channel | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

export const useChat = create<ChatStore>((set) => ({
  currentServer: null,
  currentChannel: null,
  messages: [],
  setCurrentServer: (server) => set({ currentServer: server }),
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
}));
