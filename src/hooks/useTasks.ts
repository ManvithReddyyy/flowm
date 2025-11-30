import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export function useTasks(projectId: string) {
    return useQuery<Task[]>({
        queryKey: ['tasks', projectId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tasks')
                .select('*, assignee:assignee_id(full_name, avatar_url)')
                .eq('project_id', projectId)
                .order('position')

            if (error) throw error
            return data as Task[]
        },
    })
}

export function useCreateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (task: TaskInsert) => {
            const { data, error } = await supabase
                .from('tasks')
                // @ts-expect-error - Supabase types resolve after env is configured
                .insert(task)
                .select()
                .single()

            if (error) throw error
            return data as Task
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', variables.project_id] })
        },
    })
}

export function useUpdateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: TaskUpdate }) => {
            const { data, error } = await supabase
                .from('tasks')
                // @ts-expect-error - Supabase types resolve after env is configured
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data as Task
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] })
        },
    })
}

export function useDeleteTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id }: { id: string; projectId: string }) => {
            const { error } = await supabase.from('tasks').delete().eq('id', id)

            if (error) throw error
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] })
        },
    })
}
