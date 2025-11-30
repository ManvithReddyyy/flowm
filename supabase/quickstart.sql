-- Quick start script to create your first workspace manually
-- Replace 'your-user-id' with your actual user ID from the auth.users table
-- You can find it by running: SELECT id, email FROM auth.users;

-- Step 1: Insert a workspace
INSERT INTO workspaces (name, slug, description, owner_id)
VALUES (
  'My Workspace',
  'my-workspace',
  'My first workspace',
  'your-user-id-here'
);

-- Step 2: Add yourself as a member (get workspace ID from previous query)
INSERT INTO workspace_members (workspace_id, user_id, role)
VALUES (
  'workspace-id-here',
  'your-user-id-here',
  'owner'
);

-- Verify setup
SELECT w.name, w.slug, wm.role
FROM workspaces w
JOIN workspace_members wm ON wm.workspace_id = w.id
WHERE wm.user_id = 'your-user-id-here';
