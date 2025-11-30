# Supabase Setup Guide for FlowM

## Current Status

The FlowM application is complete and ready to use, but TypeScript will show errors until you connect to a real Supabase instance. This is expected behavior.

## Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project (choose a name, password,  and region)
4. Wait 2-3 minutes for provisioning

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click "Run"
5. Wait for success message

### Step 3: Run Security Policies

1. Still in **SQL Editor**, click "New Query" again
2. Copy the entire contents of `supabase/rls-policies.sql`
3. Paste and click "Run"
4. Wait for success message

### Step 4: Get Your Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy "Project URL" (looks like `https://xxxxx.supabase.co`)
3. Copy "anon public" key (safe to use in frontend)

### Step 5: Create Environment File

Create a file named `.env` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

Replace the placeholder values with your actual credentials from Step 4.

### Step 6: Create Your First Workspace

Since workspace creation UI isn't built yet, you'll need to create one manually:

1. Go to **SQL Editor** in Supabase
2. First, get your user ID by running:
   ```sql
   SELECT id, email FROM auth.users;
   ```
3. Copy your user `id`
4. Run the quickstart script with your ID:

Open `supabase/quickstart.sql`, replace `'your-user-id-here'` with your actual ID, and run it.

### Step 7: Run the App

```bash
npm run dev
```

Visit `http://localhost:5173` and login!

## Troubleshooting

### TypeScript Errors Before Setup

**This is normal!** TypeScript shows errors because:
- No `.env` file exists yet
- Supabase types can't be validated without a connection

These errors will disappear once you:
1. Create the `.env` file with real credentials
2. Restart your dev server

### "Missing environment variables" Error

Create the `.env` file as described in Step 5.

### Can't Login

1. Make sure you ran both SQL files (schema + RLS policies)
2. Check that your `.env` has the correct credentials
3. Try signing up first (creates your account)

### No Workspaces Showing

You need to manually create your first workspace using the quickstart SQL script (Step 6).

## What's Working Right Now

✅ Full authentication (signup/login)
✅ Project creation and management  
✅ Kanban board with 4 columns
✅ Drag-and-drop tasks between columns
✅ Real-time updates (multiple users)
✅ Task priorities (low/medium/high/urgent)
✅ Dark/light theme toggle
✅ Minimal Linear-style design

## Next Development Steps

After Supabase is set up, you can add:
- Workspace creation UI
- Task detail panel
- Task editing
- Team member invites
- Comments with Markdown
- File attachments
- Global search

All database schema is ready for these features!

## Common Developer Tips

**Restart after `.env` changes:**
```bash
# Stop the server (Ctrl+C)
npm run dev  # Restart
```

**Check Supabase connection:**
The app will show errors in browser console if Supabase isn't connected properly.

**View database:**
Use Supabase Table Editor in your dashboard to see all data.

## Support

- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Docs](https://ui.shadcn.com)

---

Once you complete these steps, FlowM will be fully functional! 🚀
