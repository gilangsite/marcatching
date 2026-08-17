'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, LockKeyhole } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface StoreLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function StoreLoginModal({ isOpen, onClose, onSuccess }: StoreLoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function syncOpenState() {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
        setError('')
        setLoading(false)
      }
    }
    syncOpenState()
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    const normalizedEmail = email.toLowerCase().trim()
    if (!normalizedEmail || !password) {
      setError('Masukkan email dan password untuk melanjutkan.')
      return
    }
    setLoading(true)
    const { error: loginError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
    setLoading(false)
    if (loginError) {
      setError('Email atau password belum cocok. Pastikan kamu memakai akun member Marcatching.')
      return
    }
    setEmail('')
    setPassword('')
    onSuccess()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'relative',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            }}
          >
            <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d3369', margin: '0 0 6px' }}>Login ke Marcatching</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>Pakai akun member yang sama dengan course dashboard. Produk yang sudah kamu miliki dan data checkout otomatis terisi begitu berhasil login.</p>
              </div>
              <button type="button" onClick={onClose} style={{ flexShrink: 0, background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email member</span>
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="email@kamu.com"
                  autoComplete="email"
                  required
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', color: '#0d3369', fontSize: '0.9rem', fontFamily: 'inherit' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="Password akunmu"
                  autoComplete="current-password"
                  required
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', color: '#0d3369', fontSize: '0.9rem', fontFamily: 'inherit' }}
                />
              </label>

              {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', margin: 0 }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: '#0d3369', color: '#ffffff', fontWeight: 700, padding: '11px 20px',
                  borderRadius: '999px', border: 'none', fontSize: '0.9rem', cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Memeriksa akses...' : <>Masuk <ArrowRight size={16} /></>}
              </button>

              <p style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0 0', color: '#94a3b8', fontSize: '0.78rem' }}>
                <LockKeyhole size={12} />
                Belum aktivasi akun?{' '}
                <a href="https://course.marcatching.com/login" target="_blank" rel="noreferrer" style={{ color: '#0d3369', fontWeight: 600 }}>Aktivasi di sini</a>
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
