'use client'

import { useEffect, useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface SurveyQuestion {
  id: string
  label: string
  type: string
  options: string[]
  is_required: boolean
  order_index: number
}

interface Survey {
  id: string
  title: string
  slug: string
  description: string
  image_url: string
  image_aspect_ratio: string
  status: 'active' | 'inactive'
  survey_questions: SurveyQuestion[]
}

type Phase = 'landing' | 'questions' | 'consent' | 'thankyou'

export default function SurveyClient({ slug }: { slug: string }) {
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<Phase>('landing')

  // Biodata
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [biodataError, setBiodataError] = useState('')

  // Questions flow
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [qError, setQError] = useState('')

  // Consent
  const [consentChecked, setConsentChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    fetch(`/api/surveys/${slug}`)
      .then(r => r.json())
      .then(data => { setSurvey(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ color: '#0d3369', fontSize: '1rem', fontWeight: 600 }}>Memuat survey...</div>
    </div>
  )

  if (!survey || !survey.id) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
        <h2 style={{ color: '#0d3369', fontWeight: 800 }}>Survey tidak ditemukan</h2>
      </div>
    </div>
  )

  if (survey.status === 'inactive') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0d3369 0%, #1e40af 100%)', padding: 24 }}>
      <div style={{ background: '#ffffff', borderRadius: 24, padding: '48px 40px', textAlign: 'center', maxWidth: 480, width: '100%', boxShadow: '0 24px 60px rgba(13,51,105,0.2)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎯</div>
        <h2 style={{ color: '#0d3369', fontWeight: 900, fontSize: '1.5rem', marginBottom: 12 }}>{survey.title}</h2>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>Survey ini telah ditutup. Terima kasih atas antusiasmu!</p>
        <div style={{ marginTop: 32, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>— Marcatching</div>
      </div>
    </div>
  )

  const questions = survey.survey_questions ?? []

  // ── LANDING PAGE ──────────────────────────────────────────
  if (phase === 'landing') return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Thumbnail */}
        {survey.image_url && (
          <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 32, boxShadow: '0 12px 40px rgba(13,51,105,0.12)' }}>
            <img src={survey.image_url} alt={survey.title} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
          </div>
        )}

        {/* Title */}
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0d3369', marginBottom: 16, lineHeight: 1.2 }}>{survey.title}</h1>

        {/* Description */}
        {survey.description && (
          <div
            style={{ color: '#475569', lineHeight: 1.75, fontSize: '1rem', marginBottom: 32 }}
            dangerouslySetInnerHTML={{ __html: survey.description }}
          />
        )}

        {/* Biodata form */}
        <div style={{ background: '#ffffff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: 28 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.05rem', fontWeight: 800, color: '#0d3369' }}>Data Diri Kamu</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Nama Lengkap *</label>
              <input
                type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap kamu"
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@kamu.com"
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: 6 }}>Nomor WhatsApp</label>
              <input
                type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                placeholder="08xxxxxxxxxx"
                style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>
          </div>
          {biodataError && <p style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: 10, fontWeight: 600 }}>{biodataError}</p>}
        </div>

        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', marginBottom: 20 }}>
          {questions.length} pertanyaan • Jawab satu per satu
        </div>

        <button
          onClick={() => {
            if (!fullName.trim()) { setBiodataError('Nama lengkap wajib diisi'); return }
            setBiodataError('')
            setCurrentQ(0)
            setPhase('questions')
          }}
          style={{ width: '100%', padding: '16px 28px', background: 'linear-gradient(135deg, #0d3369, #1e40af)', color: '#ffffff', border: 'none', borderRadius: 14, fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(13,51,105,0.3)', letterSpacing: '-0.01em' }}
        >
          Mulai Survey →
        </button>
      </div>
    </div>
  )

  // ── QUESTION POPUP ─────────────────────────────────────────
  if (phase === 'questions') {
    const q = questions[currentQ]
    const total = questions.length
    const progress = ((currentQ) / total) * 100
    const currentAnswer = answers[q.id]

    function handleNext() {
      if (q.is_required && (currentAnswer === undefined || currentAnswer === '' || (Array.isArray(currentAnswer) && currentAnswer.length === 0))) {
        setQError('Pertanyaan ini wajib dijawab *')
        return
      }
      setQError('')
      if (currentQ < total - 1) { setCurrentQ(i => i + 1) }
      else { setPhase('consent') }
    }

    function handlePrev() {
      setQError('')
      if (currentQ > 0) setCurrentQ(i => i - 1)
    }

    function setAnswer(val: any) {
      setAnswers(prev => ({ ...prev, [q.id]: val }))
      setQError('')
    }

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d3369 0%, #1e40af 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', sans-serif" }}>
        {/* Progress bar */}
        <div style={{ width: '100%', maxWidth: 600, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600 }}>{survey.title}</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600 }}>{currentQ + 1} / {total}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${((currentQ + 1) / total) * 100}%`, background: '#60a5fa', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Question card */}
        <div style={{ background: '#ffffff', borderRadius: 24, padding: '40px 36px', maxWidth: 600, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', minHeight: 320 }}>
          <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Pertanyaan {currentQ + 1}
          </p>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0d3369', marginBottom: 28, lineHeight: 1.4 }}>
            {q.label}{q.is_required && <span style={{ color: '#ef4444' }}> *</span>}
          </h2>

          {/* Short answer */}
          {q.type === 'short_answer' && (
            <input type="text" value={currentAnswer ?? ''} onChange={e => setAnswer(e.target.value)}
              placeholder="Tulis jawabanmu..."
              style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          )}

          {/* Long answer */}
          {q.type === 'long_answer' && (
            <textarea value={currentAnswer ?? ''} onChange={e => setAnswer(e.target.value)}
              placeholder="Tulis jawabanmu..." rows={4}
              style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }} />
          )}

          {/* Dropdown */}
          {q.type === 'dropdown' && (
            <select value={currentAnswer ?? ''} onChange={e => setAnswer(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '1rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff', cursor: 'pointer' }}>
              <option value="">-- Pilih jawaban --</option>
              {q.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          )}

          {/* Radio */}
          {q.type === 'radio' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.options.map((opt, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `1.5px solid ${currentAnswer === opt ? '#0d3369' : '#e2e8f0'}`, borderRadius: 10, cursor: 'pointer', background: currentAnswer === opt ? '#eff6ff' : '#fff', transition: 'all 0.15s' }}>
                  <input type="radio" name={`q_${q.id}`} value={opt} checked={currentAnswer === opt} onChange={() => setAnswer(opt)} style={{ accentColor: '#0d3369' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* Checkbox */}
          {q.type === 'checkbox' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.options.map((opt, i) => {
                const checked = Array.isArray(currentAnswer) && currentAnswer.includes(opt)
                return (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `1.5px solid ${checked ? '#0d3369' : '#e2e8f0'}`, borderRadius: 10, cursor: 'pointer', background: checked ? '#eff6ff' : '#fff', transition: 'all 0.15s' }}>
                    <input type="checkbox" value={opt} checked={checked}
                      onChange={e => {
                        const prev: string[] = Array.isArray(currentAnswer) ? currentAnswer : []
                        setAnswer(e.target.checked ? [...prev, opt] : prev.filter(x => x !== opt))
                      }} style={{ accentColor: '#0d3369' }} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{opt}</span>
                  </label>
                )
              })}
            </div>
          )}

          {/* Rating */}
          {q.type === 'rating' && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '12px 0' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setAnswer(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <Star size={40} fill={currentAnswer >= n ? '#f59e0b' : 'transparent'} color={currentAnswer >= n ? '#f59e0b' : '#cbd5e1'} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          )}

          {qError && <p style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: 12, fontWeight: 600 }}>{qError}</p>}

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'space-between' }}>
            <button onClick={handlePrev} disabled={currentQ === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px', background: '#f1f5f9', border: 'none', borderRadius: 10, cursor: currentQ === 0 ? 'not-allowed' : 'pointer', opacity: currentQ === 0 ? 0.4 : 1, fontWeight: 700, color: '#64748b', fontSize: '0.9rem' }}>
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <button onClick={handleNext}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 28px', background: 'linear-gradient(135deg, #0d3369, #1e40af)', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
              {currentQ === total - 1 ? 'Selesai' : 'Selanjutnya'} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── CONSENT PAGE ───────────────────────────────────────────
  if (phase === 'consent') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d3369 0%, #1e40af 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: '#ffffff', borderRadius: 24, padding: '44px 40px', maxWidth: 560, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 20, textAlign: 'center' }}>🔒</div>
        <h2 style={{ textAlign: 'center', color: '#0d3369', fontWeight: 900, fontSize: '1.3rem', marginBottom: 20 }}>Persetujuan Data</h2>
        <p style={{ color: '#475569', lineHeight: 1.75, fontSize: '0.95rem', marginBottom: 24 }}>
          Dengan mengisi survey ini, kamu menyetujui bahwa data yang telah kamu berikan akan disimpan dan digunakan oleh tim Marcatching sebagai bahan analisis internal.
          <br /><br />
          Marcatching berkomitmen untuk <strong>tidak menyebarkan atau memperjualbelikan</strong> data pribadimu kepada pihak manapun untuk kepentingan di luar Marcatching.
          <br /><br />
          Data ini semata-mata digunakan untuk meningkatkan layanan dan pengalaman kamu bersama Marcatching.
        </p>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '16px', background: '#f8fafc', borderRadius: 12, border: '1.5px solid #e2e8f0', marginBottom: 24 }}>
          <input type="checkbox" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} style={{ accentColor: '#0d3369', marginTop: 3, flexShrink: 0, width: 18, height: 18 }} />
          <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.5 }}>
            Saya memahami dan menyetujui bahwa data saya akan disimpan dan digunakan oleh Marcatching.
          </span>
        </label>

        {submitError && <p style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: 12, fontWeight: 600 }}>{submitError}</p>}

        <button
          onClick={async () => {
            if (!consentChecked) { setSubmitError('Harap centang persetujuan terlebih dahulu'); return }
            setSubmitting(true); setSubmitError('')
            try {
              const answersArray = Object.entries(answers).map(([qId, value]) => {
                const q = questions.find(x => x.id === qId)
                return { questionId: qId, question: q?.label ?? qId, answer: Array.isArray(value) ? value.join(', ') : String(value ?? '') }
              })
              const res = await fetch('/api/surveys/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ surveyId: survey.id, surveyTitle: survey.title, fullName, email, whatsapp, answers: answersArray }),
              })
              if (res.ok) setPhase('thankyou')
              else setSubmitError('Terjadi kesalahan, coba lagi.')
            } catch { setSubmitError('Terjadi kesalahan koneksi.') }
            setSubmitting(false)
          }}
          disabled={submitting}
          style={{ width: '100%', padding: '16px', background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #0d3369, #1e40af)', color: '#fff', border: 'none', borderRadius: 14, fontSize: '1rem', fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(13,51,105,0.3)' }}>
          {submitting ? 'Mengirim...' : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Check size={18} /> Submit Survey</span>}
        </button>
      </div>
    </div>
  )

  // ── THANK YOU PAGE ─────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d3369 0%, #1e40af 60%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: '#ffffff', borderRadius: 28, padding: '56px 44px', maxWidth: 540, width: '100%', textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: '4rem', marginBottom: 20 }}>🎉</div>
        <h1 style={{ color: '#0d3369', fontWeight: 900, fontSize: '1.6rem', marginBottom: 8, lineHeight: 1.3 }}>
          Terima kasih, <span style={{ color: '#1e40af' }}>{fullName}</span>!
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.75, marginBottom: 28 }}>
          Partisipasimu dalam survey{' '}
          <strong style={{ color: '#0d3369' }}>&ldquo;{survey.title}&rdquo;</strong>{' '}
          sangat berarti bagi kami.
          <br /><br />
          Tim Marcatching akan segera menghubungimu secara personal untuk menindaklanjuti hasil survey ini. Kami sangat menghargai waktu dan kejujuranmu.
        </p>
        <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 24px' }} />
        <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0d3369', letterSpacing: '-0.02em' }}>— Marcatching</p>
        <a href="https://marcatching.com" style={{ display: 'inline-block', marginTop: 24, padding: '12px 28px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, color: '#0d3369', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
          Kembali ke Marcatching.com
        </a>
      </div>
    </div>
  )
}
