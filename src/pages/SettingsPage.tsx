import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Building, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from 'sonner'

export default function SettingsPage() {
    const { user, signOut, setUser } = useAuth()
    const { currentWorkspace } = useWorkspaceStore()
    const { updateWorkspace } = useWorkspaces()

    const [workspaceName, setWorkspaceName] = useState('')
    const [workspaceSlug, setWorkspaceSlug] = useState('')
    const [fullName, setFullName] = useState('')
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

    useEffect(() => {
        if (currentWorkspace) {
            setWorkspaceName(currentWorkspace.name)
            setWorkspaceSlug(currentWorkspace.slug)
        }
        if (user?.full_name) {
            setFullName(user.full_name)
        }
    }, [currentWorkspace, user])

    const handleUpdateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentWorkspace) return

        try {
            await updateWorkspace.mutateAsync({
                id: currentWorkspace.id,
                name: workspaceName,
                slug: workspaceSlug,
            })
            toast.success('Workspace updated successfully')
        } catch (error) {
            console.error('Error updating workspace:', error)
            toast.error('Failed to update workspace')
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setIsUpdatingProfile(true)
        try {
            // Update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                // @ts-ignore
                .update({ full_name: fullName })
                .eq('id', user.id)

            if (profileError) throw profileError

            // Update Auth metadata (persists session)
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            })

            if (authError) throw authError

            // Update global state
            setUser({ ...user, full_name: fullName })

            toast.success('Profile updated successfully', {
                duration: 3000,
                position: 'bottom-right'
            })
        } catch (error: any) {
            console.error('Error updating profile:', error)
            toast.error(error.message || 'Failed to update profile', {
                duration: 3000,
                position: 'bottom-right'
            })
        } finally {
            setIsUpdatingProfile(false)
        }
    }

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (!user?.email) return

        setIsUpdatingPassword(true)
        try {
            // Verify current password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            })

            if (signInError) {
                throw new Error('Incorrect current password')
            }

            // Update to new password
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            toast.success('Password updated successfully')
            setIsPasswordDialogOpen(false)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: any) {
            console.error('Error updating password:', error)
            toast.error(error.message || 'Failed to update password')
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account settings.</p>
            </div>

            <div className="grid gap-8">
                {/* Profile Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <CardTitle>Profile</CardTitle>
                        </div>
                        <CardDescription>
                            Your personal information and account details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24 border-2 border-border">
                                <AvatarImage src={user?.avatar_url} />
                                <AvatarFallback className="text-xl">
                                    {user?.email ? getInitials(user.email) : 'ME'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-4 flex-1">
                                <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="fullName">Display Name</Label>
                                        <Input
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="John Doe"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            You can change your display name twice per year.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{user?.email}</span>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4 bg-muted/50 flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                            Account ID: {user?.id}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => signOut()}>
                                Sign Out
                            </Button>
                            <Button type="submit" form="profile-form" size="sm" disabled={isUpdatingProfile}>
                                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                {/* Organization Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            <CardTitle>Organization</CardTitle>
                        </div>
                        <CardDescription>
                            Details of your current organization.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="workspace-form" onSubmit={handleUpdateWorkspace} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="workspaceName">Organization Name</Label>
                                <Input
                                    id="workspaceName"
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    placeholder="Acme Corp"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="workspaceSlug">Organization URL</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-sm font-medium">flowm.app/</span>
                                    <Input
                                        id="workspaceSlug"
                                        value={workspaceSlug}
                                        onChange={(e) => setWorkspaceSlug(e.target.value)}
                                        placeholder="acme-corp"
                                    />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4 bg-muted/50 flex justify-end">
                        <Button type="submit" form="workspace-form" disabled={updateWorkspace.isPending}>
                            {updateWorkspace.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </CardFooter>
                </Card>



                {/* Security Card (Placeholder) */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            <CardTitle>Security</CardTitle>
                        </div>
                        <CardDescription>
                            Manage your password and security settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                                <h4 className="font-medium">Password</h4>
                                <p className="text-sm text-muted-foreground">
                                    Change your password to keep your account secure.
                                </p>
                            </div>
                            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Change Password</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Change Password</DialogTitle>
                                        <DialogDescription>
                                            Enter your new password below.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="currentPassword"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <span className="sr-only">Toggle password visibility</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="newPassword"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <span className="sr-only">Toggle password visibility</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <span className="sr-only">Toggle password visibility</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsPasswordDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isUpdatingPassword}>
                                                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
