# BisCord - Serverless Discord Clone

A lightweight, cost-effective Discord clone built for serverless deployment. Powered by **Next.js** and **Supabase**, designed to run on a tight budget or even free tier services.

## Features

- 🔐 User authentication with email/password
- 💬 Real-time messaging
- 🖥️ Multiple servers and channels
- 👥 Server membership management
- 📖 Direct messaging (coming soon)
- 🎙️ Voice channels (coming soon)
- 🚀 Serverless deployment ready

## Tech Stack

- **Frontend**: Next.js 15+ with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Real-time**: Supabase Realtime Subscriptions
- **Deployment**: Vercel (Next.js), Supabase (Database)

## Cost Estimates

- **Supabase**: Free tier gets you PostgreSQL database, auth, and 2M realtime messages/month
- **Vercel**: Free tier for Next.js deployment with serverless functions
- **Storage**: Free tier on Supabase for file uploads
- **Total monthly cost**: $0-5 with free tier services

## Getting Started

### 1. Clone and Install

```bash
cd biscord
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key
4. Add them to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

### 3. Initialize Database

1. In Supabase dashboard, go to SQL Editor
2. Copy the entire content of `src/lib/database.sql`
3. Paste and execute it
4. This creates all tables, indexes, and RLS policies

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/
│   ├── AuthProvider.tsx   # Auth context setup
│   ├── ChatWindow.tsx     # Main chat interface
│   ├── Dashboard.tsx      # Main dashboard layout
│   ├── Login.tsx          # Login form
│   └── MessageBubble.tsx  # Message display component
├── lib/
│   ├── auth.ts            # Authentication functions
│   ├── database.sql       # Database schema and RLS policies
│   ├── store.ts           # Zustand state management
│   └── supabase.ts        # Supabase client setup
└── styles/                # Global styles
```

## Database Schema

- **profiles**: User profiles and account information
- **servers**: Discord-like servers/communities
- **channels**: Text channels within servers
- **messages**: Channel messages with real-time support
- **server_members**: Many-to-many relationship for server membership
- **direct_messages**: Direct messaging between users

All tables include Row Level Security (RLS) policies for data privacy.

## Next Steps

1. **User Registration**: Implement sign-up UI
2. **Server Creation**: Add ability to create new servers
3. **Channel Management**: Add create/edit/delete channels
4. **Voice Channels**: Integrate WebRTC for voice (e.g., LiveKit)
5. **File Uploads**: Add image/file sharing via Supabase Storage
6. **User Profiles**: Enhance user profile management
7. **Typing Indicators**: Show who's typing
8. **Message Reactions**: Add emoji reactions to messages

## Deployment

### Deploy to Vercel (Frontend)

```bash
npm install -g vercel
vercel
```

### Deploy to Supabase (Database)

Database is already cloud-hosted! Just use your Supabase project.

## Performance Optimization

- Leverage Supabase's edge functions for server logic
- Use next/image for optimized image serving
- Implement message pagination to avoid loading all messages
- Use Incremental Static Regeneration for better caching

## Troubleshooting

**Issue**: "Missing Supabase environment variables"
- **Solution**: Ensure you've copied your Supabase URL and key to `.env.local`

**Issue**: "RLS policy denies" errors
- **Solution**: Check that you've run the full database.sql file to set up RLS policies

**Issue**: Real-time messages not appearing
- **Solution**: Ensure Supabase Realtime is enabled in your project settings

## Contributing

Contributions are welcome! Feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests

## License

MIT - Build something great! 🚀
