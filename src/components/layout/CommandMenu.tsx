import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    LayoutGrid,
    Folder,
    CheckSquare,
    User
} from 'lucide-react'

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { supabase } from '@/lib/supabase'

export function CommandMenu() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const { currentWorkspace } = useWorkspaceStore()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const { data: projects } = useQuery({
        queryKey: ['search-projects', currentWorkspace?.id],
        queryFn: async () => {
            if (!currentWorkspace) return []
            const { data } = await supabase
                .from('projects')
                .select('id, name, icon')
                .eq('workspace_id', currentWorkspace.id)
                .limit(10)
            return (data || []) as any[]
        },
        enabled: open && !!currentWorkspace,
    })

    const { data: tasks } = useQuery({
        queryKey: ['search-tasks', currentWorkspace?.id],
        queryFn: async () => {
            if (!currentWorkspace) return []
            // Fetch tasks from all projects in the workspace
            // Since we don't have a direct workspace_id on tasks, we join via projects
            const { data } = await supabase
                .from('tasks')
                .select(`
                    id, 
                    title, 
                    project_id,
                    projects!inner(workspace_id)
                `)
                .eq('projects.workspace_id', currentWorkspace.id)
                .limit(20)
            return (data || []) as any[]
        },
        enabled: open && !!currentWorkspace,
    })

    const runCommand = (command: () => void) => {
        setOpen(false)
        command()
    }

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => navigate('/dashboard'))}>
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate('/team'))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Team</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {projects && projects.length > 0 && (
                    <CommandGroup heading="Projects">
                        {projects.map((project) => (
                            <CommandItem
                                key={project.id}
                                onSelect={() => runCommand(() => navigate(`/project/${project.id}`))}
                            >
                                <Folder className="mr-2 h-4 w-4" />
                                <span>{project.name}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {tasks && tasks.length > 0 && (
                    <CommandGroup heading="Tasks">
                        {tasks.map((task) => (
                            <CommandItem
                                key={task.id}
                                onSelect={() => runCommand(() => navigate(`/project/${task.project_id}?taskId=${task.id}`))}
                            >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                <span>{task.title}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    )
}
