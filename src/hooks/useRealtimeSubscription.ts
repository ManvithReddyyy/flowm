import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeSubscription(
    table: string,
    filter?: string,
    queryKey?: string[]
) {
    const queryClient = useQueryClient()

    useEffect(() => {
        const channel = supabase
            .channel(`realtime:${table}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table,
                    filter,
                },
                () => {
                    // Invalidate queries when changes occur
                    if (queryKey) {
                        queryClient.invalidateQueries({ queryKey })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [table, filter, queryKey, queryClient])
}
