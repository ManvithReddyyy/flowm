import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme.store'
import ProtectedRoute from '@/components/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import LoginPage from '@/pages/Auth/LoginPage'
import SignupPage from '@/pages/Auth/SignupPage'
import WorkspaceDashboard from '@/pages/WorkspaceDashboard'
import BoardPage from '@/pages/BoardPage'
import TeamPage from '@/pages/TeamPage'
import SettingsPage from '@/pages/SettingsPage'
import { Toaster } from '@/components/ui/sonner'

import { CommandMenu } from '@/components/layout/CommandMenu'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useThemeStore()

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
    }, [theme])

    return <>{children}</>
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <BrowserRouter>
                    <CommandMenu />
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />

                        {/* Protected routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <MainLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<WorkspaceDashboard />} />
                            <Route path="team" element={<TeamPage />} />
                            <Route path="project/:projectId" element={<BoardPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                        </Route>
                    </Routes>
                    <Toaster />
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default App
