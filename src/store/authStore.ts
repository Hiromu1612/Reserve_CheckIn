import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  isGuest: boolean;
  password?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  guestLogin: () => void;
  logout: () => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  signup: async (email: string, password: string, name: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('weak_password')) {
          throw new Error('パスワードは4文字以上で入力してください');
        }
        throw signUpError;
      }

      if (authData.user) {
        // プロフィールの作成（パスワードも保存）
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name,
              email,
              password // パスワードを保存
            },
          ]);

        if (profileError) throw profileError;

        set({
          user: {
            id: authData.user.id,
            email: authData.user.email!,
            name,
            password,
            isGuest: false,
          },
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('メールアドレスまたはパスワードが正しくありません');
        }
        throw error;
      }

      if (user) {
        // プロフィールとパスワードの取得
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, password')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        set({
          user: {
            id: user.id,
            email: user.email!,
            name: profile.name,
            password: profile.password,
            isGuest: false,
          },
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  guestLogin: () => {
    const guestUser = {
      id: `guest-${Date.now()}`,
      email: '',
      name: 'ゲスト',
      isGuest: true,
    };
    set({ user: guestUser });
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  verifyPassword: async (password: string) => {
    const { user } = get();
    if (!user || !user.id) return false;

    try {
      const response = await api.auth.verifyPassword(user.id, password);
      return response.isValid;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }
}));