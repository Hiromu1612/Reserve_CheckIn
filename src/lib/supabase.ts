import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// メール認証の設定
export const configureAuth = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const { data, error } = await supabase.auth.config({
        autoConfirm: true, // 開発中は自動確認を有効に
      });
      
      if (error) {
        console.error('Auth configuration error:', error);
      }
    }
  } catch (error) {
    console.error('Auth initialization error:', error);
  }
};

export type ReservationType = {
  id: string;
  chair_id: number;
  user_id: string;
  user_name: string;
  start_time: string;
  end_time: string;
  duration: number;
  people: number;
  password: string;
  created_at: string;
};