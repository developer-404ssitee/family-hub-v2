import { useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Avatar from '../components/shared/Avatar'
import type { FamilyRole } from '../types'
import { Camera, LogOut, Save, User } from 'lucide-react'

const ROLES: FamilyRole[] = ['Dada', 'Ona', 'Aka', 'Opa', 'Uka', 'Singil', 'Buva', 'Buvi', 'Amaki', 'Xola', 'Boshqa']

export default function ProfilePage() {
  const { profile, signOut, refetchProfile } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    role: (profile?.role || 'Dada') as FamilyRole,
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)

    let avatar_url = profile.avatar_url

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${profile.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (!upErr) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = data.publicUrl + '?v=' + Date.now()
      }
    }

    await supabase.from('profiles').update({
      full_name: form.full_name,
      role: form.role,
      avatar_url,
    }).eq('id', profile.id)

    if (refetchProfile) refetchProfile()
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2500)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-16 md:pb-0">
      {/* Header */}
      <div className="glass border-b border-white/[0.06] px-4 md:px-6 py-4 shrink-0 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-rose-500/30 border border-amber-500/20 flex items-center justify-center">
          <User size={18} className="text-amber-300" />
        </div>
        <h2 className="font-semibold">Profil</h2>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-lg mx-auto w-full">
        {/* Current profile card */}
        <div className="glass-strong rounded-2xl p-6 flex items-center gap-4 mb-6 animate-fade-in">
          <Avatar profile={profile} size="xl" />
          <div>
            <p className="font-bold text-xl">{profile?.full_name}</p>
            <p className="text-white/50 text-sm mt-0.5">{profile?.role}</p>
            <p className="text-white/30 text-xs mt-1">{profile?.email}</p>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="glass-strong rounded-2xl p-6 space-y-5 animate-slide-up">
          <h3 className="font-semibold text-lg">Ma'lumotlarni tahrirlash</h3>

          {/* Avatar */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Profil rasmi</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarPreview
                  ? <img src={avatarPreview} className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10" alt="" />
                  : <Avatar profile={profile} size="lg" />
                }
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <Camera size={18} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-ghost text-sm"
              >
                Rasm almashtirish
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Ism va Familiya</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Oiladagi lavozim</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value as FamilyRole })}
              className="input-field appearance-none cursor-pointer"
            >
              {ROLES.map(r => <option key={r} value={r} className="bg-[#0d1929]">{r}</option>)}
            </select>
          </div>

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-emerald-400 text-sm flex items-center gap-2">
              ✓ Ma'lumotlar saqlandi!
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            {saving
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Save size={18} /> Saqlash</>
            }
          </button>
        </form>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="mt-4 w-full py-3 px-6 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <LogOut size={18} />
          Akkauntdan chiqish
        </button>
      </div>
    </div>
  )
}
