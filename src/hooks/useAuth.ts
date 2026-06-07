import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  useEffect(() => {
    if (profile !== null) setLoading(false)
  }, [profile])

  const signOut = async () => {
    if (profile) {
      await supabase.from('profiles').update({ is_online: false }).eq('id', profile.id)
    }
    await supabase.auth.signOut()
    setProfile(null)
  }

  return { profile, loading, signOut, refetchProfile: () => profile && fetchProfile(profile.id) }
}
