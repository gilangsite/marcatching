'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import styles from '../course.module.css'

type RecoveryState = 'checking' | 'ready' | 'invalid' | 'saved'

export default function CourseResetPasswordPage() {
  const router = useRouter()
  const [recoveryState, setRecoveryState] = useState<RecoveryState>('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function validateRecoverySession() {
      const hash = new URLSearchParams(window.location.hash.slice(1))
      if (hash.get('error') || hash.get('error_code')) {
        if (active) setRecoveryState('invalid')
        return
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!active) return
      setRecoveryState(user && !userError ? 'ready' : 'invalid')
    }

    void validateRecoverySession()
    return () => { active = false }
  }, [])

  async function handleSavePassword(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Gunakan minimal 6 karakter untuk password baru.')
      return
    }
    if (password !== confirmPassword) {
      setError('Password baru dan konfirmasi password belum sama.')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError('Password belum berhasil disimpan. Buka ulang link dari email atau minta link reset baru.')
      setSaving(false)
      return
    }

    await supabase.auth.signOut()
    setRecoveryState('saved')
    window.setTimeout(() => router.replace('/login?password-reset=success'), 1200)
  }

  return (
    <main className={`${styles.authPage} ${styles.resetAuthPage}`}>
      <section className={styles.authPanel}>
        <div className={`${styles.authCard} ${styles.resetAuthCard}`}>
          <div className={styles.resetAuthLogo}>
            <Image src="/logo-type-white.png" alt="Marcatching" width={142} height={47} priority />
            <span>Learning OS</span>
          </div>

          {recoveryState === 'checking' && (
            <div className={styles.resetAuthState}>
              <span className={styles.loader} />
              <h1>Memeriksa link reset...</h1>
              <p>Tunggu sebentar. Kami sedang memvalidasi link dari email kamu.</p>
            </div>
          )}

          {recoveryState === 'invalid' && (
            <div className={styles.resetAuthState}>
              <div className={styles.resetAuthIcon}><ShieldCheck size={25} /></div>
              <h1>Link tidak valid atau kedaluwarsa.</h1>
              <p>Minta link reset password baru dari halaman login, lalu gunakan link terbaru yang masuk ke email.</p>
              <Link href="/login" className={styles.authBtn}>
                <ArrowLeft size={17} /> Kembali ke login
              </Link>
            </div>
          )}

          {recoveryState === 'saved' && (
            <div className={styles.resetAuthState}>
              <div className={`${styles.resetAuthIcon} ${styles.resetAuthIconSuccess}`}>
                <CheckCircle2 size={25} />
              </div>
              <h1>Password baru tersimpan.</h1>
              <p>Kamu akan diarahkan kembali ke halaman login.</p>
            </div>
          )}

          {recoveryState === 'ready' && (
            <>
              <div className={styles.resetAuthIcon}><KeyRound size={25} /></div>
              <div className={styles.authHeading}>
                <span>Secure recovery</span>
                <h1>Buat password baru.</h1>
                <p>Password lama akan diganti setelah password baru berhasil disimpan.</p>
              </div>

              <form className={styles.authForm} onSubmit={handleSavePassword}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="new-password">Password baru</label>
                  <div className={styles.passwordField}>
                    <input
                      id="new-password"
                      className={styles.formInput}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(value => !value)}
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="confirm-new-password">Konfirmasi password baru</label>
                  <input
                    id="confirm-new-password"
                    className={styles.formInput}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>

                {error && <div className={styles.authError}>{error}</div>}
                <button type="submit" className={styles.authBtn} disabled={saving}>
                  {saving ? 'Menyimpan password...' : <>Simpan password baru <ArrowRight size={17} /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
