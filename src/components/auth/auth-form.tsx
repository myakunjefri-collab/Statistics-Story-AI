'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { useAuth } from '@/lib/auth'
import { Link, useRouter } from '@/lib/navigation'

type Mode = 'login' | 'register'

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const { signIn, register } = useAuth()
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmId = useId()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

  function validate() {
    const next: Record<string, string> = {}
    if (isRegister && !name.trim()) next.name = 'Nama lengkap wajib diisi.'
    if (!email.trim()) next.email = 'Email wajib diisi.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Format email tidak valid.'
    if (!password) next.password = 'Kata sandi wajib diisi.'
    else if (isRegister && password.length < 8) next.password = 'Kata sandi minimal 8 karakter.'
    if (isRegister && confirm !== password) next.confirm = 'Konfirmasi kata sandi tidak sesuai.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('')
    if (!validate()) return
    setLoading(true)
    if (isRegister) {
      const res = await register(name, email, password)
      setLoading(false)
      if (!res.success) {
        setErrors({ auth: res.message || 'Gagal mendaftarkan akun.' })
        return
      }
      setStatus('Akun berhasil dibuat. Mengarahkan ke halaman masuk...')
      setTimeout(() => router.push('/login'), 700)
      return
    }
    const result = await signIn(email, password)
    setLoading(false)
    if (!result.success) {
      setErrors({ auth: result.message || 'Email atau kata sandi tidak sesuai.' })
      return
    }
    setStatus('Berhasil masuk. Mengarahkan ke dashboard...')
    setTimeout(() => router.push('/dashboard'), 500)
  }

  const fieldError = (key: string) => errors[key]

  return (
    <form onSubmit={submit} noValidate className="space-y-5" aria-busy={loading}>
      {isRegister ? (
        <div className="space-y-2">
          <Label htmlFor={nameId}>Nama Lengkap</Label>
          <Input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            aria-invalid={!!fieldError('name')}
            aria-describedby={fieldError('name') ? `${nameId}-error` : undefined}
          />
          {fieldError('name') && (
            <p id={`${nameId}-error`} className="text-sm text-danger" role="alert">
              {fieldError('name')}
            </p>
          )}
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-invalid={!!fieldError('email')}
          aria-describedby={fieldError('email') ? `${emailId}-error` : undefined}
        />
        {fieldError('email') && (
          <p id={`${emailId}-error`} className="text-sm text-danger" role="alert">
            {fieldError('email')}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={passwordId}>Kata Sandi</Label>
          {!isRegister && (
            <button type="button" className="text-xs text-electric hover:underline">
              Lupa kata sandi?
            </button>
          )}
        </div>
        <Input
          id={passwordId}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          aria-invalid={!!fieldError('password')}
          aria-describedby={fieldError('password') ? `${passwordId}-error` : undefined}
        />
        {fieldError('password') && (
          <p id={`${passwordId}-error`} className="text-sm text-danger" role="alert">
            {fieldError('password')}
          </p>
        )}
      </div>
      {isRegister ? (
        <div className="space-y-2">
          <Label htmlFor={confirmId}>Konfirmasi Kata Sandi</Label>
          <Input
            id={confirmId}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            aria-invalid={!!fieldError('confirm')}
            aria-describedby={fieldError('confirm') ? `${confirmId}-error` : undefined}
          />
          {fieldError('confirm') && (
            <p id={`${confirmId}-error`} className="text-sm text-danger" role="alert">
              {fieldError('confirm')}
            </p>
          )}
        </div>
      ) : null}
      {errors.auth ? (
        <p
          className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger"
          role="alert"
        >
          {errors.auth}
        </p>
      ) : null}
      {status ? (
        <p
          className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success"
          role="status"
          aria-live="polite"
        >
          {status}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            {isRegister ? 'Membuat akun...' : 'Memeriksa akun...'}
          </>
        ) : (
          <>
            {isRegister ? 'Daftar' : 'Masuk'}
            <ArrowRight aria-hidden="true" />
          </>
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
        <Link
          href={isRegister ? '/login' : '/register'}
          className="font-medium text-electric hover:underline"
        >
          {isRegister ? 'Masuk' : 'Daftar'}
        </Link>
      </p>
    </form>
  )
}
