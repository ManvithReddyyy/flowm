import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import {
    X,
    Trash2,
    Calendar as CalendarIcon,
    User,
    Clock,
    CheckSquare,
    MessageSquare,
    Send,
    Plus,
    Paperclip,
    File as FileIcon,
    Download
} from 'lucide-react'
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import { useWorkspaceMembers } from '@/hooks/useWorkspaceMembers'
import {
    useComments,
    useCreateComment,
    useSubtasks,
    useCreateSubtask,
    useUpdateSubtask,
    useDeleteSubtask
} from '@/hooks/useTaskDetails'
import { useAttachments, useUploadFile, useDeleteFile } from '@/hooks/useAttachments'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type Task = {
    id: string
    project_id: string
    title: string
    description: string | null
    status: 'todo' | 'in-progress' | 'in-review' | 'done'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    assignee_id: string | null
    due_date: string | null
    position: number
    created_at: string
    updated_at: string
}

type TaskSidebarProps = {
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

export default function TaskSidebar({ task, open, onClose }: TaskSidebarProps) {
    const { user } = useAuth()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState<'todo' | 'in-progress' | 'in-review' | 'done'>('todo')
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
    const [assigneeId, setAssigneeId] = useState<string | null>(null)
    const [dueDate, setDueDate] = useState<string>('')

    // New state for subtasks and comments
    const [newSubtask, setNewSubtask] = useState('')
    const [newComment, setNewComment] = useState('')

    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()
    const { data: members } = useWorkspaceMembers()

    // Hooks for subtasks and comments
    const { data: subtasks } = useSubtasks(task?.id || '')
    const createSubtask = useCreateSubtask()
    const updateSubtask = useUpdateSubtask()
    const deleteSubtask = useDeleteSubtask()

    const { data: comments } = useComments(task?.id || '')
    const createComment = useCreateComment()

    // Attachments hooks
    const { data: attachments } = useAttachments(task?.id || '')
    const uploadFile = useUploadFile()
    const deleteFile = useDeleteFile()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const commentsEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (task) {
            setTitle(task.title)
            setDescription(task.description || '')
            setStatus(task.status)
            setPriority(task.priority)
            setAssigneeId(task.assignee_id || null)
            setDueDate(task.due_date || '')
        }
    }, [task])

    // Scroll to bottom of comments when new one added
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        }
    }, [comments, open])

    const handleSave = async () => {
        if (!task) return

        await updateTask.mutateAsync({
            id: task.id,
            updates: {
                title,
                description: description || null,
                status,
                priority,
                assignee_id: assigneeId === 'unassigned' ? null : assigneeId,
                due_date: dueDate || null,
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

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSubtask.trim() || !task) return
        createSubtask.mutate({ taskId: task.id, title: newSubtask })
        setNewSubtask('')
    }

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || !task || !user) return
        createComment.mutate({ taskId: task.id, userId: user.id, content: newComment })
        setNewComment('')
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !task || !user) return

        try {
            await uploadFile.mutateAsync({ taskId: task.id, file, userId: user.id })
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Failed to upload file')
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleDownload = (filePath: string) => {
        // Construct public URL - assuming public bucket
        // If private, we'd need to sign a URL
        const publicUrl = `https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/attachments/${filePath}`
        window.open(publicUrl, '_blank')
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const completedSubtasks = subtasks?.filter(s => s.is_completed).length || 0
    const totalSubtasks = subtasks?.length || 0
    const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100

    if (!task) return null

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            <div
                className={`fixed top-0 right-0 h-full w-[600px] bg-background border-l shadow-2xl z-50 transform transition-all duration-300 ease-out flex flex-col ${open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground font-mono">#{task.position + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={updateTask.isPending}>
                            {updateTask.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-8 py-6 space-y-8">

                        {/* Title Area */}
                        <div className="space-y-4">
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-2xl font-semibold border-none px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                                placeholder="Task title"
                            />

                            {/* Properties Grid */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Status</Label>
                                    <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                                        <SelectTrigger className="h-8">
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

                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Priority</Label>
                                    <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                                        <SelectTrigger className="h-8">
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

                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Assignee</Label>
                                    <Select value={assigneeId || 'unassigned'} onValueChange={(value) => setAssigneeId(value === 'unassigned' ? null : value)}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue placeholder="Unassigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <User className="h-3 w-3" />
                                                    Unassigned
                                                </div>
                                            </SelectItem>
                                            {members?.map((member) => (
                                                <SelectItem key={member.user_id} value={member.user_id}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarFallback className="text-[8px]">
                                                                {getInitials(member.profiles.full_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {member.profiles.full_name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Due Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full h-8 justify-start text-left font-normal text-xs px-2",
                                                    !dueDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-3 w-3" />
                                                {dueDate ? format(new Date(dueDate), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dueDate ? new Date(dueDate) : undefined}
                                                onSelect={(date) => setDueDate(date ? date.toISOString() : '')}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Description</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add more details, context, or acceptance criteria..."
                                className="min-h-[120px] resize-none border-0 border-b border-muted/20 focus:border-primary/50 rounded-none shadow-none focus-visible:ring-0 px-0 -ml-2 transition-colors"
                            />
                        </div>

                        {/* Subtasks */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4" />
                                    Subtasks
                                </Label>
                                <span className="text-xs text-muted-foreground">
                                    {completedSubtasks}/{totalSubtasks}
                                </span>
                            </div>

                            {totalSubtasks > 0 && <Progress value={progress} className="h-1.5" />}

                            <div className="space-y-2">
                                {subtasks?.map((subtask) => (
                                    <div key={subtask.id} className="flex items-center gap-2 group">
                                        <Checkbox
                                            checked={subtask.is_completed}
                                            onCheckedChange={(checked) => updateSubtask.mutate({ id: subtask.id, updates: { is_completed: checked as boolean } })}
                                        />
                                        <span className={`flex-1 text-sm ${subtask.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                            {subtask.title}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => deleteSubtask.mutate({ id: subtask.id, taskId: task.id })}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}

                                <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={newSubtask}
                                        onChange={(e) => setNewSubtask(e.target.value)}
                                        placeholder="Add subtask..."
                                        className="h-8 border-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/70"
                                    />
                                </form>
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                    <Paperclip className="h-4 w-4" />
                                    Attachments
                                </Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs text-muted-foreground hover:text-primary"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadFile.isPending}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add File
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </div>

                            <div className="space-y-2">
                                {attachments?.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/20 group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                                <FileIcon className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-medium truncate">{file.file_name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {(file.file_size ? file.file_size / 1024 : 0).toFixed(1)} KB
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => handleDownload(file.file_path)}
                                            >
                                                <Download className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                onClick={() => deleteFile.mutate({ id: file.id, taskId: task.id, filePath: file.file_path })}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {attachments?.length === 0 && (
                                    <div className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-md">
                                        No attachments yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="space-y-4 pt-4 border-t">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Activity
                            </Label>

                            <div className="space-y-4">
                                {comments?.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarFallback className="text-xs">
                                                {getInitials(comment.profiles.full_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{comment.profiles.full_name}</span>
                                                <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)} at {formatTime(comment.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-foreground/90 bg-muted/30 p-2 rounded-md">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={commentsEndRef} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                        {user?.email ? getInitials(user.email) : 'ME'}
                                    </AvatarFallback>
                                </Avatar>
                                <form onSubmit={handleAddComment} className="flex-1 flex gap-2">
                                    <Input
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="flex-1"
                                    />
                                    <Button type="submit" size="icon" disabled={!newComment.trim() || createComment.isPending}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Metadata Footer */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-8 pb-4">
                            <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                Created {formatDate(task.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Updated {formatDate(task.updated_at)}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
