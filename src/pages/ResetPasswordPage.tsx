import { useState, type FormEvent } from 'react'
import { updatePassword } from '../services/authService'

interface Props { onDone: () => void }

export default function ResetPasswordPage({ onDone }: Props) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (password.length < 12) {
      setError('Le mot de passe doit contenir au moins 12 caractères.')
      return
    }
    if (password !== confirmation) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      await updatePassword(password)
      setSuccess('Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter.')
      window.setTimeout(onDone, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de modifier le mot de passe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f6f1] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-[#171a18]/5 sm:p-9">
        <p className="mb-3 text-sm font-extrabold tracking-[0.2em] text-[#4A7A3B]">KOROBO</p>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Définir un nouveau mot de passe</h1>
        <p className="mb-6 text-sm text-gray-500">Choisissez un mot de passe d’au moins 12 caractères. Le lien doit être valide et non expiré.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
            Nouveau mot de passe
            <input type="password" autoComplete="new-password" required minLength={12} value={password} onChange={event => setPassword(event.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:border-[#4A7A3B] focus:ring-2 focus:ring-[#4A7A3B]/10" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
            Confirmer le mot de passe
            <input type="password" autoComplete="new-password" required minLength={12} value={confirmation} onChange={event => setConfirmation(event.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 font-normal outline-none focus:border-[#4A7A3B] focus:ring-2 focus:ring-[#4A7A3B]/10" />
          </label>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {success && <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}
          <button type="submit" disabled={loading} className="rounded-xl bg-[#3d6b2a] px-4 py-3 font-semibold text-white transition hover:bg-[#4e8a35] disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Modification…' : 'Modifier mon mot de passe'}</button>
        </form>
      </section>
    </main>
  )
}
