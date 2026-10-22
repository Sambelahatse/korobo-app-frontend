import { useEffect, useState } from 'react'

export type ToastKind = 'success' | 'error' | 'info'
type ToastItem = { id: number; message: string; kind: ToastKind }
const EVENT_NAME = 'korobo:toast'
let nextId = 0

export function showToast(message: string, kind: ToastKind = 'success') {
  if (typeof window === 'undefined' || !message.trim()) return
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { message, kind } }))
}

export default function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; kind: ToastKind }>).detail
      if (!detail?.message) return
      const id = ++nextId
      setItems(current => [...current, { id, message: detail.message, kind: detail.kind }].slice(-4))
      window.setTimeout(() => setItems(current => current.filter(item => item.id !== id)), 4500)
    }
    window.addEventListener(EVENT_NAME, onToast)
    return () => window.removeEventListener(EVENT_NAME, onToast)
  }, [])

  return <div aria-live="polite" aria-relevant="additions removals" className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6 sm:top-6">
    {items.map(item => <div key={item.id} role={item.kind === 'error' ? 'alert' : 'status'} className={'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ' + (item.kind === 'success' ? 'border-emerald-200 bg-white text-emerald-900' : item.kind === 'error' ? 'border-rose-200 bg-white text-rose-900' : 'border-blue-200 bg-white text-blue-900')}>
      <span className={'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ' + (item.kind === 'success' ? 'bg-emerald-100 text-emerald-700' : item.kind === 'error' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700')}>{item.kind === 'success' ? '✓' : item.kind === 'error' ? '!' : 'i'}</span>
      <p className="min-w-0 flex-1 text-sm font-medium leading-5">{item.message}</p>
      <button type="button" aria-label="Fermer la notification" onClick={() => setItems(current => current.filter(entry => entry.id !== item.id))} className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">×</button>
    </div>)}
  </div>
}
