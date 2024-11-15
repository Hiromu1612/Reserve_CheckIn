# マッサージチェア予約システム

## 環境設定

1. `.env`ファイルを作成し、以下の環境変数を設定してください：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

2. Supabaseプロジェクトで以下のテーブルを作成してください：

```sql
create table reservations (
  id uuid default uuid_generate_v4() primary key,
  chair_id integer not null,
  user_id uuid references auth.users(id),
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  duration integer not null,
  people integer not null default 1,
  password text,
  created_at timestamp with time zone default now()
);

-- インデックスの作成
create index reservations_chair_id_idx on reservations(chair_id);
create index reservations_user_id_idx on reservations(user_id);
create index reservations_start_time_idx on reservations(start_time);
```

## 開発の始め方

1. 依存関係のインストール:
```bash
npm install
```

2. 開発サーバーの起動:
```bash
npm run dev
```

## 機能

- ユーザー認証（メール/パスワード、ゲストログイン）
- マッサージチェアの予約
- 予約の修正・キャンセル
- チェックイン/チェックアウト
- 料金計算と支払い