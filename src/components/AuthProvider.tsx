'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuth((state) => state.setUser);
  const setLoading = useAuth((state) => state.setLoading);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profile) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || '',
            username: profile.username,
            displayName: profile.display_name,
            avatarUrl: profile.avatar_url,
          });
        }
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              username: profile.username,
              displayName: profile.display_name,
              avatarUrl: profile.avatar_url,
            });
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return <>{children}</>;
}
