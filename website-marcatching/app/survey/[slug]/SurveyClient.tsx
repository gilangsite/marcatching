'use client'

import { useEffect, useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Check, Shield, CheckCircle2, Search, ClipboardList } from 'lucide-react'

interface SurveyQuestion {
  id: string; label: string; type: string; options: string[]
  is_required: boolean; order_index: number; section: 'biodata' | 'survey'
}
interface Survey {
  id: string; title: string; slug: string; description: string
  image_url: string; image_aspect_ratio: string; status: 'active' | 'inactive'
  survey_questions: SurveyQuestion[]
}

const BLK = '#f3f7fb'
const ACCENT = '#8cc6ff'

const css = `
@keyframes spin { to { transform:rotate(360deg); } }
@keyframes zoomIn {
  from { opacity:0; transform:scale(0.93) translateY(14px); }
  to   { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes fadeUp {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes popIn {
  0%   { opacity:0; transform:scale(0.85); }
  70%  { transform:scale(1.04); }
  100% { opacity:1; transform:scale(1); }
}
.sv-zoom { animation: zoomIn 0.38s cubic-bezier(.22,.68,0,1.2) both; }
.sv-fade  { animation: fadeUp 0.4s cubic-bezier(.22,.68,0,1.2) both; }
.sv-pop   { animation: popIn 0.5s cubic-bezier(.22,.68,0,1.2) both; }
.sv-inp {
  width:100%; padding:13px 16px; border:1px solid rgba(184,214,242,.16); border-radius:12px;
  font-size:0.95rem; font-family:var(--font); outline:none; box-sizing:border-box;
  transition:border-color .18s, box-shadow .18s; background:rgba(3,7,11,.78); color:#f3f7fb;
}
.sv-inp::placeholder { color:#52606e; }
.sv-inp:focus { border-color:rgba(140,198,255,.56); box-shadow:0 0 0 3px rgba(140,198,255,.09); }
.sv-opt {
  display:flex; align-items:center; gap:12px; padding:12px 16px; border:1px solid rgba(184,214,242,.14);
  border-radius:12px; cursor:pointer; transition:all .15s; background:rgba(255,255,255,.025); margin-bottom:8px;
  font-family:var(--font); font-size:0.95rem; font-weight:600; color:#dce6ef; user-select:none;
}
.sv-opt:hover { border-color:rgba(140,198,255,.26); background:rgba(140,198,255,.045); }
.sv-opt.sel { border-color:rgba(140,198,255,.54); background:rgba(140,198,255,.09); color:#f3f7fb; }
.sv-btn {
  display:flex; align-items:center; justify-content:center; gap:8px; padding:14px 28px;
  border:none; border-radius:999px; cursor:pointer; font-family:var(--font); font-weight:800;
  font-size:1rem; transition:all .2s; letter-spacing:-0.01em;
}
.sv-btn-navy { background:#dceeff; color:#04101a; box-shadow:0 12px 30px rgba(140,198,255,.12); }
.sv-btn-navy:hover { transform:translateY(-1px); background:#f3f8fd; box-shadow:0 16px 38px rgba(140,198,255,.17); }
.sv-btn-ghost { background:rgba(255,255,255,.035); color:#a9b4c0; border:1px solid rgba(184,214,242,.14); }
.sv-btn-ghost:hover { background:rgba(255,255,255,.065); color:#f3f7fb; }
.sv-btn:disabled { opacity:.55; cursor:not-allowed; transform:none !important; }
.sv-card {
  background:linear-gradient(145deg,rgba(255,255,255,.03),transparent 48%),rgba(8,13,19,.9);
  backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  border-radius:22px; box-shadow:0 26px 80px rgba(0,0,0,.34);
  border:1px solid rgba(184,214,242,.14);
}
body { background:#030508 !important; color:#f3f7fb; }
@media(max-width:640px){
  .sv-card{border-radius:18px!important;padding:26px 18px!important;}
  .sv-btn{padding:13px 18px;font-size:.92rem;min-width:0!important;}
}
@media(prefers-reduced-motion:reduce){
  .sv-zoom,.sv-fade,.sv-pop{animation:none!important;}
  .sv-btn,.sv-opt{transition-duration:.01ms!important;}
}
`

export default function SurveyClient({ slug }: { slug: string }) {
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'landing'|'questions'|'consent'|'thankyou'>('landing')
  const [biodataAnswers, setBiodataAnswers] = useState<Record<string,any>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string,any>>({})
  const [qError, setQError] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [animKey, setAnimKey] = useState(0)
  const [biodataError, setBiodataError] = useState('')

  useEffect(() => {
    fetch(`/api/surveys/${slug}`)
      .then(r => r.json())
      .then(data => { setSurvey(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  const BG = 'radial-gradient(circle at 50% -10%,rgba(140,198,255,.10),transparent 34rem),linear-gradient(180deg,#030508,#05080c)'
  const NAVBAR_H = 64

  function NavBar() {
    return (
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(3,5,8,.78)',backdropFilter:'blur(20px) saturate(125%)',WebkitBackdropFilter:'blur(20px) saturate(125%)',borderBottom:'1px solid rgba(184,214,242,.12)',height:NAVBAR_H,display:'flex',alignItems:'center',paddingLeft:24,paddingRight:24}}>
        <img src="https://www.marcatching.com/logo-type-white.png" alt="Marcatching" style={{height:26,objectFit:'contain'}} />
      </nav>
    )
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:BG,fontFamily:'var(--font)'}}>
      <style dangerouslySetInnerHTML={{__html:css}}/>
      <div className="sv-fade" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
        <div style={{width:36,height:36,borderRadius:'50%',border:'3px solid rgba(184,214,242,.14)',borderTopColor:ACCENT,animation:'spin 0.8s linear infinite'}}/>
        <span style={{color:'#8e9baa',fontSize:'0.9rem',fontWeight:600}}>Memuat survey…</span>
      </div>
    </div>
  )

  if (!survey?.id) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:BG,fontFamily:'var(--font)'}}>
      <style dangerouslySetInnerHTML={{__html:css}}/>
      <div className="sv-card sv-fade" style={{padding:'48px 40px',textAlign:'center',maxWidth:400}}>
        <Search size={40} color="#637180" style={{marginBottom:16}}/>
        <h2 style={{color:BLK,fontWeight:800,margin:'0 0 8px'}}>Survey tidak ditemukan</h2>
        <p style={{color:'#8e9baa',margin:0,fontSize:'0.9rem'}}>URL survey tidak valid atau sudah dihapus.</p>
      </div>
    </div>
  )

  if (survey.status === 'inactive') return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:BG,fontFamily:'var(--font)',padding:24}}>
      <style dangerouslySetInnerHTML={{__html:css}}/>
      <div className="sv-card sv-fade" style={{padding:'48px 40px',textAlign:'center',maxWidth:440,width:'100%'}}>
        <ClipboardList size={40} color="#637180" style={{marginBottom:16}}/>
        <h2 style={{color:BLK,fontWeight:900,fontSize:'1.4rem',margin:'0 0 12px'}}>{survey.title}</h2>
        <p style={{color:'#8e9baa',fontSize:'0.95rem',lineHeight:1.7,margin:'0 0 28px'}}>Survey ini telah ditutup. Terima kasih atas antusiasmu!</p>
        <div style={{fontSize:'0.82rem',color:'#637180',fontWeight:700}}>— Marcatching</div>
      </div>
    </div>
  )

  const allQs = (survey.survey_questions ?? []).sort((a,b) => a.order_index - b.order_index)
  const biodataQs = allQs.filter(q => q.section === 'biodata')
  const surveyQs  = allQs.filter(q => q.section === 'survey' || !q.section)

  // ── LANDING ──
  if (phase === 'landing') {
    function validateAndStart() {
      for (const q of biodataQs) {
        if (q.is_required) {
          const v = biodataAnswers[q.id]
          if (!v || (typeof v==='string'&&!v.trim()) || (Array.isArray(v)&&v.length===0)) {
            setBiodataError(`"${q.label}" wajib diisi`); return
          }
        }
      }
      setBiodataError('')
      setCurrentQ(0)
      if (surveyQs.length === 0) { setPhase('consent'); return }
      setPhase('questions')
    }

    return (
      <div style={{minHeight:'100vh',background:BG,fontFamily:'var(--font)',paddingTop:NAVBAR_H+32,paddingBottom:80}}>
        <style dangerouslySetInnerHTML={{__html:css}}/>
        <NavBar/>
        <div style={{maxWidth:660,margin:'0 auto',padding:'0 20px'}}>
          {survey.image_url && (
            <div className="sv-fade" style={{borderRadius:20,overflow:'hidden',marginBottom:32,boxShadow:'0 12px 40px rgba(0,0,0,.10)'}}>
              <img src={survey.image_url} alt={survey.title} style={{width:'100%',display:'block',objectFit:'cover'}}/>
            </div>
          )}
          <h1 className="sv-fade" style={{fontSize:'2rem',fontWeight:900,color:BLK,marginBottom:14,lineHeight:1.2,animationDelay:'.05s'}}>{survey.title}</h1>
          {survey.description && (
            <div className="sv-fade" style={{color:'#a9b4c0',lineHeight:1.8,fontSize:'0.97rem',marginBottom:32,animationDelay:'.1s'}} dangerouslySetInnerHTML={{__html:survey.description}}/>
          )}
          {biodataQs.length > 0 && (
            <div className="sv-card sv-fade" style={{padding:28,marginBottom:24,animationDelay:'.15s'}}>
              <h3 style={{margin:'0 0 20px',fontSize:'1rem',fontWeight:800,color:BLK,display:'flex',alignItems:'center',gap:8}}>
                <ClipboardList size={18} color={BLK}/> Data Diri Kamu
              </h3>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {biodataQs.map(q => (
                  <div key={q.id}>
                    <label style={{display:'block',fontSize:'0.83rem',fontWeight:700,color:'#a9b4c0',marginBottom:6}}>
                      {q.label}{q.is_required && <span style={{color:'#ef4444'}}> *</span>}
                    </label>
                    {(q.type==='short_answer'||!q.type) && (
                      <input className="sv-inp" value={biodataAnswers[q.id]??''} onChange={e=>setBiodataAnswers(p=>({...p,[q.id]:e.target.value}))} placeholder={`Masukkan ${q.label.toLowerCase()}...`}/>
                    )}
                    {q.type==='long_answer' && (
                      <textarea className="sv-inp" rows={3} style={{resize:'vertical'}} value={biodataAnswers[q.id]??''} onChange={e=>setBiodataAnswers(p=>({...p,[q.id]:e.target.value}))} placeholder="Tulis di sini..."/>
                    )}
                    {q.type==='dropdown' && (
                      <select className="sv-inp" style={{cursor:'pointer'}} value={biodataAnswers[q.id]??''} onChange={e=>setBiodataAnswers(p=>({...p,[q.id]:e.target.value}))}>
                        <option value="">-- Pilih --</option>
                        {q.options.map((o,i)=><option key={i} value={o}>{o}</option>)}
                      </select>
                    )}
                    {q.type==='radio' && q.options.map((o,i)=>(
                      <label key={i} className={`sv-opt${biodataAnswers[q.id]===o?' sel':''}`} onClick={()=>setBiodataAnswers(p=>({...p,[q.id]:o}))}>
                        <input type="radio" style={{accentColor:ACCENT}} checked={biodataAnswers[q.id]===o} readOnly/><span>{o}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
              {biodataError && <p style={{color:'#ef4444',fontSize:'0.82rem',marginTop:12,fontWeight:600}}>{biodataError}</p>}
            </div>
          )}
          <div className="sv-fade" style={{textAlign:'center',color:'#637180',fontSize:'0.8rem',marginBottom:20,animationDelay:'.2s'}}>
            {surveyQs.length} pertanyaan · Dijawab satu per satu
          </div>
          <button className="sv-btn sv-btn-navy sv-fade" style={{width:'100%',animationDelay:'.25s'}} onClick={validateAndStart}>
            Mulai Survey <ChevronRight size={18}/>
          </button>
        </div>
      </div>
    )
  }

  // ── QUESTIONS ──
  if (phase === 'questions') {
    const q = surveyQs[currentQ]
    if (!q) { setPhase('consent'); return null }
    const total = surveyQs.length
    const cur = answers[q.id]

    function setAns(v: any) { setAnswers(p=>({...p,[q.id]:v})); setQError('') }

    function goNext() {
      if (q.is_required&&(!cur||cur===''||(Array.isArray(cur)&&cur.length===0))) { setQError('Pertanyaan ini wajib dijawab'); return }
      setQError(''); setAnimKey(k=>k+1)
      if (currentQ<total-1) setCurrentQ(i=>i+1)
      else setPhase('consent')
    }
    function goPrev() { setQError(''); setAnimKey(k=>k+1); if(currentQ>0) setCurrentQ(i=>i-1) }

    return (
      <div style={{minHeight:'100vh',background:BG,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20,fontFamily:'var(--font)',paddingTop:NAVBAR_H+20}}>
        <style dangerouslySetInnerHTML={{__html:css}}/>
        <NavBar/>
        <div style={{width:'100%',maxWidth:620,marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <span style={{color:BLK,fontSize:'0.78rem',fontWeight:700}}>{survey.title}</span>
            <span style={{color:'#637180',fontSize:'0.78rem',fontWeight:700}}>{currentQ+1} / {total}</span>
          </div>
          <div style={{height:5,background:'rgba(184,214,242,.12)',borderRadius:99,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${((currentQ+1)/total)*100}%`,background:ACCENT,borderRadius:99,transition:'width .4s ease'}}/>
          </div>
        </div>

        <div key={animKey} className="sv-card sv-zoom" style={{width:'100%',maxWidth:620,padding:'40px 36px',minHeight:300}}>
          <p style={{fontSize:'0.72rem',fontWeight:800,color:'#637180',textTransform:'uppercase',letterSpacing:'.12em',margin:'0 0 10px'}}>Pertanyaan {currentQ+1}</p>
          <h2 style={{fontSize:'1.18rem',fontWeight:800,color:BLK,margin:'0 0 28px',lineHeight:1.45}}>
            {q.label}{q.is_required&&<span style={{color:'#ef4444'}}> *</span>}
          </h2>

          {q.type==='short_answer' && <input className="sv-inp" value={cur??''} onChange={e=>setAns(e.target.value)} placeholder="Tulis jawabanmu…"/>}
          {q.type==='long_answer' && <textarea className="sv-inp" rows={4} style={{resize:'vertical'}} value={cur??''} onChange={e=>setAns(e.target.value)} placeholder="Tulis jawabanmu…"/>}
          {q.type==='dropdown' && (
            <select className="sv-inp" style={{cursor:'pointer'}} value={cur??''} onChange={e=>setAns(e.target.value)}>
              <option value="">-- Pilih jawaban --</option>
              {q.options.map((o,i)=><option key={i} value={o}>{o}</option>)}
            </select>
          )}
          {q.type==='radio' && q.options.map((o,i)=>(
            <label key={i} className={`sv-opt${cur===o?' sel':''}`} onClick={()=>setAns(o)}>
              <input type="radio" style={{accentColor:ACCENT}} checked={cur===o} readOnly/><span>{o}</span>
            </label>
          ))}
          {q.type==='checkbox' && q.options.map((o,i)=>{
            const chk=Array.isArray(cur)&&cur.includes(o)
            return (
              <label key={i} className={`sv-opt${chk?' sel':''}`} onClick={()=>{const p=Array.isArray(cur)?cur:[];setAns(chk?p.filter((x:string)=>x!==o):[...p,o])}}>
                <input type="checkbox" style={{accentColor:ACCENT}} checked={chk} readOnly/><span>{o}</span>
              </label>
            )
          })}
          {q.type==='rating' && (
            <div style={{display:'flex',gap:10,justifyContent:'center',padding:'16px 0'}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>setAns(n)} style={{background:'none',border:'none',cursor:'pointer',padding:4,transform:cur>=n?'scale(1.15)':'scale(1)',transition:'transform .15s'}}>
                  <Star size={38} fill={cur>=n?'#f59e0b':'transparent'} color={cur>=n?'#f59e0b':'#cbd5e1'} strokeWidth={1.5}/>
                </button>
              ))}
            </div>
          )}

          {qError && <p style={{color:'#ef4444',fontSize:'0.82rem',marginTop:12,fontWeight:600}}>{qError}</p>}

          <div style={{display:'flex',gap:10,marginTop:32,justifyContent:'space-between'}}>
            <button className="sv-btn sv-btn-ghost" style={{minWidth:120}} onClick={goPrev} disabled={currentQ===0}>
              <ChevronLeft size={16}/> Sebelumnya
            </button>
            <button className="sv-btn sv-btn-navy" style={{minWidth:140}} onClick={goNext}>
              {currentQ===total-1?<><Check size={16}/> Selesai</>:<>Selanjutnya <ChevronRight size={16}/></>}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── CONSENT ──
  if (phase === 'consent') return (
    <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:'var(--font)',paddingTop:NAVBAR_H}}>
      <style dangerouslySetInnerHTML={{__html:css}}/>
      <NavBar/>
      <div className="sv-card sv-zoom" style={{padding:'48px 40px',maxWidth:520,width:'100%',textAlign:'center'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(140,198,255,.09)',border:'1px solid rgba(140,198,255,.16)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px'}}>
          <Shield size={28} color={BLK}/>
        </div>
        <h2 style={{color:BLK,fontWeight:900,fontSize:'1.3rem',margin:'0 0 16px'}}>Persetujuan Data</h2>
        <p style={{color:'#a9b4c0',lineHeight:1.8,fontSize:'0.93rem',margin:'0 0 28px',textAlign:'left'}}>
          Dengan mengisi survey ini, kamu menyetujui bahwa data yang telah kamu berikan akan disimpan dan digunakan oleh tim Marcatching sebagai bahan analisis internal.<br/><br/>
          Marcatching berkomitmen untuk <strong>tidak menyebarkan atau memperjualbelikan</strong> data pribadimu kepada pihak manapun.
        </p>
        <label style={{display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer',padding:'16px 18px',background:'rgba(255,255,255,.03)',borderRadius:14,border:`1px solid ${consentChecked?ACCENT:'rgba(184,214,242,.14)'}`,marginBottom:28,textAlign:'left',transition:'border-color .18s'}}>
          <input type="checkbox" checked={consentChecked} onChange={e=>setConsentChecked(e.target.checked)} style={{accentColor:ACCENT,marginTop:2,flexShrink:0,width:18,height:18}}/>
          <span style={{fontSize:'0.88rem',color:'#dce6ef',fontWeight:600,lineHeight:1.6}}>Saya memahami dan menyetujui bahwa data saya akan disimpan dan digunakan oleh Marcatching.</span>
        </label>
        {submitError && <p style={{color:'#ef4444',fontSize:'0.82rem',marginBottom:14,fontWeight:600}}>{submitError}</p>}
        <button className="sv-btn sv-btn-navy" style={{width:'100%'}} disabled={submitting||!consentChecked} onClick={async()=>{
          if(!consentChecked){setSubmitError('Harap centang persetujuan');return}
          setSubmitting(true);setSubmitError('')
          try {
            const biodataArr = biodataQs.map(q=>({questionId:q.id,question:q.label,answer:Array.isArray(biodataAnswers[q.id])?biodataAnswers[q.id].join(', '):String(biodataAnswers[q.id]??'')}))
            const surveyArr  = surveyQs.map(q=>({questionId:q.id,question:q.label,answer:Array.isArray(answers[q.id])?answers[q.id].join(', '):String(answers[q.id]??'')}))
            const res = await fetch('/api/surveys/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({surveyId:survey.id,surveyTitle:survey.title,biodataAnswers:biodataArr,answers:surveyArr})})
            if(res.ok) setPhase('thankyou')
            else setSubmitError('Terjadi kesalahan, coba lagi.')
          } catch { setSubmitError('Terjadi kesalahan koneksi.') }
          setSubmitting(false)
        }}>
          {submitting?'Mengirim…':<><Check size={18}/> Kirim Survey</>}
        </button>
        <button onClick={()=>setPhase('questions')} style={{marginTop:14,background:'none',border:'none',color:'#8e9baa',fontSize:'0.82rem',cursor:'pointer',fontFamily:'var(--font)',fontWeight:600}}>← Kembali</button>
      </div>
    </div>
  )

  // ── THANK YOU ──
  const firstName = (() => {
    const nameQ = biodataQs.find(q => q.label.toLowerCase().includes('nama'))
    if (nameQ && biodataAnswers[nameQ.id]) return (biodataAnswers[nameQ.id] as string).split(' ')[0]
    return ''
  })()

  return (
    <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:'var(--font)',paddingTop:NAVBAR_H}}>
      <style dangerouslySetInnerHTML={{__html:css}}/>
      <NavBar/>
      <div className="sv-card sv-pop" style={{padding:'56px 44px',maxWidth:520,width:'100%',textAlign:'center'}}>
        <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(121,214,174,.09)',border:'1px solid rgba(121,214,174,.18)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 28px'}}>
          <CheckCircle2 size={34} color="#9de0c1"/>
        </div>
        <h1 style={{color:BLK,fontWeight:900,fontSize:'1.55rem',margin:'0 0 10px',lineHeight:1.3}}>
          Terima kasih{firstName?`, ${firstName}`:''}!
        </h1>
        <p style={{color:'#a9b4c0',fontSize:'0.97rem',lineHeight:1.8,margin:'0 0 32px'}}>
          Partisipasimu dalam survey <strong style={{color:BLK}}>"{survey.title}"</strong> sangat berarti bagi kami.<br/><br/>
          Tim Marcatching akan segera menghubungimu secara personal untuk menindaklanjuti hasil survey ini.
        </p>
        <div style={{height:1,background:'linear-gradient(90deg,transparent,rgba(184,214,242,.16),transparent)',margin:'0 0 28px'}}/>
        <p style={{fontSize:'0.95rem',fontWeight:800,color:BLK,letterSpacing:'-0.02em',margin:'0 0 24px'}}>— Marcatching</p>
        <a href="https://marcatching.com" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'12px 28px',background:'rgba(255,255,255,.035)',border:'1px solid rgba(184,214,242,.16)',borderRadius:999,color:BLK,fontWeight:700,fontSize:'0.88rem',textDecoration:'none',transition:'all .18s',fontFamily:'var(--font)'}}>
          Kembali ke Marcatching.com
        </a>
      </div>
    </div>
  )
}
