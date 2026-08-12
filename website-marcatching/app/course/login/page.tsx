'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import styles from '../course.module.css'

type AuthMode = 'login' | 'register'

export default function CourseLoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const normalizedEmail = email.toLowerCase().trim()

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    if (query.get('password-reset') === 'success') {
      setSuccess('Password baru berhasil disimpan. Silakan masuk menggunakan password barumu.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  useEffect(() => {
    if (!forgotOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !forgotLoading) setForgotOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [forgotLoading, forgotOpen])

  function resetMessages() {
    setError('')
    setSuccess('')
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    resetMessages()
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
  }

  function openForgotPassword() {
    setForgotEmail(normalizedEmail)
    setForgotError('')
    setForgotSent(false)
    setForgotOpen(true)
  }

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault()
    const targetEmail = forgotEmail.toLowerCase().trim()
    setForgotError('')

    if (!targetEmail || !/^\S+@\S+\.\S+$/.test(targetEmail)) {
      setForgotError('Masukkan alamat email yang valid.')
      return
    }

    setForgotLoading(true)
    try {
      const response = await fetch('/api/course-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      })
      const data = await response.json() as { message?: string }
      if (!response.ok) throw new Error(data.message || 'Permintaan belum dapat diproses.')

      setForgotSent(true)
    } catch (requestError) {
      setForgotError(
        requestError instanceof Error
          ? requestError.message
          : 'Permintaan belum dapat diproses. Silakan coba lagi.',
      )
    } finally {
      setForgotLoading(false)
    }
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault()
    resetMessages()

    if (!normalizedEmail || !password) {
      setError('Email dan password wajib diisi.')
      return
    }
    if (password.length < 6) {
      setError('Gunakan minimal 6 karakter untuk password.')
      return
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password belum sama.')
      return
    }

    setLoading(true)

    let eligible = false
    try {
      const accessResponse = await fetch('/api/course-access/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      const accessData = await accessResponse.json() as { eligible?: boolean }
      if (!accessResponse.ok) throw new Error('Access validation failed')
      eligible = accessData.eligible === true
    } catch {
      setError('Kami belum dapat memeriksa aksesmu. Coba lagi beberapa saat.')
      setLoading(false)
      return
    }

    if (!eligible) {
      setError('Akses belum ditemukan. Gunakan email yang sama dengan email checkout atau hubungi tim Marcatching.')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { is_course_user: true } },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered') || signUpError.message.includes('User already')) {
        setError('Akun dengan email ini sudah ada. Silakan masuk.')
        setMode('login')
      } else {
        setError('Akun belum berhasil dibuat. Periksa kembali datamu atau coba beberapa saat lagi.')
      }
      setLoading(false)
      return
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (loginError) {
      setSuccess('Akun berhasil dibuat. Silakan masuk menggunakan email dan password barumu.')
      setMode('login')
      setLoading(false)
      return
    }

    router.replace('/')
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
    resetMessages()

    if (!normalizedEmail || !password) {
      setError('Masukkan email dan password untuk melanjutkan.')
      return
    }

    setLoading(true)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (loginError) {
      setError('Email atau password belum cocok. Pastikan kamu memakai akun member Marcatching.')
      setLoading(false)
      return
    }

    router.replace('/')
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authStory} aria-label="Tentang Marcatching Learning">
        <div className={styles.authStoryTop}>
          <Image src="/logo-type-white.png" alt="Marcatching" width={155} height={52} priority />
          <span className={styles.authEdition}>Learning OS</span>
        </div>

        <div className={styles.authStoryCopy}>
          <span className={styles.authEyebrow}><Sparkles size={14} /> Built for execution</span>
          <h1>Belajar, membangun, lalu mengukur apa yang berubah.</h1>
          <p>
            Satu workspace untuk course, progress belajar, dan sistem Creator Revenue OS milikmu.
          </p>

          <div className={styles.authValueList}>
            <div><BookOpenCheck size={18} /><span><strong>Learning path</strong><small>Lanjutkan materi dari posisi terakhir.</small></span></div>
            <div><BarChart3 size={18} /><span><strong>Visible progress</strong><small>Lihat progress, eksperimen, dan metrik utama.</small></span></div>
            <div><ShieldCheck size={18} /><span><strong>Member-only access</strong><small>Akses terhubung dengan email checkout.</small></span></div>
          </div>
        </div>

        <div className={styles.authPreview} aria-hidden="true">
          <div className={styles.authPreviewHeader}>
            <span />
            <p>Creator workspace</p>
            <b>Day 7 / 21</b>
          </div>
          <div className={styles.authPreviewBody}>
            <div className={styles.authPreviewMetric}>
              <span>Active phase</span>
              <strong>Content OS</strong>
              <p>3 Content IPs · 12 priority assets</p>
            </div>
            <div className={styles.authPreviewProgress}>
              <i style={{ width: '52%' }} />
            </div>
            <div className={styles.authPreviewRows}>
              <span><Check size={13} /> Audience OS</span>
              <span><Check size={13} /> Revenue Thesis</span>
              <span className={styles.authPreviewActive}>Content IP Playbook <ArrowRight size={13} /></span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.authPanel}>
        <div className={styles.authCard}>
          <div className={styles.authMobileLogo}>
            <Image src="/logo-type-white.png" alt="Marcatching" width={142} height={47} priority />
            <span>Learning OS</span>
          </div>

          <div className={styles.authTabs} role="tablist" aria-label="Pilihan akses akun">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? styles.authTabActive : ''}
              onClick={() => switchMode('login')}
            >
              Masuk
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={mode === 'register' ? styles.authTabActive : ''}
              onClick={() => switchMode('register')}
            >
              Aktivasi akun
            </button>
          </div>

          <div className={styles.authHeading}>
            <span>{mode === 'login' ? 'Welcome back' : 'First-time access'}</span>
            <h2>{mode === 'login' ? 'Lanjutkan progressmu.' : 'Aktifkan member workspace.'}</h2>
            <p>
              {mode === 'login'
                ? 'Masuk dengan akun yang sudah kamu aktivasi.'
                : 'Gunakan email yang sama dengan email saat checkout.'}
            </p>
          </div>

          <form className={styles.authForm} onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="member-email">Email member</label>
              <input
                id="member-email"
                className={styles.formInput}
                type="email"
                placeholder="email@kamu.com"
                value={email}
                onChange={event => setEmail(event.target.value)}
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.authLabelRow}>
                <label className={styles.formLabel} htmlFor="member-password">
                  {mode === 'login' ? 'Password' : 'Buat password'}
                </label>
                {mode === 'login' && (
                  <button type="button" className={styles.forgotPasswordButton} onClick={openForgotPassword}>
                    Lupa password?
                  </button>
                )}
              </div>
              <div className={styles.passwordField}>
                <input
                  id="member-password"
                  className={styles.formInput}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'login' ? 'Password akunmu' : 'Minimal 6 karakter'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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

            {mode === 'register' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="confirm-password">Konfirmasi password</label>
                <input
                  id="confirm-password"
                  className={styles.formInput}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            )}

            <div className={styles.authMessageArea} aria-live="polite">
              {error && <div className={styles.authError}>{error}</div>}
              {success && <div className={styles.authSuccess}>{success}</div>}
            </div>

            <button type="submit" className={styles.authBtn} disabled={loading}>
              {loading
                ? 'Memeriksa akses...'
                : mode === 'login'
                  ? <>Masuk ke workspace <ArrowRight size={17} /></>
                  : <>Aktifkan akun <ArrowRight size={17} /></>}
            </button>
          </form>

          <div className={styles.authAssurance}>
            <LockKeyhole size={15} />
            <span>Akses hanya tersedia untuk email dengan pembelian yang sudah dikonfirmasi.</span>
          </div>

          <p className={styles.authSupport}>
            Akses belum muncul? <a href="mailto:gilang@marcatching.com">Hubungi tim Marcatching</a>
          </p>
        </div>
      </section>

      {forgotOpen && (
        <div className={styles.authModalOverlay} onClick={() => !forgotLoading && setForgotOpen(false)}>
          <section
            className={styles.authModalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-title"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.authModalClose}
              onClick={() => setForgotOpen(false)}
              disabled={forgotLoading}
              aria-label="Tutup popup lupa password"
            >
              <X size={18} />
            </button>

            <div className={styles.authModalIcon}><Mail size={24} /></div>
            <h2 id="forgot-password-title">
              {forgotSent ? 'Periksa email kamu.' : 'Buat password baru.'}
            </h2>
            <p>
              {forgotSent
                ? 'Jika email tersebut terdaftar, kami sudah mengirim link untuk membuat password baru. Periksa juga folder spam.'
                : 'Masukkan email yang sebelumnya kamu gunakan untuk mengaktifkan akun Marcatching Course.'}
            </p>

            {forgotSent ? (
              <button type="button" className={styles.authBtn} onClick={() => setForgotOpen(false)}>
                Kembali ke login
              </button>
            ) : (
              <form className={styles.authModalForm} onSubmit={handleForgotPassword}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="forgot-email">Email terdaftar</label>
                  <input
                    id="forgot-email"
                    className={styles.formInput}
                    type="email"
                    placeholder="email@kamu.com"
                    value={forgotEmail}
                    onChange={event => setForgotEmail(event.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    autoFocus
                    required
                  />
                </div>
                {forgotError && <div className={styles.authError}>{forgotError}</div>}
                <button type="submit" className={styles.authBtn} disabled={forgotLoading}>
                  {forgotLoading ? 'Mengirim link...' : <>Kirim link reset <ArrowRight size={17} /></>}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
