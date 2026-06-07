import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'
import Avatar from '../components/shared/Avatar'
import { formatDistanceToNow } from 'date-fns'
import { uz } from 'date-fns/locale'
import { Users } from 'lucide-react'

function LastSeen({ profile }: { profile: Profile }) {
  if (profile.is_online) {
    return <span className="text-xs text-emerald-400 font-medium">Online</span>
  }
  const ago = profile.last_seen
    ? formatDistanceToNow(new Date(profile.last_seen), { addSuffix: true, locale: uz })
    : 'noma\'lum'
  return <span className="text-xs text-white/30">{ago}</span>
}

export default function FamilyPage() {
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles').select('*').order('is_online', { ascending: false })
      .then(({ data }) => {
        if (data) setMembers(data)
        setLoading(false)
      })

    const channel = supabase
      .channel('profiles_presence')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        setMembers(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const onlineCount = members.filter(m => m.is_online).length

  return (
    <div className="flex flex-col h-full overflow-hidden pb-16 md:pb-0">
      {/* Header */}
      <div className="glass border-b border-white/[0.06] px-4 md:px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-pink-500/30 border border-violet-500/20 flex items-center justify-center">
            <Users size={18} className="text-violet-300" />
          </div>
          <div>
            <h2 className="font-semibold">Oila A'zolari</h2>
            <p className="text-xs text-white/40">
              {members.length} a'zo · {' '}
              <span className="text-emerald-400">{onlineCount} online</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-white/[0.06] mx-auto mb-3" />
                <div className="h-3 bg-white/[0.06] rounded mx-auto w-24 mb-2" />
                <div className="h-2.5 bg-white/[0.04] rounded mx-auto w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {members.map((member, i) => (
              <div
                key={member.id}
                className="glass rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:bg-white/[0.06] transition-all duration-200 animate-fade-in group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="relative">
                  <Avatar profile={member} size="lg" />
                  <span className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#070d1a] ${
                    member.is_online
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                      : 'bg-white/20'
                  }`} />
                </div>

                <div>
                  <p className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                    {member.full_name}
                  </p>
                  <span className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/[0.08] text-white/60">
                    {member.role}
                  </span>
                </div>

                <LastSeen profile={member} />
              </div>
            ))}
          </div>
        )}

        {!loading && members.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Users size={48} className="mb-4 opacity-30" />
            <p>Hali hech kim yo'q</p>
          </div>
        )}
      </div>
    </div>
  )
}
