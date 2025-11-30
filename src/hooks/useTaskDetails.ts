import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type Comment = {
    id: string
    task_id: string
    user_id: string
    content: string
    created_at: string
    profiles: {
        full_name: string
        avatar_url: string | null
    }
}

export type Subtask = {
    id: string
    task_id: string
    title: string
    is_completed: boolean
    position: number
    created_at: string
}

// --- Comments Hooks ---

export function useComments(taskId: string) {
    return useQuery<Comment[]>({
        queryKey: ['comments', taskId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('comments')
                .select('*, profiles(full_name, avatar_url)')
                .eq('task_id', taskId)
                .order('created_at', { ascending: true })

            if (error) throw error
            return (data || []) as Comment[]
        },
        enabled: !!taskId,
    })
}

export function useCreateComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ taskId, userId, content }: { taskId: string; userId: string; content: string }) => {
            const { error } = await supabase
                .from('comments')
                // @ts-ignore
                .insert({ task_id: taskId, user_id: userId, content })

            if (error) throw error
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] })
        },
    })
}

// --- Subtasks Hooks ---

export function useSubtasks(taskId: string) {
    return useQuery<Subtask[]>({
        queryKey: ['subtasks', taskId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('subtasks')
                // @ts-ignore
                .select('*')
                .eq('task_id', taskId)
                .order('position', { ascending: true })
                .order('created_at', { ascending: true })

            if (error) throw error
            return (data || []) as Subtask[]
        },
        enabled: !!taskId,
    })
}

export function useCreateSubtask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
            const { error } = await supabase
                .from('subtasks')
                // @ts-ignore
                .insert({ task_id: taskId, title })

            if (error) throw error
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['subtasks', variables.taskId] })
        },
    })
}

export function useUpdateSubtask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Subtask> }) => {
            const { data, error } = await supabase
                .from('subtasks')
                // @ts-ignore
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            if (!data) throw new Error('Subtask not found')
            return data
        },
        onSuccess: (data) => {
            // @ts-ignore
            queryClient.invalidateQueries({ queryKey: ['subtasks', data.task_id] })
        },
    })
}

export function useDeleteSubtask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, taskId: _taskId }: { id: string; taskId: string }) => {
            const { error } = await supabase
                .from('subtasks')
                .delete()
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['subtasks', variables.taskId] })
        },
    })
}
