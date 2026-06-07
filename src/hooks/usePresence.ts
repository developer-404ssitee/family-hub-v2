import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePresence(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return

    const setOnline = () =>
      supabase.from('profiles').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', userId)

    const setOffline = () =>
      supabase.from('profiles').update({ is_online: false, last_seen: new Date().toISOString() }).eq('id', userId)

    setOnline()

    const interval = setInterval(() => {
      supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', userId)
    }, 30000)

    window.addEventListener('beforeunload', setOffline)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) setOffline()
      else setOnline()
    })

    return () => {
      clearInterval(interval)
      setOffline()
      window.removeEventListener('beforeunload', setOffline)
    }
  }, [userId])
}
