import type { Profile } from '../../types'

interface Props {
  profile: Profile | null | undefined
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showOnline?: boolean
}

const sizes = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

const dotSizes = {
  xs: 'w-2 h-2 border',
  sm: 'w-2.5 h-2.5 border',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const colors = [
  'from-sky-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-600',
]

function colorFor(name: string) {
  const idx = (name.charCodeAt(0) || 0) % colors.length
  return colors[idx]
}

export default function Avatar({ profile, size = 'md', showOnline = false }: Props) {
  const s = sizes[size]
  const ds = dotSizes[size]

  return (
    <div className={`relative shrink-0 ${s} rounded-full`}>
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.full_name}
          className={`${s} rounded-full object-cover ring-2 ring-white/10`}
        />
      ) : (
        <div className={`${s} rounded-full bg-gradient-to-br ${colorFor(profile?.full_name || 'U')} flex items-center justify-center font-bold text-white ring-2 ring-white/10`}>
          {getInitials(profile?.full_name || '?')}
        </div>
      )}
      {showOnline && (
        <span className={`absolute bottom-0 right-0 ${ds} rounded-full border-[#070d1a] ${profile?.is_online ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]' : 'bg-white/20'}`} />
      )}
    </div>
  )
}
