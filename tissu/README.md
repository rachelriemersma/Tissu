# Tissu

Tissu is a mobile app that helps you understand what your clothes are made of. Scan a garment's care label with your camera or paste a product URL, and Tissu breaks down the fiber composition, durability, and sustainability of the fabric using AI-powered analysis (Claude vision API).

## Features

- **Label scanning** — Point your camera at a clothing label to instantly analyze fiber content
- **URL analysis** — Paste a product link to pull composition data from online listings
- **Fiber breakdown** — Visual bar chart of the fiber blend with descriptions of each material
- **Durability & sustainability scores** — AI-generated ratings with summary tags
- **Scan history** — All past scans saved to your account
- **Wishlist** — Heart items from results or the Explore feed to save them
- **Explore** — Curated editorial picks and product collections
- **Learn** — Educational articles about fabrics and materials
- **Profile** — Editable profile with display name, username, bio, and avatar

## Tech stack

- **Framework**: React Native + Expo (SDK 54) with Expo Router (file-based routing)
- **Language**: TypeScript
- **Backend**: Supabase (auth, Postgres database, storage)
- **AI**: Anthropic Claude API (vision for label scanning, text for URL analysis)
- **Fonts**: Cormorant Garamond (serif) + DM Sans (sans-serif)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — installed automatically via npx
- A [Supabase](https://supabase.com/) project
- An [Anthropic](https://console.anthropic.com/) API key

## Getting started

1. **Clone the repo and navigate into the project**

   ```bash
   cd tissu
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `tissu/` directory (or edit the existing one):

   ```
   EXPO_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_api_key
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase tables**

   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- Scans table
   create table if not exists scans (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users(id) on delete cascade not null,
     type text not null,
     result_json jsonb not null,
     created_at timestamptz default now()
   );
   alter table scans enable row level security;
   create policy "Users can manage own scans" on scans
     for all using (auth.uid() = user_id);

   -- Wishlist table
   create table if not exists wishlist (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references auth.users(id) on delete cascade not null,
     item_data_json jsonb not null,
     created_at timestamptz default now()
   );
   alter table wishlist enable row level security;
   create policy "Users can manage own wishlist" on wishlist
     for all using (auth.uid() = user_id);

   -- Profiles table
   create table if not exists profiles (
     user_id uuid primary key references auth.users(id) on delete cascade,
     display_name text not null,
     username text unique not null,
     avatar_url text,
     bio text
   );
   alter table profiles enable row level security;
   create policy "Users can read own profile" on profiles
     for select using (auth.uid() = user_id);
   create policy "Users can upsert own profile" on profiles
     for all using (auth.uid() = user_id);
   ```

5. **Create an `avatars` storage bucket**

   In your Supabase dashboard, go to **Storage** → **New bucket** → name it `avatars` and set it to **Public**.

6. **Start the app**

   ```bash
   npx expo start
   ```

   Then open in:
   - Expo Go on your phone (scan the QR code)
   - iOS Simulator (`i`)
   - Android Emulator (`a`)

## Project structure

```
app/
  (tabs)/          Tab screens (Explore, Search/Camera, Learn, Account)
  auth/            Login, signup, forgot password
  onboarding/      First-launch onboarding flow
  explore/[id]     Explore collection detail
  learn/[slug]     Learn article detail
  results          Scan/URL analysis results
  edit-profile     Edit profile screen
constants/         Theme (colors, fonts, spacing)
hooks/             Custom hooks (scan history)
lib/               Supabase client, scan context, types
```
