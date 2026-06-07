export default function Loader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-sky-500/20" />
        <div className="absolute inset-0 rounded-full border-t-2 border-sky-400 animate-spin" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 opacity-80 animate-pulse" />
      </div>
      <p className="text-white/40 text-sm font-medium tracking-widest uppercase">Yuklanmoqda</p>
    </div>
  )
}
