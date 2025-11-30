import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Link } from 'react-router-dom'
import type { Database } from '@/types/database.types'

type Project = Database['public']['Tables']['projects']['Row']
type Workspace = Database['public']['Tables']['workspaces']['Row']

export default function WorkspaceDashboard() {
    const [open, setOpen] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [projectDescription, setProjectDescription] = useState('')
    const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore()
    const { user } = useAuth()
    const queryClient = useQueryClient()

    // Fetch workspaces
    const { data: workspaces } = useQuery<Workspace[]>({
        queryKey: ['workspaces'],
        queryFn: async () => {
            if (!user?.id) return []

            const { data: memberData } = await supabase
                .from('workspace_members')
                .select('workspace_id')
                .eq('user_id', user.id)

            if (!memberData || memberData.length === 0) return []

            // @ts-ignore
            const workspaceIds = memberData.map(m => m.workspace_id)
            const { data: workspaceData } = await supabase
                .from('workspaces')
                .select('*')
                .in('id', workspaceIds)

            return (workspaceData || []) as Workspace[]
        },
        enabled: !!user,
    })

    // Set first workspace as current if none selected (using useEffect to avoid render warning)
    useEffect(() => {
        if (workspaces && workspaces.length > 0 && !currentWorkspace) {
            setCurrentWorkspace(workspaces[0])
        }
    }, [workspaces, currentWorkspace, setCurrentWorkspace])

    // Fetch projects
    const { data: projects } = useQuery<Project[]>({
        queryKey: ['projects', currentWorkspace?.id],
        queryFn: async () => {
            if (!currentWorkspace) return []
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('workspace_id', currentWorkspace.id)
                .order('created_at', { ascending: false })
            return (data || []) as Project[]
        },
        enabled: !!currentWorkspace,
    })

    // Create project mutation
    const createProject = useMutation({
        mutationFn: async () => {
            if (!currentWorkspace || !user) return

            const { data, error } = await supabase
                .from('projects')
                // @ts-expect-error - Supabase types resolve after env is configured
                .insert({
                    workspace_id: currentWorkspace.id,
                    name: projectName,
                    description: projectDescription,
                    created_by: user.id,
                })
                .select()
                .single()

            if (error) throw error
            return data as Project
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            setOpen(false)
            setProjectName('')
            setProjectDescription('')
        },
    })

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault()
        createProject.mutate()
    }

    if (!currentWorkspace) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold">No workspace found</h2>
                    <p className="mt-2 text-muted-foreground">
                        Create a workspace to get started
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your team's projects
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="projectName" className="sr-only">Project Name</Label>
                                <Input
                                    id="projectName"
                                    placeholder="Project name"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="text-sm font-normal placeholder:text-muted-foreground/50"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Create Project</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects?.map((project) => (
                    <Link
                        key={project.id}
                        to={`/project/${project.id}`}
                        className="group rounded-lg border bg-card p-6 transition-colors hover:border-foreground/20"
                    >
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        {project.description && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                {project.description}
                            </p>
                        )}
                    </Link>
                ))}

                {(!projects || projects.length === 0) && (
                    <div className="col-span-full flex h-64 items-center justify-center rounded-lg border border-dashed">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                No projects yet. Create one to get started.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
