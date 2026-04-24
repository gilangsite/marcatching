'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
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
        setMsg('Kredensial berhasil diperbarui. Silakan gunakan kredensial baru untuk login selanjutnya.')
        setStep(1)
        setOtp('')
        setOldEmail('')
        setOldPassword('')
        setNewEmail('')
        setNewPassword('')
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
      <div className={styles.card} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            Untuk mengganti username dan password login dashboard, sistem akan mengirimkan 6 digit kode OTP ke email utama (<strong>marcatching.id@gmail.com</strong>) terlebih dahulu.
          </p>
        </div>

        {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
        {msg && <div style={{ color: '#10b981', background: '#ecfdf5', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{msg}</div>}

        {step === 1 ? (
          <div>
            <button
              onClick={requestOtp}
              disabled={loading}
              className={`btn btn-navy`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Lock size={16} />
              {loading ? 'Memproses...' : 'Kirim Kode OTP'}
            </button>
          </div>
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
            
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0' }}></div>
            
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
                type={showOldPassword ? "text" : "password"}
                className="input"
                placeholder="Password Lama"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', margin: '8px 0' }}></div>

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
                type={showNewPassword ? "text" : "password"}
                className="input"
                placeholder="Password Baru"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="label">Konfirmasi Password Baru</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="input"
                placeholder="Ketik ulang password baru"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {error && <p className={styles.formError} style={{ marginTop: '16px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-navy"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Kredensial'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
