'use client';

import { useAuth } from '@/lib/store';
import { Login } from '@/components/Login';
import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  const user = useAuth((state) => state.user);
  const loading = useAuth((state) => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
}
