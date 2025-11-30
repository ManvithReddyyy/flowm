import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

export function useAuth() {
    const { user, setUser, clearUser } = useAuthStore()

    useEffect(() => {
        // Get current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: session.user.user_metadata?.full_name,
                    avatar_url: session.user.user_metadata?.avatar_url,
                })
            }
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: session.user.user_metadata?.full_name,
                    avatar_url: session.user.user_metadata?.avatar_url,
                })
            } else {
                clearUser()
            }
        })

        return () => subscription.unsubscribe()
    }, [setUser, clearUser])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { error }
    }

    const signUp = async (email: string, password: string, fullName: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        })
        return { error }
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (!error) {
            clearUser()
        }
        return { error }
    }

    return {
        user,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
        setUser,
    }
}
