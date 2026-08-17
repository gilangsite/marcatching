'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

type SkillRequirementField = {
  key: string
  label: string
  explanation: string
}

interface SkillRequirementsModalProps {
  isOpen: boolean
  skillId: string
  skillName: string
  onClose: () => void
  onSaved: () => void
}

export function SkillRequirementsModal({ isOpen, skillId, skillName, onClose, onSaved }: SkillRequirementsModalProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fields, setFields] = useState<SkillRequirementField[]>([])
  const [productId, setProductId] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen || !skillId) return
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token || ''
        if (!token) throw new Error('Login kembali untuk melanjutkan.')
        const response = await fetch(`/api/workspace/skills/requirements?skillId=${encodeURIComponent(skillId)}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        const payload = await response.json() as { fields?: SkillRequirementField[]; existingAnswers?: Record<string, string>; productId?: string; message?: string }
        if (!response.ok) throw new Error(payload.message || 'Skill Requirements belum bisa dimuat.')
        if (!active) return
        setFields(payload.fields || [])
        setAnswers(payload.existingAnswers || {})
        setProductId(payload.productId || '')
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Skill Requirements belum bisa dimuat.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [isOpen, skillId])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Login kembali untuk menyimpan.')
      const { data: row } = await supabase.from('creator_workspaces').select('data').eq('user_id', user.id).maybeSingle()
      const currentData = (row?.data && typeof row.data === 'object' ? row.data : {}) as Record<string, unknown>
      const currentSkillRequirements = (currentData.skillRequirements && typeof currentData.skillRequirements === 'object' && !Array.isArray(currentData.skillRequirements))
        ? currentData.skillRequirements as Record<string, unknown>
        : {}
      const updatedData = {
        ...currentData,
        skillRequirements: {
          ...currentSkillRequirements,
          [productId]: answers,
        },
      }
      const { error: saveError } = await supabase
        .from('creator_workspaces')
        .upsert({ user_id: user.id, data: updatedData, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      if (saveError) throw new Error(saveError.message)
      onSaved()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Skill Requirements belum berhasil disimpan.')
    } finally {
      setSaving(false)
    }
  }

  const allFilled = fields.every(field => (answers[field.key] || '').trim().length > 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 4, 7, 0.85)', backdropFilter: 'blur(8px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'relative',
              background: '#111111',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8cc6ff', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Sparkles size={13} /> Customize Skill</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: '6px 0 6px' }}>{skillName}</h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>Isi ini sekali saja — jawabannya ikut tersimpan di brand-memory.md di dalam Skill yang kamu download, di luar Brand Memory umum yang sudah kamu isi.</p>
              </div>
              <button onClick={onClose} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {loading ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Memuat requirement Skill ini...</p>
              ) : fields.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Skill ini belum punya requirement khusus.</p>
              ) : (
                fields.map(field => (
                  <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <strong style={{ color: '#f1f5f9', fontSize: '0.9rem' }}>{field.label}</strong>
                    {field.explanation && <span style={{ color: '#8e9baa', fontSize: '0.8rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{field.explanation}</span>}
                    <textarea
                      value={answers[field.key] || ''}
                      onChange={event => setAnswers(current => ({ ...current, [field.key]: event.target.value }))}
                      rows={3}
                      style={{ resize: 'vertical', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 12px', color: '#f8fafc', fontSize: '0.88rem', fontFamily: 'inherit' }}
                    />
                  </label>
                ))
              )}
              {error && <p style={{ color: '#ffd58f', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
            </div>

            {fields.length > 0 && (
              <div style={{ padding: '18px 28px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || loading || !allFilled}
                  style={{
                    background: allFilled ? '#f8fafc' : 'rgba(255,255,255,0.08)',
                    color: allFilled ? '#0f172a' : '#64748b',
                    fontWeight: 700,
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.9rem',
                    cursor: allFilled && !saving ? 'pointer' : 'not-allowed',
                  }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
