import { useState } from 'react'
import { Circle, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { Database } from '@/types/database.types'

type Task = Database['public']['Tables']['tasks']['Row'] & {
    task_assignments?: Array<{
        user_id: string
        profiles: {
            full_name: string | null
            avatar_url: string | null
        } | null
    }>
}

interface TaskCardProps {
    task: Task
    onDragStart: () => void
}

const priorityConfig = {
    low: { color: 'text-muted-foreground', label: 'Low' },
    medium: { color: 'text-blue-500', label: 'Medium' },
    high: { color: 'text-orange-500', label: 'High' },
    urgent: { color: 'text-red-500', label: 'Urgent' },
}

export default function TaskCard({ task, onDragStart }: TaskCardProps) {
    const [isDragging, setIsDragging] = useState(false)
    const priorityInfo = priorityConfig[task.priority || 'medium']

    return (
        <div
            draggable
            onDragStart={() => {
                setIsDragging(true)
                onDragStart()
            }}
            onDragEnd={() => setIsDragging(false)}
            className={`group cursor-grab rounded-md border bg-background p-3 shadow-sm transition-all hover:border-foreground/20 hover:shadow-md ${isDragging ? 'opacity-50' : ''
                }`}
        >
            <div className="space-y-2">
                {/* Title */}
                <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium leading-tight">{task.title}</h4>
                    <button className="opacity-0 transition-opacity group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Description */}
                {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                    {/* Priority */}
                    <div className="flex items-center gap-1">
                        <Circle className={`h-3 w-3 fill-current ${priorityInfo.color}`} />
                        <span className={`text-xs ${priorityInfo.color}`}>
                            {priorityInfo.label}
                        </span>
                    </div>

                    {/* Assignees */}
                    {task.task_assignments && task.task_assignments.length > 0 && (
                        <div className="flex -space-x-2">
                            {task.task_assignments.slice(0, 3).map((assignment: any) => (
                                <Avatar key={assignment.user_id} className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src={assignment.profiles?.avatar_url} />
                                    <AvatarFallback className="text-xs">
                                        {assignment.profiles?.full_name
                                            ? getInitials(assignment.profiles.full_name)
                                            : '?'}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
