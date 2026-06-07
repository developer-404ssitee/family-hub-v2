import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { MessageSquare, Users, User, LogOut, Home, Shield } from 'lucide-react'
import Avatar from '../shared/Avatar'

export default function AppLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/family', icon: Users, label: "Oila" },
    { to: '/profile', icon: User, label: 'Profil' },
    ...(profile?.role === 'admin' ? [{ to: '/admin', icon: Shield, label: 'Admin' }] : []),
  ]

  const handleSignOut = async () => { await signOut(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 glass border-r border-white/[0.06] p-4 gap-2 shrink-0">
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.4)]">
            <Home size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text text-transparent">Family Hub</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-500/20' : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors">
            <Avatar profile={profile} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.full_name}</p>
              <p className="text-xs text-white/40 truncate">{profile?.role}</p>
            </div>
            <button onClick={handleSignOut} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden"><Outlet /></main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 glass border-t border-white/[0.06] flex items-center justify-around px-4 py-2 z-50">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isActive ? 'text-sky-400' : 'text-white/40'}`}>
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
