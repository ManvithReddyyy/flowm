import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Mail, UserX } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'


type WorkspaceMember = {
    id: string
    user_id: string
    role: string
    profiles: {
        full_name: string
        email: string
        avatar_url: string | null
    }
}

export default function TeamPage() {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState('')
    const { currentWorkspace } = useWorkspaceStore()
    const { user } = useAuth()
    const queryClient = useQueryClient()

    // Fetch team members
    const { data: members } = useQuery<WorkspaceMember[]>({
        queryKey: ['workspace-members', currentWorkspace?.id],
        queryFn: async () => {
            if (!currentWorkspace) return []

            const { data } = await supabase
                .from('workspace_members')
                .select('id, user_id, role, profiles(full_name, email, avatar_url)')
                .eq('workspace_id', currentWorkspace.id)

            return (data || []) as unknown as WorkspaceMember[]
        },
        enabled: !!currentWorkspace,
    })

    // Invite member mutation
    const inviteMember = useMutation({
        mutationFn: async () => {
            if (!currentWorkspace || !email.trim()) return

            // In a real app, you'd:
            // 1. Send an email invite
            // 2. Create a pending invitation
            // 3. User signs up and accepts invite

            // For now, we'll just check if user exists and add them
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email.trim())
                .single()

            // @ts-ignore
            if (!existingUser) {
                throw new Error('User not found. They need to sign up first.')
            }

            // Add to workspace_members
            const { error } = await supabase
                .from('workspace_members')
                // @ts-ignore
                .insert({
                    workspace_id: currentWorkspace.id,
                    // @ts-ignore
                    user_id: existingUser.id,
                    role: 'member',
                })

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace-members'] })
            setOpen(false)
            setEmail('')
        },
        onError: (error: any) => {
            alert(error.message || 'Failed to invite member')
        },
    })

    // Remove member mutation
    const removeMember = useMutation({
        mutationFn: async (memberId: string) => {
            const { error } = await supabase
                .from('workspace_members')
                .delete()
                .eq('id', memberId)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace-members'] })
        },
    })

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault()
        inviteMember.mutate()
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="h-full p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your workspace members
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Invite Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite Team Member</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Note: The user must already have an account to be invited.
                                </p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={inviteMember.isPending}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    {inviteMember.isPending ? 'Inviting...' : 'Send Invite'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Members List */}
            <div className="space-y-2">
                {!members || members.length === 0 ? (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                No team members yet. Invite some to get started.
                            </p>
                        </div>
                    </div>
                ) : (
                    members.map((member: any) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>
                                        {getInitials(member.profiles.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{member.profiles.full_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {member.profiles.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                                    {member.role}
                                </Badge>
                                {member.user_id !== user?.id && member.role !== 'owner' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMember.mutate(member.id)}
                                    >
                                        <UserX className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
