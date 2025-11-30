# FlowM - Quick Start

## ⚠️ Before Running

You're seeing TypeScript errors because Supabase isn't set up yet. This is expected!

## 3-Step Quick Start

### 1. Set Up Supabase (5 min)
Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Quick Version:**
1. Create project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in SQL Editor
3. Run `supabase/rls-policies.sql` in SQL Editor
4. Get your credentials from Settings → API

### 2. Configure Environment

Create `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Run the App

```bash
npm run dev
```

Visit `http://localhost:5173`

## Current TypeScript Errors

The errors in **Sidebar**, **useTasks**, and **Supabase** files are expected until:
- `.env` file is created with real Supabase credentials
- Development server is restarted

These will auto-resolve once Supabase is configured!

## Need Help?

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed step-by-step instructions.
