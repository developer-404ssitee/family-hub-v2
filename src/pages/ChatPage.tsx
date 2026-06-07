import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Message } from '../types'
import Avatar from '../components/shared/Avatar'
import { Send, Smile, Image, Mic, MicOff, Trash2, Reply, X } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'
import { Theme } from 'emoji-picker-react'
import { format, isToday, isYesterday } from 'date-fns'
import { uz } from 'date-fns/locale'

function formatTime(iso: string) {
  const d = new Date(iso)
  if (isToday(d)) return format(d, 'HH:mm')
  if (isYesterday(d)) return `Kecha ${format(d, 'HH:mm')}`
  return format(d, 'd MMM HH:mm', { locale: uz })
}

const REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '🔥']

export default function ChatPage() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [reactionMsg, setReactionMsg] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const audioChunks = useRef<Blob[]>([])

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  useEffect(() => {
    supabase
      .from('messages')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: true })
      .limit(150)
      .then(({ data }) => {
        if (data) setMessages(data as Message[])
        setLoading(false)
        setTimeout(() => scrollToBottom(false), 50)
      })

    const channel = supabase
      .channel('messages_v2')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const { data } = await supabase.from('messages').select('*, profile:profiles(*)').eq('id', payload.new.id).single()
        if (data) { setMessages(prev => [...prev, data as Message]); setTimeout(() => scrollToBottom(), 50) }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, async (payload) => {
        const { data } = await supabase.from('messages').select('*, profile:profiles(*)').eq('id', payload.new.id).single()
        if (data) setMessages(prev => prev.map(m => m.id === payload.new.id ? data as Message : m))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [scrollToBottom])

  const sendMessage = async (content: string, type = 'text') => {
    if (!content.trim() || !profile) return
    setText('')
    setShowEmoji(false)
    const msgData: any = { user_id: profile.id, content, type }
    if (replyTo) {
      msgData.reply_to_id = replyTo.id
      msgData.reply_to_content = replyTo.content
      msgData.reply_to_name = replyTo.profile?.full_name
      setReplyTo(null)
    }
    await supabase.from('messages').insert(msgData)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(text) }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    const path = `chat/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('chat-media').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('chat-media').getPublicUrl(path)
      await sendMessage(data.publicUrl, 'image')
    }
    e.target.value = ''
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      audioChunks.current = []
      mr.ondataavailable = (e) => audioChunks.current.push(e.data)
      mr.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
        const path = `chat/audio_${Date.now()}.webm`
        const { error } = await supabase.storage.from('chat-media').upload(path, blob)
        if (!error) {
          const { data } = supabase.storage.from('chat-media').getPublicUrl(path)
          await sendMessage(data.publicUrl, 'audio')
        }
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
      setMediaRecorder(mr)
      setRecording(true)
    } catch { console.warn('Mikrofon ruxsati yo\'q') }
  }

  const stopRecording = () => { mediaRecorder?.stop(); setRecording(false); setMediaRecorder(null) }

  const deleteMessage = async (id: string) => { await supabase.from('messages').delete().eq('id', id) }

  const addReaction = async (msgId: string, emoji: string) => {
    const msg = messages.find(m => m.id === msgId)
    if (!msg || !profile) return
    const reactions = { ...(msg.reactions || {}) }
    const users: string[] = reactions[emoji] || []
    const updated = users.includes(profile.id) ? users.filter((u: string) => u !== profile.id) : [...users, profile.id]
    if (updated.length === 0) delete reactions[emoji]
    else reactions[emoji] = updated
    await supabase.from('messages').update({ reactions }).eq('id', msgId)
    setReactionMsg(null)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden pb-16 md:pb-0">
      <div className="glass border-b border-white/[0.06] px-4 md:px-6 py-4 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/30 to-indigo-500/30 border border-sky-500/20 flex items-center justify-center">
          <span className="text-lg">🏠</span>
        </div>
        <div>
          <h2 className="font-semibold">Oilaviy Chat</h2>
          <p className="text-xs text-white/40">{messages.length} xabar</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/30"><span className="text-4xl mb-3">💬</span><p>Birinchi bo'lib xabar yuboring!</p></div>
        ) : (
          messages.map((msg, i) => {
            const isSelf = msg.user_id === profile?.id
            const showAvatar = !isSelf && (i === 0 || messages[i - 1]?.user_id !== msg.user_id)
            const reactions = msg.reactions || {}

            return (
              <div key={msg.id} className={`flex items-end gap-2 group animate-fade-in ${isSelf ? 'flex-row-reverse' : ''}`}>
                {!isSelf ? (showAvatar ? <Avatar profile={msg.profile} size="xs" /> : <div className="w-7 shrink-0" />) : null}

                <div className={`flex flex-col max-w-[78%] ${isSelf ? 'items-end' : 'items-start'}`}>
                  {showAvatar && !isSelf && (
                    <span className="text-xs text-white/40 px-1 mb-1">{msg.profile?.full_name} · {msg.profile?.role}</span>
                  )}

                  {msg.reply_to_id && (
                    <div className="text-xs px-3 py-1.5 rounded-t-xl mb-0.5 border-l-2 border-sky-400 bg-white/[0.05] text-white/50 max-w-full truncate">
                      <span className="text-sky-400 font-medium">{msg.reply_to_name}: </span>
                      {msg.reply_to_content?.slice(0, 60)}
                    </div>
                  )}

                  <div className="relative">
                    <div className={`absolute top-1 ${isSelf ? '-left-20' : '-right-20'} hidden group-hover:flex gap-1 z-10`}>
                      <button onClick={() => setReplyTo(msg)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all"><Reply size={13} /></button>
                      <button onClick={() => setReactionMsg(reactionMsg === msg.id ? null : msg.id)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all"><span className="text-xs">😊</span></button>
                      {isSelf && <button onClick={() => deleteMessage(msg.id)} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-all"><Trash2 size={13} /></button>}
                    </div>

                    {reactionMsg === msg.id && (
                      <div className={`absolute ${isSelf ? 'right-0' : 'left-0'} -top-10 flex gap-1 bg-[#0d1929] border border-white/10 rounded-full px-2 py-1 z-20 shadow-xl animate-fade-in`}>
                        {REACTIONS.map(emoji => <button key={emoji} onClick={() => addReaction(msg.id, emoji)} className="hover:scale-125 transition-transform text-lg leading-none">{emoji}</button>)}
                      </div>
                    )}

                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isSelf ? 'bg-gradient-to-br from-sky-600 to-indigo-600 text-white' : 'glass text-white/90'}`}>
                      {msg.type === 'image' ? (
                        <img src={msg.content} alt="rasm" className="max-w-[240px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.content, '_blank')} />
                      ) : msg.type === 'audio' ? (
                        <audio controls src={msg.content} className="max-w-[220px]" />
                      ) : (
                        <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                      )}
                      <span className={`block text-[10px] mt-1 ${isSelf ? 'text-white/50' : 'text-white/30'} text-right`}>{formatTime(msg.created_at)}</span>
                    </div>
                  </div>

                  {Object.keys(reactions).length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {Object.entries(reactions).map(([emoji, users]: [string, any]) => (
                        <button key={emoji} onClick={() => addReaction(msg.id, emoji)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${users.includes(profile?.id) ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/10'}`}>
                          {emoji} <span>{users.length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {replyTo && (
        <div className="px-4 py-2 glass border-t border-white/[0.06] flex items-center gap-3">
          <div className="flex-1 border-l-2 border-sky-400 pl-3">
            <p className="text-xs text-sky-400 font-medium">{replyTo.profile?.full_name}</p>
            <p className="text-xs text-white/50 truncate">{replyTo.content?.slice(0, 80)}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-white/40 hover:text-white/70"><X size={16} /></button>
        </div>
      )}

      {showEmoji && (
        <div className="absolute bottom-20 left-4 z-50 animate-slide-up">
          <EmojiPicker onEmojiClick={(e) => { setText(prev => prev + e.emoji); inputRef.current?.focus() }} theme={Theme.DARK} height={350} width={300} />
        </div>
      )}

      <div className="shrink-0 px-3 md:px-6 py-3 glass border-t border-white/[0.06]">
        <div className="flex items-end gap-2">
          <button onClick={() => setShowEmoji(!showEmoji)} className={`p-2.5 rounded-xl transition-all ${showEmoji ? 'text-sky-400 bg-sky-500/10' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'}`}><Smile size={20} /></button>
          <button onClick={() => fileRef.current?.click()} className="p-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"><Image size={20} /></button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording}
            className={`p-2.5 rounded-xl transition-all ${recording ? 'text-red-400 bg-red-500/20 animate-pulse' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'}`}>
            {recording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <textarea ref={inputRef} value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKeyDown} rows={1}
            className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 outline-none resize-none focus:border-sky-500/50 transition-all max-h-32"
            placeholder="Xabar yozing..."
            onInput={e => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 128) + 'px' }}
          />
          <button onClick={() => sendMessage(text)} disabled={!text.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white disabled:opacity-40 hover:shadow-[0_0_16px_rgba(14,165,233,0.5)] transition-all active:scale-95">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
