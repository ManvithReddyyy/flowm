-- Add assignee_id and due_date to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
