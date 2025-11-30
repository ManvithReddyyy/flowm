import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useWorkspaceStore } from '@/stores/workspace.store'

export type WorkspaceMember = {
    id: string
    user_id: string
    role: string
    profiles: {
        full_name: string
        email: string
        avatar_url: string | null
    }
}

export function useWorkspaceMembers() {
    const { currentWorkspace } = useWorkspaceStore()

    return useQuery<WorkspaceMember[]>({
        queryKey: ['workspace-members', currentWorkspace?.id],
        queryFn: async () => {
            if (!currentWorkspace) return []

            const { data } = await supabase
                .from('workspace_members')
                .select('id, user_id, role, profiles(full_name, email, avatar_url)')
                .eq('workspace_id', currentWorkspace.id)

            return (data || []) as WorkspaceMember[]
        },
        enabled: !!currentWorkspace,
    })
}
