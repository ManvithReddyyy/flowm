import { useState, useEffect } from 'react'
import { Trash2, Calendar } from 'lucide-react'
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

type Task = {
    id: string
    project_id: string
    title: string
    description: string | null
    status: 'todo' | 'in-progress' | 'in-review' | 'done'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    created_at: string
    updated_at: string
}

type TaskDetailModalProps = {
    task: Task | null
    open: boolean
    onClose: () => void
}

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

export default function TaskDetailModal({ task, open, onClose }: TaskDetailModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState<'todo' | 'in-progress' | 'in-review' | 'done'>('todo')
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')

    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()

    // Update local state when task changes
    useEffect(() => {
        if (task) {
            setTitle(task.title)
            setDescription(task.description || '')
            setStatus(task.status)
            setPriority(task.priority)
        }
    }, [task])

    const handleSave = async () => {
        if (!task) return

        await updateTask.mutateAsync({
            id: task.id,
            updates: {
                title,
                description: description || null,
                status,
                priority,
            },
        })

        onClose()
    }

    const handleDelete = async () => {
        if (!task) return

        if (window.confirm('Are you sure you want to delete this task?')) {
            await deleteTask.mutateAsync({ id: task.id, projectId: task.project_id })
            onClose()
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (!task) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <DialogTitle className="text-xl">Task Details</DialogTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task title..."
                            className="text-lg font-medium"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description..."
                            rows={6}
                            className="resize-none"
                        />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                                        <SelectItem key={value} value={value}>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${config.color}`} />
                                                {config.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                                <SelectTrigger id="priority">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                                        <SelectItem key={value} value={value}>
                                            <span className={config.color}>{config.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 border-t pt-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Created: {formatDate(task.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Updated: {formatDate(task.updated_at)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={!title.trim() || updateTask.isPending}>
                            {updateTask.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
