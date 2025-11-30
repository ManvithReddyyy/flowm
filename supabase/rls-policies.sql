-- FlowM Row Level Security Policies
-- Run this AFTER running schema.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Workspaces policies
CREATE POLICY "Users can view workspaces they are members of"
  ON workspaces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can update their workspaces"
  ON workspaces FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can delete their workspaces"
  ON workspaces FOR DELETE
  USING (auth.uid() = owner_id);

-- Workspace members policies
CREATE POLICY "Users can view members of their workspaces"
  ON workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners/admins can add members"
  ON workspace_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners/admins can remove members"
  ON workspace_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Projects policies
CREATE POLICY "Users can view projects in their workspaces"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace admins/owners can delete projects"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      JOIN workspaces ON workspaces.id = workspace_members.workspace_id
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

-- Tasks policies
CREATE POLICY "Users can view tasks in their workspace projects"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = tasks.project_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = tasks.project_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update tasks"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = tasks.project_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete tasks"
  ON tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = tasks.project_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Task assignments policies
CREATE POLICY "Users can view task assignments in their workspaces"
  ON task_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE tasks.id = task_assignments.task_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can assign tasks"
  ON task_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE tasks.id = task_assignments.task_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can remove task assignments"
  ON task_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE tasks.id = task_assignments.task_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments in their workspace tasks"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE tasks.id = comments.task_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create comments"
  ON comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE tasks.id = comments.task_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Task tags policies
CREATE POLICY "Users can view tags in their workspace tasks"
  ON task_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE tasks.id = task_tags.task_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can add tags"
  ON task_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE tasks.id = task_tags.task_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can remove tags"
  ON task_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE tasks.id = task_tags.task_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- File attachments policies
CREATE POLICY "Users can view attachments in their workspace tasks"
  ON file_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE tasks.id = file_attachments.task_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can upload attachments"
  ON file_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE tasks.id = file_attachments.task_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own attachments"
  ON file_attachments FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Storage policies (for file uploads bucket)
-- Create a storage bucket called 'attachments' in Supabase dashboard
-- Then run these policies:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);

-- CREATE POLICY "Users can upload files to their workspace tasks"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'attachments' AND
--     auth.role() = 'authenticated'
--   );

-- CREATE POLICY "Users can view files in their workspace tasks"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'attachments' AND
--     auth.role() = 'authenticated'
--   );

-- CREATE POLICY "Users can delete their own files"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'attachments' AND
--     auth.uid() = owner
--   );
