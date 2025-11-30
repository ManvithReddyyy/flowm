import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Circle, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useTasks, useCreateTask, useUpdateTask } from '@/hooks/useTasks'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import TaskSidebar from '@/components/board/TaskSidebar'
import type { Database } from '@/types/database.types'

type Project = Database['public']['Tables']['projects']['Row']
type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done'

const STATUS_CONFIG = {
    'todo': { label: 'To Do', color: 'bg-gray-500' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-500' },
    'in-review': { label: 'In Review', color: 'bg-purple-500' },
    'done': { label: 'Done', color: 'bg-green-500' },
}

const PRIORITY_CONFIG = {
    'low': { label: 'Low', color: 'text-gray-500' },
    'medium': { label: 'Medium', color: 'text-blue-500' },
    'high': { label: 'High', color: 'text-orange-500' },
    'urgent': { label: 'Urgent', color: 'text-red-500' },
}

export default function BoardPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const { user } = useAuth()
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [selectedTask, setSelectedTask] = useState<any>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const { data: project } = useQuery<Project>({
        queryKey: ['project', projectId],
        queryFn: async () => {
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId!)
                .single()
            if (!data) throw new Error('Project not found')
            return data
        },
        enabled: !!projectId,
    })

    const { data: tasks } = useTasks(projectId!)

    useRealtimeSubscription('tasks', `project_id=eq.${projectId}`, [
        'tasks',
        projectId!,
    ])

    const createTask = useCreateTask()
    const updateTask = useUpdateTask()

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTaskTitle.trim() || !projectId || !user) return

        createTask.mutate({
            project_id: projectId,
            title: newTaskTitle,
            status: 'todo',
            created_by: user.id,
        })

        setNewTaskTitle('')
    }

    const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
        updateTask.mutate({
            id: taskId,
            updates: { status: newStatus },
        })
    }

    const handlePriorityChange = (taskId: string, newPriority: 'low' | 'medium' | 'high' | 'urgent') => {
        updateTask.mutate({
            id: taskId,
            updates: { priority: newPriority },
        })
    }

    const handleTaskClick = (task: any) => {
        setSelectedTask(task)
        setTimeout(() => setSidebarOpen(true), 10)
    }

    const handleCloseSidebar = () => {
        setSidebarOpen(false)
        setTimeout(() => setSelectedTask(null), 300)
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="flex h-full flex-col">
            <div className="border-b px-8 py-6">
                <h1 className="text-2xl font-semibold">{project?.name || 'Board'}</h1>
                {project?.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {project.description}
                    </p>
                )}
            </div>

            <div className="border-b px-8 py-4">
                <form onSubmit={handleCreateTask} className="flex gap-2">
                    <Input
                        placeholder="Add a new task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!newTaskTitle.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                    </Button>
                </form>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="px-8 py-4">
                    <div className="grid grid-cols-12 gap-4 mb-2 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-5">Task</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Priority</div>
                        <div className="col-span-2">Assignee</div>
                        <div className="col-span-1"></div>
                    </div>

                    <div className="space-y-1">
                        {!tasks || tasks.length === 0 ? (
                            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                                No tasks yet. Create one above to get started.
                            </div>
                        ) : (
                            tasks.map((task: any) => (
                                <div
                                    key={task.id}
                                    onClick={() => handleTaskClick(task)}
                                    className="group grid grid-cols-12 gap-4 items-center py-3 px-3 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border cursor-pointer"
                                >
                                    <div className="col-span-5">
                                        <div className="flex items-center gap-2">
                                            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <span className="text-sm font-medium">{task.title}</span>
                                        </div>
                                        {task.description && (
                                            <p className="text-xs text-muted-foreground mt-1 ml-6 line-clamp-1">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                                        <Select
                                            value={task.status}
                                            onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)}
                                        >
                                            <SelectTrigger className="h-8 text-xs w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                                                    <SelectItem key={value} value={value} className="text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`h-2 w-2 rounded-full ${config.color}`} />
                                                            {config.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                                        <Select
                                            value={task.priority}
                                            onValueChange={(value) => handlePriorityChange(task.id, value as any)}
                                        >
                                            <SelectTrigger className="h-8 text-xs w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                                                    <SelectItem key={value} value={value} className="text-xs">
                                                        <span className={config.color}>{config.label}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-2">
                                        {task.assignee ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-[10px]">
                                                        {getInitials(task.assignee.full_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                                    {task.assignee.full_name}
                                                </span>
                                            </div>
                                        ) : (
                                            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                                                <User className="h-3 w-3 mr-1" />
                                                Assign
                                            </Button>
                                        )}
                                    </div>

                                    <div className="col-span-1"></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <TaskSidebar
                task={selectedTask}
                open={sidebarOpen}
                onClose={handleCloseSidebar}
            />
        </div>
    )
}
