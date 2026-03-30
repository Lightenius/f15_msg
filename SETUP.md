# BisCord - Serverless Discord Clone Setup Guide

## Quick Setup

### 1. **Prerequisites**
- Node.js 18+ installed
- npm or yarn package manager
- A [Supabase](https://supabase.com) account (free)

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Create Supabase Project**

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for project to be ready
4. Go to **Settings** → **API** section
5. Copy your:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **Anon Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 4. **Configure Environment Variables**

Create `.env.local` in the project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. **Initialize Database**

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire content from `src/lib/database.sql`
4. Paste into the editor
5. Click **Run**

This will create:
- Database tables (profiles, servers, channels, messages, etc.)
- Row Level Security (RLS) policies
- Indexes for performance

### 6. **Create Auth Users Trigger** (Important!)

Still in SQL Editor, run this query to automatically create profiles when users sign up:

```sql
-- Create trigger for new user profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.email);
  return new;
end;
$$;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 7. **Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and test signing up!

## Features Currently Implemented

- ✅ User authentication (sign up/sign in)
- ✅ Real-time messaging
- ✅ Multiple servers and channels
- ✅ Dark-themed UI
- ✅ Server & channel sidebar navigation
- ✅ Message persistence
- ✅ Auto-scrolling to latest messages

## Features to Implement

- 📧 Email verification
- 👤 User profiles + avatars
- 🎙️ Voice channels (integrate LiveKit)
- 📁 File uploads (Supabase Storage)
- 🔔 Typing indicators
- 😊 Message reactions
- 🔍 Message search
- 🚀 Deployment to Vercel

## Project Structure

```
biscord/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Home page / login
│   │   └── globals.css
│   ├── components/
│   │   ├── AuthProvider.tsx      # Auth context provider
│   │   ├── ChatWindow.tsx        # Main chat area
│   │   ├── Dashboard.tsx         # Main layout
│   │   ├── Login.tsx             # Login/signup form
│   │   └── MessageBubble.tsx     # Message display
│   └── lib/
│       ├── supabase.ts           # Supabase client
│       ├── auth.ts               # Auth helper functions
│       ├── store.ts              # Zustand state
│       └── database.sql          # Database schema
├── .env.local                    # Your credentials (git ignored)
├── .env.example                  # Template
└── README.md
```

## Database Schema

### profiles
- User profiles with username, display name, avatar
- Automatically created on signup

### servers
- Discord-like communities/servers
- Each has an owner and multiple channels

### channels
- Text channels within servers
- Can be marked as voice channels

### messages
- All channel messages
- Real-time synchronized via Supabase

### server_members
- Many-to-many relationship between servers and users
- User can join multiple servers

### direct_messages
- Direct messages between users (ready for implementation)

## Deployment

### Deploy Frontend (Vercel - FREE)
```bash
npm install -g vercel
vercel
```
Then connect your GitHub repo for auto-deployment.

### Database (Supabase - FREE)
Already deployed! Just connect your project in `.env.local`.

## Cost Breakdown

| Service | Cost | Limits (Free) |
|---------|------|---------------|
| **Supabase** | Free | 500MB DB, 2M realtime messages/month |
| **Vercel** | Free | 100GB bandwidth, unlimited deployments |
| **Storage** | Free | 1GB per project (Supabase) |
| **Total/Month** | **$0** | Perfect for small communities |

Scales to ~$10/month for small communities, ~$50+/month for Discord-sized apps.

## Troubleshooting

### Build Errors
```bash
npm run build
```
Check for TypeScript errors with detailed output.

### Can't sign up
- Check Supabase project is active
- Verify `.env.local` has correct credentials
- Check browser console for errors

### Messages not saving
1. Run the `handle_new_user()` trigger SQL from setup guide
2. Check RLS policies in Supabase: **Authentication** → **Policies**
3. Verify user is in `server_members` for the channel's server

### Real-time not working
- Enable Realtime in Supabase: **Settings** → **Realtime** → Enable for `messages` table

## Local Development Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Build for production
npm run start    # Run production build
npm run lint     # Check code quality
```

## Next Steps for Growth

1. **Add server creation UI**
2. **Add user profiles page**
3. **Implement file uploads** (avatars, images in messages)
4. **Add friend/DM system**
5. **Implement voice channels** (LiveKit integration)
6. **Add reactions & emojis**
7. **Search functionality**
8. **Mobile app** (React Native / Expo)

## Performance Tips

- Messages are lazy-loaded per channel
- Auto-scrolling optimized with Intersection Observer
- Zustand for lightweight state management
- Supabase handles real-time subscriptions efficiently
- Vercel serverless auto-scales with demand

## Security Notes

- RLS policies prevent unauthorized data access
- Passwords hashed by Supabase Auth (bcrypt)
- All API calls go through Supabase
- CORS properly configured
- Never expose real Supabase URL + key in git

## Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Happy Building! 🚀**

Have questions? Check the troubleshooting section or open an issue on GitHub.
