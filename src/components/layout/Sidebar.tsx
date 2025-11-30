import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router-dom'
import { Folder, LayoutGrid, ChevronDown, Users, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import { Separator } from '@/components/ui/separator'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { CreateWorkspaceDialog } from '@/components/workspace/CreateWorkspaceDialog'
import type { Database } from '@/types/database.types'

type Project = Database['public']['Tables']['projects']['Row']

export default function Sidebar() {
    const location = useLocation()
    const { workspaces } = useWorkspaces()
    const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore()
    const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false)

    const { data: projects } = useQuery<Project[]>({
        queryKey: ['projects', currentWorkspace?.id],
        queryFn: async () => {
            if (!currentWorkspace) return []
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('workspace_id', currentWorkspace.id)
                .order('created_at')
            return data || []
        },
        enabled: !!currentWorkspace,
    })

    const navItems = [
        { name: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
        { name: 'Team', icon: Users, href: '/team' },
    ]

    return (
        <div className="flex h-full w-60 flex-col border-r bg-background">
            {/* Workspace Selector */}
            <div className="p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        <span className="truncate font-medium">
                            {currentWorkspace?.name || 'Select Workspace'}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            Switch Workspace
                        </div>
                        {workspaces?.map((workspace: any) => (
                            <DropdownMenuItem
                                key={workspace.id}
                                onSelect={() => setCurrentWorkspace(workspace)}
                                className="flex items-center justify-between"
                            >
                                {workspace.name}
                                {currentWorkspace?.id === workspace.id && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setIsCreateWorkspaceOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Workspace
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <CreateWorkspaceDialog
                open={isCreateWorkspaceOpen}
                onOpenChange={setIsCreateWorkspaceOpen}
            />

            <Separator />

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                                ? 'bg-accent text-accent-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    )
                })}

                {projects && projects.length > 0 && (
                    <>
                        <Separator className="my-2" />
                        <div className="px-3 py-2">
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Projects
                            </h3>
                            <div className="space-y-1">
                                {projects.map((project) => (
                                    <Link
                                        key={project.id}
                                        to={`/project/${project.id}`}
                                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${location.pathname === `/project/${project.id}`
                                            ? 'bg-accent text-accent-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                            }`}
                                    >
                                        <Folder className="h-4 w-4" />
                                        {project.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </nav>
        </div>
    )
}
