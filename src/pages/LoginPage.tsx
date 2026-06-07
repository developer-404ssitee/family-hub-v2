import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, Home, LogIn } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError("Email yoki parol noto'g'ri")
      setLoading(false)
    } else {
      navigate('/chat')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-[0_0_40px_rgba(14,165,233,0.5)] mb-4 animate-float">
            <Home size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold bg-gradient-to-r from-sky-300 via-white to-indigo-300 bg-clip-text text-transparent">
            Family Hub
          </h1>
          <p className="text-white/40 text-sm mt-1">Oilangizga qaytib keling</p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6">Kirish</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn size={18} /> Kirish</>
              )}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Akkauntingiz yo'qmi?{' '}
            <Link to="/register" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">
              Ro'yxatdan o'tish
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
