import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;

    // プロフィールにハッシュ化したパスワードを保存
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          name,
          email,
          password: hashedPassword
        }]);
      if (profileError) throw profileError;
    }

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (authError) throw authError;

    // プロフィールからハッシュ化されたパスワードを取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, password')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;

    res.json({
      ...authData,
      profile: {
        name: profile.name,
        password: profile.password // ハッシュ化されたパスワードを返す
      }
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// パスワード検証エンドポイント
app.post('/api/auth/verify-password', async (req, res) => {
  const { userId, password } = req.body;
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('password')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(password, profile.password);
    res.json({ isValid });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Reservation endpoints
app.get('/api/reservations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('start_time', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.post('/api/reservations', async (req, res) => {
  const { chairId, userId, startTime, endTime, duration, people } = req.body;
  try {
    const { data, error } = await supabase
      .from('reservations')
      .insert([{
        chair_id: chairId,
        user_id: userId,
        start_time: startTime,
        end_time: endTime,
        duration,
        people
      }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});