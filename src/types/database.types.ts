export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            workspaces: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    owner_id: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    description?: string | null
                    owner_id: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    owner_id?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            workspace_members: {
                Row: {
                    id: string
                    workspace_id: string
                    user_id: string
                    role: 'owner' | 'admin' | 'member'
                    created_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    user_id: string
                    role: 'owner' | 'admin' | 'member'
                    created_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    user_id?: string
                    role?: 'owner' | 'admin' | 'member'
                    created_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    workspace_id: string
                    name: string
                    description: string | null
                    icon: string | null
                    color: string | null
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    workspace_id: string
                    name: string
                    description?: string | null
                    icon?: string | null
                    color?: string | null
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    workspace_id?: string
                    name?: string
                    description?: string | null
                    icon?: string | null
                    color?: string | null
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            tasks: {
                Row: {
                    id: string
                    project_id: string
                    title: string
                    description: string | null
                    status: 'todo' | 'in-progress' | 'in-review' | 'done'
                    priority: 'low' | 'medium' | 'high' | 'urgent'
                    position: number
                    assignee_id: string | null
                    due_date: string | null
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    title: string
                    description?: string | null
                    status?: 'todo' | 'in-progress' | 'in-review' | 'done'
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    position?: number
                    assignee_id?: string | null
                    due_date?: string | null
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    title?: string
                    description?: string | null
                    status?: 'todo' | 'in-progress' | 'in-review' | 'done'
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    position?: number
                    assignee_id?: string | null
                    due_date?: string | null
                    created_by?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            task_assignments: {
                Row: {
                    id: string
                    task_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    task_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    task_id?: string
                    user_id?: string
                    created_at?: string
                }
            }
            comments: {
                Row: {
                    id: string
                    task_id: string
                    user_id: string
                    content: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    task_id: string
                    user_id: string
                    content: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    task_id?: string
                    user_id?: string
                    content?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            task_tags: {
                Row: {
                    id: string
                    task_id: string
                    tag: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    task_id: string
                    tag: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    task_id?: string
                    tag?: string
                    created_at?: string
                }
            }
            file_attachments: {
                Row: {
                    id: string
                    task_id: string
                    file_name: string
                    file_path: string
                    file_size: number | null
                    file_type: string | null
                    uploaded_by: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    task_id: string
                    file_name: string
                    file_path: string
                    file_size?: number | null
                    file_type?: string | null
                    uploaded_by: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    task_id?: string
                    file_name?: string
                    file_path?: string
                    file_size?: number | null
                    file_type?: string | null
                    uploaded_by?: string
                    created_at?: string
                }
            }
        }
    }
}
