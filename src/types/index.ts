export interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  avatar_url: string | null
  fcm_token: string | null
  is_online: boolean
  last_seen: string
  created_at: string
}

export interface Message {
  id: string
  user_id: string
  content: string
  type?: 'text' | 'image' | 'audio'
  reactions?: Record<string, string[]>
  reply_to_id?: string | null
  reply_to_content?: string | null
  reply_to_name?: string | null
  created_at: string
  profile?: Profile
}

export type FamilyRole =
  | 'Dada' | 'Ona' | 'Aka' | 'Opa' | 'Uka' | 'Singil'
  | 'Buva' | 'Buvi' | 'Amaki' | 'Xola' | 'Boshqa' | 'admin'
