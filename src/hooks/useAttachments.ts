import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type Attachment = Database['public']['Tables']['file_attachments']['Row']

export function useAttachments(taskId: string) {
    return useQuery<Attachment[]>({
        queryKey: ['attachments', taskId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('file_attachments')
                .select('*')
                .eq('task_id', taskId)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Attachment[]
        },
        enabled: !!taskId,
    })
}

export function useUploadFile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ taskId, file, userId }: { taskId: string; file: File; userId: string }) => {
            // 1. Upload file to storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${taskId}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Create database record
            const { data, error: dbError } = await supabase
                .from('file_attachments')
                .insert({
                    task_id: taskId,
                    file_name: file.name,
                    file_path: filePath,
                    file_size: file.size,
                    file_type: file.type,
                    uploaded_by: userId,
                } as any)
                .select()
                .single()

            if (dbError) throw dbError
            return data as Attachment
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['attachments', variables.taskId] })
        },
    })
}

export function useDeleteFile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, filePath }: { id: string; taskId: string; filePath: string }) => {
            // 1. Delete from storage
            const { error: storageError } = await supabase.storage
                .from('attachments')
                .remove([filePath])

            if (storageError) throw storageError

            // 2. Delete from database
            const { error: dbError } = await supabase
                .from('file_attachments')
                .delete()
                .eq('id', id)

            if (dbError) throw dbError
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['attachments', variables.taskId] })
        },
    })
}
