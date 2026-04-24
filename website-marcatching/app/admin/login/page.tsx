'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './login.module.css'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [requireOtp, setRequireOtp] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      const body = requireOtp 
        ? { action: 'verify_otp', username, password, otp }
        : { action: 'login', username, password }

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (data.success) {
        if (data.requireOtp) {
          setRequireOtp(true)
          setSuccessMsg('OTP telah dikirim ke marcatching.id@gmail.com. Silakan masukkan kode.')
        } else {
          router.push('/admin')
          router.refresh()
        }
      } else {
        setError(data.message || 'Kredensial atau OTP salah.')
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Image
            src="https://marcatching.com/logo-type-white.png"
            alt="Marcatching"
            width={160}
            height={40}
            style={{ objectFit: 'contain', height: '32px', width: 'auto' }}
            unoptimized={true}
          />
        </div>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Masuk untuk mengelola konten website</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!requireOtp ? (
            <>
              <div className="form-group">
                <label className="label" htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className="input"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label className="label" htmlFor="otp">Kode OTP</label>
              <input
                id="otp"
                type="text"
                className="input"
                placeholder="Masukkan 6 digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
          )}

          {error && <p className={styles.error} style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>{error}</p>}
          {successMsg && <p className={styles.success} style={{ color: '#10b981', background: '#ecfdf5', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>{successMsg}</p>}

          <button
            type="submit"
            className={`btn btn-navy ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? 'Memproses...' : requireOtp ? 'Verifikasi OTP' : 'Masuk'}
          </button>

          {requireOtp && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', marginTop: '12px' }}
              onClick={() => { setRequireOtp(false); setOtp(''); setError(''); setSuccessMsg(''); }}
              disabled={loading}
            >
              Kembali
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
