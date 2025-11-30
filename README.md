# FlowM - Linear-style Project Management

A sleek, minimal project management application built for engineers and developers. Inspired by Linear.app, Vercel, and Notion.

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with minimal black & white design
- **UI Components**: shadcn/ui (Radix UI)
- **Font**: Geist (light, elegant, minimal)
- **Backend**: Supabase (Auth, Database, Realtime, Storage)
- **State Management**: Zustand
- **Data Fetching**: React Query (@tanstack/react-query)
- **Routing**: React Router v6

## ✨ Features

- ✅ User authentication (Supabase Auth)
- ✅ Workspace creation & management
- ✅ Project creation
- ✅ Linear-style Kanban board with drag-and-drop
- ✅ Realtime task updates
- ✅ Task creation, editing, assignment, priorities
- ✅ Task comments with Markdown support (ready for implementation)
- ✅ File uploads via Supabase Storage (ready for implementation)
- ✅ Dark/Light mode toggle
- ✅ Global search (ready for implementation)

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Steps

1. **Install dependencies**:
   ```bash
   cd M:\coding_environment\flowm
   npm install
   ```

2. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run: `supabase/schema.sql`
   - Then run: `supabase/rls-policies.sql`
   - Create a storage bucket named "attachments" in Storage

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to `http://localhost:5173`

## 🎨 Design Philosophy

- **Minimal**: Black & white color scheme only
- **Clean**: Linear-style spacing and alignment
- **Modern**: Geist font, subtle animations
- **Functional**: No unnecessary visual elements

## 📁 Project Structure

```
flowm/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layout/       # Layout components (Sidebar, Header)
│   │   └── board/        # Kanban board components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and Supabase client
│   ├── pages/            # Page components
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── supabase/             # Database schema and policies
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🗄️ Database Schema

- **profiles**: User profiles
- **workspaces**: Team workspaces
- **workspace_members**: Workspace membership
- **projects**: Projects within workspaces
- **tasks**: Individual tasks
- **task_assignments**: Task-to-user assignments
- **comments**: Task comments
- **task_tags**: Task tags
- **file_attachments**: File uploads

## 🔐 Security

Row Level Security (RLS) policies ensure:
- Users can only access workspaces they're members of
- All queries are scoped to workspace membership
- File uploads are protected per workspace

## 🚧 Future Enhancements

- Task detail panel with full CRUD
- Comments system with Markdown
- File upload functionality
- Global search with Postgres full-text search
- Team member management
- Activity feed
- Keyboard shortcuts

## 📝 License

MIT

---

Built with ❤️ using React, TypeScript, and Supabase
