'use client'

import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, MonitorSmartphone, Clock, LogOut } from 'lucide-react'
import styles from './admin.module.css'

export default function SecurityTab() {
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  // Form State
  const [otp, setOtp] = useState('')
  const [oldEmail, setOldEmail] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Show password states
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Device Sessions state
  const [sessions, setSessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    setSessionsLoading(true)
    try {
      const res = await fetch('/api/admin/sessions')
      const data = await res.json()
      if (data.success) setSessions(data.sessions)
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    } finally {
      setSessionsLoading(false)
    }
  }

  async function handleLogoutAll() {
    if (!window.confirm('Hard Exit: Yakin ingin keluar dari SEMUA perangkat dan browser? Semua sesi aktif akan dihapus.')) return
    try {
      const res = await fetch('/api/admin/logout-all', { method: 'POST' })
      if (res.ok) {
        window.location.href = '/login'
      }
    } catch (err) {
      console.error('Failed to hard exit:', err)
    }
  }

  async function requestOtp() {
    setLoading(true)
    setError('')
    setMsg('')
    try {
      const res = await fetch('/api/admin/request-credential-change', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.success) {
        setMsg('OTP berhasil dikirim ke marcatching.id@gmail.com')
        setStep(2)
      } else {
        setError(data.message || 'Gagal mengirim OTP')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMsg('')

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/admin/change-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, oldEmail, oldPassword, newEmail, newPassword })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        // Credentials changed — all sessions deleted, redirect to login
        window.location.href = '/login'
      } else {
        setError(data.message || 'Gagal mengubah kredensial')
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    }
    setLoading(false)
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Keamanan Login</h2>
      </div>

      {/* ── Card 1: Ganti Kredensial ── */}
      <div className={styles.card} style={{ maxWidth: '600px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Ganti Username & Password
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
          Sistem akan mengirimkan 6 digit kode OTP ke email utama (<strong>marcatching.id@gmail.com</strong>) sebelum kamu bisa mengubah kredensial.
          Setelah berhasil, <strong>semua device yang sedang login akan otomatis dikeluarkan</strong>.
        </p>

        {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
        {msg && <div style={{ color: '#10b981', background: '#ecfdf5', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{msg}</div>}

        {step === 1 ? (
          <button
            onClick={requestOtp}
            disabled={loading}
            className={`btn btn-navy`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Lock size={16} />
            {loading ? 'Memproses...' : 'Kirim Kode OTP'}
          </button>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="label">Kode OTP</label>
              <input
                type="text"
                className="input"
                placeholder="Masukkan 6 digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }}></div>

            <div className="form-group">
              <label className="label">Username Lama</label>
              <input
                type="text"
                className="input"
                placeholder="Username Lama"
                value={oldEmail}
                onChange={e => setOldEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="label">Password Lama</label>
              <input
                type={showOldPassword ? 'text' : 'password'}
                className="input"
                placeholder="Password Lama"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowOldPassword(!showOldPassword)}
                style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }}></div>

            <div className="form-group">
              <label className="label">Username Baru</label>
              <input
                type="text"
                className="input"
                placeholder="Username Baru"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="label">Password Baru</label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="input"
                placeholder="Minimal 8 karakter"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="label">Konfirmasi Password Baru</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="input"
                placeholder="Ketik ulang password baru"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)} disabled={loading}>
                Batal
              </button>
              <button type="submit" className="btn btn-navy" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Kredensial'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Card 2: Login Activity ── */}
      <div className={styles.card} style={{ maxWidth: '600px', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <MonitorSmartphone size={20} />
            Login Activity
          </h3>
          <button onClick={fetchSessions} style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Refresh
          </button>
        </div>

        {sessionsLoading ? (
          <p style={{ color: '#64748b', fontSize: '14px' }}>Memuat data...</p>
        ) : sessions.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>
            Belum ada sesi aktif tercatat. Jika kamu baru deploy fitur ini, silakan logout dan login ulang agar sesi kamu tercatat di sini.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map(session => (
              <div key={session.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ padding: '10px', background: '#e2e8f0', borderRadius: '50%', color: '#334155', flexShrink: 0 }}>
                  <MonitorSmartphone size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {session.device_name || 'Unknown OS'}
                    <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}> — {session.browser || 'Unknown Browser'}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    Login sejak: {new Date(session.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                    IP: {session.ip_address || 'Unknown'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Card 3: Hard Exit ── */}
      <div className={styles.card} style={{ maxWidth: '600px', marginTop: '24px', borderColor: '#fecaca' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <LogOut size={18} />
          Hard Exit
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
          Keluar paksa dari <strong>semua perangkat dan browser</strong> yang sedang aktif sekaligus. Semua sesi akan dihapus dan setiap device akan diminta untuk login kembali menggunakan OTP.
        </p>
        <button
          onClick={handleLogoutAll}
          className="btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ef4444', color: 'white', border: 'none' }}
        >
          <LogOut size={15} />
          Hard Exit — Keluarkan Semua Device
        </button>
      </div>
    </div>
  )
}
