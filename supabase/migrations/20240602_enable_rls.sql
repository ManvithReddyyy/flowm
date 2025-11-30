-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Workspaces Policies

-- Users can view workspaces they are members of
CREATE POLICY "Users can view their workspaces"
ON workspaces FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_members WHERE workspace_id = id
  )
);

-- Authenticated users can create workspaces
CREATE POLICY "Authenticated users can create workspaces"
ON workspaces FOR INSERT
WITH CHECK ( auth.role() = 'authenticated' );

-- Owners/Admins can update their workspaces
CREATE POLICY "Admins can update workspaces"
ON workspaces FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_members 
    WHERE workspace_id = id AND role IN ('owner', 'admin')
  )
);

-- Workspace Members Policies

-- Users can view members of workspaces they belong to
CREATE POLICY "Users can view members of their workspaces"
ON workspace_members FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  )
);

-- Admins can add members
CREATE POLICY "Admins can add members"
ON workspace_members FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM workspace_members 
    WHERE workspace_id = workspace_members.workspace_id AND role IN ('owner', 'admin')
  )
);

-- Admins can update members
CREATE POLICY "Admins can update members"
ON workspace_members FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_members 
    WHERE workspace_id = workspace_members.workspace_id AND role IN ('owner', 'admin')
  )
);

-- Admins can delete members
CREATE POLICY "Admins can delete members"
ON workspace_members FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_members 
    WHERE workspace_id = workspace_members.workspace_id AND role IN ('owner', 'admin')
  )
);
