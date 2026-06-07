import { useState, useRef, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, Home, UserPlus, Upload, X } from 'lucide-react'
import type { FamilyRole } from '../types'

const ROLES: FamilyRole[] = ['Dada', 'Ona', 'Aka', 'Opa', 'Uka', 'Singil', 'Buva', 'Buvi', 'Amaki', 'Xola', 'Boshqa']

export default function RegisterPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'Dada' as FamilyRole })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (authErr || !authData.user) {
      setError(authErr?.message || "Ro'yxatdan o'tishda xato")
      setLoading(false)
      return
    }

    let avatar_url: string | null = null
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${authData.user.id}/avatar.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = urlData.publicUrl
      }
    }

    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      email: form.email,
      full_name: form.full_name,
      role: form.role,
      avatar_url,
      is_online: true,
      last_seen: new Date().toISOString(),
    })

    if (profileErr) {
      setError("Profil yaratishda xato: " + profileErr.message)
      setLoading(false)
      return
    }

    navigate('/chat')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-[0_0_30px_rgba(14,165,233,0.4)] mb-3">
            <Home size={24} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-sky-300 via-white to-indigo-300 bg-clip-text text-transparent">
            Family Hub
          </h1>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">Ro'yxatdan o'tish</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar upload */}
            <div className="flex justify-center">
              <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                <div className="w-20 h-20 rounded-full overflow-hidden bg-white/[0.06] border-2 border-dashed border-white/20 group-hover:border-sky-500/50 flex items-center justify-center transition-all">
                  {avatarPreview ? (
                    <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar" />
                  ) : (
                    <Upload size={24} className="text-white/30 group-hover:text-sky-400 transition-colors" />
                  )}
                </div>
                {avatarPreview && (
                  <button type="button" onClick={e => { e.stopPropagation(); setAvatarFile(null); setAvatarPreview(null) }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                    <X size={12} />
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Ism va Familiya</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="input-field"
                placeholder="Abdullayev Ali"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Parol</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-12"
                  placeholder="Kamida 6 belgi"
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><UserPlus size={18} /> Ro'yxatdan o'tish</>
              }
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Akkauntingiz bormi?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">Kirish</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
