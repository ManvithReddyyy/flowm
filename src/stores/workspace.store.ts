import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Workspace {
    id: string
    name: string
    slug: string
}

interface WorkspaceState {
    currentWorkspace: Workspace | null
    setCurrentWorkspace: (workspace: Workspace | null) => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set) => ({
            currentWorkspace: null,
            setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
        }),
        {
            name: 'workspace-storage',
        }
    )
)
