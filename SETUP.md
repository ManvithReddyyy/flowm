# FlowM Setup Guide

Follow these steps to get FlowM up and running.

## Step 1: Install Dependencies

Already done! ✅

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to be provisioned (takes ~2 minutes)
3. Go to the SQL Editor in your Supabase dashboard
4. Copy the contents of `supabase/schema.sql` and run it
5. Copy the contents of `supabase/rls-policies.sql` and run it
6. Go to Storage → Create a new bucket named `attachments` (set to private)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. In your Supabase dashboard, go to Settings → API
3. Copy your project URL and anon/public key
4. Edit `.env` and paste your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Step 5: Create Your First Account

1. Click "Sign up" on the login page
2. Enter your name, email, and password
3. You'll be redirected to the dashboard

## Step 6: Create Your First Workspace

The app will prompt you to create a workspace when you first log in. This feature is ready - just needs workspace creation UI (currently you can manually insert via Supabase dashboard as a temporary solution).

## Step 7: Create Projects and Tasks

1. Click "New Project" on the dashboard
2. Enter a project name and description
3. Click on the project to open the Kanban board
4. Start adding tasks!

## Troubleshooting

### Can't connect to Supabase
- Check that your `.env` file has the correct credentials
- Verify your Supabase project is running
- Make sure you ran both SQL files

### Tasks not showing up
- Check browser console for errors
- Verify RLS policies are set up correctly
- Make sure you're a member of the workspace

### Realtime not working
- Realtime is enabled by default in Supabase
- Check that the subscription is set up correctly
- Try refreshing the page

## Next Steps

- Customize the theme colors in `tailwind.config.js`
- Add more features (see README.md for ideas)
- Deploy to Vercel or Netlify

Enjoy using FlowM! 🚀
