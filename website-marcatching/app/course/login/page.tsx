'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import styles from '../course.module.css'

export default function CourseLoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Email dan password wajib diisi.')
      return
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.')
      return
    }

    setLoading(true)

    // Check if email has a confirmed order (course_access_emails)
    const { data: accessData } = await supabase
      .from('course_access_emails')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1)

    if (!accessData || accessData.length === 0) {
      setError('Email ini belum terdaftar sebagai member Marcatching, atau ordermu belum dikonfirmasi. Pastikan kamu sudah checkout produk dan menunggu konfirmasi dari admin.')
      setLoading(false)
      return
    }

    // Sign up with Supabase Auth
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: { is_course_user: true }
      }
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered') || signUpError.message.includes('User already')) {
        setError('Email ini sudah terdaftar. Silakan login menggunakan akun yang sudah ada.')
        setMode('login')
      } else {
        setError('Gagal mendaftar: ' + signUpError.message)
      }
      setLoading(false)
      return
    }

    // Auto-login after register
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (loginError) {
      setSuccess('Akun berhasil dibuat! Silakan login dengan email dan password kamu.')
      setMode('login')
      setLoading(false)
      return
    }

    router.push('/course')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Email dan password wajib diisi.')
      return
    }

    setLoading(true)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (loginError) {
      setError('Email atau password salah. Pastikan juga email sudah terdaftar sebagai member Marcatching. Jika belum, daftar dulu dengan tombol di bawah.')
      setLoading(false)
      return
    }

    router.push('/course')
  }

  function switchMode(newMode: 'register' | 'login') {
    setMode(newMode)
    setError('')
    setSuccess('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        {/* Logo */}
        <div className={styles.authLogo}>
          <div className={styles.authLogoInner} style={{ background: 'transparent', padding: 0 }}>
            <Image
              src="/logo-type-black.png"
              alt="Marcatching"
              width={160}
              height={36}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        {mode === 'register' ? (
          <>
            <h1 className={styles.authTitle}>Buat Akun</h1>
            <p className={styles.authSubtitle}>
              Daftarkan akun kamu menggunakan email yang dipakai saat checkout produk Marcatching.
            </p>

            <form className={styles.authForm} onSubmit={handleRegister}>
              {error && <div className={styles.authError}>{error}</div>}
              {success && <div className={styles.authSuccess}>{success}</div>}

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="reg-email">Email Checkout</label>
                <input
                  id="reg-email"
                  className={styles.formInput}
                  type="email"
                  placeholder="email@kamu.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="reg-password">Buat Password</label>
                <input
                  id="reg-password"
                  className={styles.formInput}
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="reg-confirm">Konfirmasi Password</label>
                <input
                  id="reg-confirm"
                  className={styles.formInput}
                  type="password"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                id="btn-register"
                type="submit"
                className={styles.authBtn}
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </form>

            <div className={styles.authDivider}>
              <div className={styles.authDividerLine} />
              <span className={styles.authDividerText}>atau</span>
              <div className={styles.authDividerLine} />
            </div>

            <div className={styles.authSwitch}>
              <span className={styles.authSwitchText}>Sudah punya akun?</span>
              <button
                id="btn-switch-to-login"
                className={styles.authSwitchBtn}
                onClick={() => switchMode('login')}
              >
                Login di sini
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className={styles.authTitle}>Selamat Datang</h1>
            <p className={styles.authSubtitle}>
              Login ke Marcatching E-Course menggunakan email dan password akunmu.
            </p>

            <form className={styles.authForm} onSubmit={handleLogin}>
              {error && <div className={styles.authError}>{error}</div>}
              {success && <div className={styles.authSuccess}>{success}</div>}

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  className={styles.formInput}
                  type="email"
                  placeholder="email@kamu.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  className={styles.formInput}
                  type="password"
                  placeholder="Password kamu"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                id="btn-login"
                type="submit"
                className={styles.authBtn}
                disabled={loading}
              >
                {loading ? 'Login...' : 'Login'}
              </button>
            </form>

            <div className={styles.authDivider}>
              <div className={styles.authDividerLine} />
              <span className={styles.authDividerText}>atau</span>
              <div className={styles.authDividerLine} />
            </div>

            <div className={styles.authSwitch}>
              <span className={styles.authSwitchText}>Belum punya akun?</span>
              <button
                id="btn-switch-to-register"
                className={styles.authSwitchBtn}
                onClick={() => switchMode('register')}
              >
                Daftar dulu
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
