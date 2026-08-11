'use client'

import { useState } from 'react'
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
  ShieldCheck,
  Sparkles,
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

  const normalizedEmail = email.toLowerCase().trim()

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
              <label className={styles.formLabel} htmlFor="member-password">
                {mode === 'login' ? 'Password' : 'Buat password'}
              </label>
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
    </main>
  )
}
