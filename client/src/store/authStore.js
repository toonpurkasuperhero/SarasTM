import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useAuthStore = create((set, get) => ({
  user: null,
  role: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      set({ user: session.user, loading: false });
    } else {
      set({ user: null, loading: false });
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user || null });
    });
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ user: data.user });
    return data;
  },

  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    return data;
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  setRole: (role) => set({ role }),
}));

export default useAuthStore;
