import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Profile } from '../types'
import Avatar from '../components/shared/Avatar'
import { Shield, Trash2, UserX, Crown } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'

export default function AdminPage() {
  const { profile } = useAuth()
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)



  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setMembers(data); setLoading(false) })
  }, [])

  if (profile?.role !== 'admin') return <Navigate to="/chat" replace />

  const deleteUser = async (userId: string) => {
    if (!confirm('Bu foydalanuvchini o\'chirmoqchimisiz?')) return
    setDeleting(userId)
    await supabase.from('messages').delete().eq('user_id', userId)
    await supabase.from('profiles').delete().eq('id', userId)
    setMembers(prev => prev.filter(m => m.id !== userId))
    setDeleting(null)
  }

  const toggleAdmin = async (member: Profile) => {
    const newRole = member.role === 'admin' ? 'Boshqa' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', member.id)
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: newRole } : m))
  }

  return (
    <div className="flex flex-col h-full overflow-hidden pb-16 md:pb-0">
      <div className="glass border-b border-white/[0.06] px-4 md:px-6 py-4 shrink-0 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-500/30 border border-red-500/20 flex items-center justify-center">
          <Shield size={18} className="text-red-300" />
        </div>
        <div>
          <h2 className="font-semibold">Admin Panel</h2>
          <p className="text-xs text-white/40">{members.length} a'zo</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-red-500/30 border-t-red-400 rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="glass rounded-2xl p-4 flex items-center gap-4 animate-fade-in">
                <Avatar profile={member} size="md" showOnline />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{member.full_name}</p>
                    {member.role === 'admin' && <Crown size={14} className="text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-white/40">{member.email}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {member.role} · {member.is_online ? (
                      <span className="text-emerald-400">Online</span>
                    ) : (
                      member.last_seen ? formatDistanceToNow(new Date(member.last_seen), { addSuffix: true, locale: uz }) : 'noma\'lum'
                    )}
                  </p>
                </div>

                {member.id !== profile?.id && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => toggleAdmin(member)}
                      className={`p-2 rounded-xl transition-all text-xs font-medium ${member.role === 'admin' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-white/[0.06] text-white/50 hover:bg-white/10'}`}
                      title={member.role === 'admin' ? "Admin'dan olish" : "Admin qilish"}
                    >
                      <Crown size={16} />
                    </button>
                    <button
                      onClick={() => deleteUser(member.id)}
                      disabled={deleting === member.id}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                      title="O'chirish"
                    >
                      {deleting === member.id
                        ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        : <UserX size={16} />
                      }
                    </button>
                  </div>
                )}

                {member.id === profile?.id && (
                  <span className="text-xs text-sky-400 font-medium px-2 py-1 bg-sky-500/10 rounded-lg">Siz</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
