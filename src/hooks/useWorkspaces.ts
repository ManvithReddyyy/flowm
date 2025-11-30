import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useWorkspaceStore } from '@/stores/workspace.store'

export function useWorkspaces() {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const { setCurrentWorkspace } = useWorkspaceStore()

    const { data: workspaces, isLoading } = useQuery({
        queryKey: ['workspaces'],
        queryFn: async () => {
            if (!user) return []

            // Fetch workspaces where the user is a member
            const { data, error } = await supabase
                .from('workspaces')
                .select(`
                    *,
                    workspace_members!inner(user_id)
                `)
                .eq('workspace_members.user_id', user.id)
                .order('created_at')

            if (error) throw error
            return data
        },
        enabled: !!user,
    })

    const createWorkspace = useMutation({
        mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
            if (!user) throw new Error('User not authenticated')

            // 1. Create workspace
            const { data: workspace, error: workspaceError } = await supabase
                .from('workspaces')
                .insert({
                    name,
                    slug,
                    owner_id: user.id,
                } as any)
                .select()
                .single()

            if (workspaceError) throw workspaceError

            // 2. Add creator as member (admin)
            const { error: memberError } = await supabase
                .from('workspace_members')
                .insert({
                    workspace_id: (workspace as any).id,
                    user_id: user.id,
                    role: 'admin',
                } as any)

            if (memberError) throw memberError

            return workspace
        },
        onSuccess: (newWorkspace) => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
            setCurrentWorkspace(newWorkspace)
        },
    })

    const updateWorkspace = useMutation({
        mutationFn: async ({ id, name, slug }: { id: string; name: string; slug: string }) => {
            const { data, error } = await supabase
                .from('workspaces')
                // @ts-ignore
                .update({ name, slug } as any)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
        },
    })

    return {
        workspaces,
        isLoading,
        createWorkspace,
        updateWorkspace,
    }
}
