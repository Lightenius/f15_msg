import { supabase } from './supabase';

export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user, error };
}

export async function updateProfile(
  userId: string,
  {
    username,
    displayName,
    avatarUrl,
  }: {
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  }
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...(username && { username }),
      ...(displayName && { display_name: displayName }),
      ...(avatarUrl && { avatar_url: avatarUrl }),
    })
    .eq('id', userId)
    .select();

  return { data, error };
}
