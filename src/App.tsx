import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { usePresence } from './hooks/usePresence'
import { requestNotificationPermission, onForegroundMessage } from './lib/firebase'
import { supabase } from './lib/supabase'
import { useEffect } from 'react'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import FamilyPage from './pages/FamilyPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import AppLayout from './components/layout/AppLayout'
import Loader from './components/layout/Loader'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return <Loader />
  if (!profile) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  if (loading) return <Loader />
  if (profile) return <Navigate to="/chat" replace />
  return <>{children}</>
}

function AppInner() {
  const { profile } = useAuth()
  usePresence(profile?.id)

  useEffect(() => {
    if (!profile) return
    requestNotificationPermission().then(async (token) => {
      if (token && token !== profile.fcm_token) {
        await supabase.from('profiles').update({ fcm_token: token }).eq('id', profile.id)
      }
    })
    const unsub = onForegroundMessage((payload: any) => {
      const { title, body } = payload.notification || {}
      if (Notification.permission === 'granted') {
        new Notification(title || 'Family Hub', { body, icon: '/icon-192.png' })
      }
    })
    return () => { if (typeof unsub === 'function') unsub() }
  }, [profile])

  return (
    <Routes>
      <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
      <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
      <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  )
}

export default function App() {
  return <BrowserRouter><AppInner /></BrowserRouter>
}
