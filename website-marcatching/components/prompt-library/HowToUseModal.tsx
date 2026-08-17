'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Package, FileText, Layers, Zap } from 'lucide-react';
import { SkillStoreModal } from './SkillStoreModal';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  const [skillStoreOpen, setSkillStoreOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 4, 7, 0.85)', backdropFilter: 'blur(8px)' }}
          />

          {/* Modal Box */}
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
              maxWidth: '680px', 
              maxHeight: '88vh', 
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Sticky Header */}
            <div style={{ position: 'sticky', top: 0, background: 'rgba(13, 17, 24, 0.95)', backdropFilter: 'blur(10px)', padding: '24px 32px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Cara Pakai Prompt Library</h2>
              <button 
                onClick={onClose}
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              {/* Intro */}
              <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, marginBottom: '32px' }}>
                Isi Brand Memory di Creator Workspace <strong style={{ color: '#f1f5f9' }}>sekali saja</strong>, dan prompt di library ini akan otomatis terisi dengan data brand kamu setiap kali dibuka — tidak wajib, tapi bikin hasilnya jauh lebih spesifik daripada isi manual.
              </p>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(13, 51, 105, 0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.16)' }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                      Step 1 — Login & Isi Brand Memory di Creator Workspace
                    </h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.93rem', marginBottom: '12px' }}>
                      Lengkapi Creator Voice, Redlines, Audience Facts, Offer, dan Proof Kit sekali saja di Creator Workspace. Ini opsional — tanpa ini prompt tetap bisa dipakai, cuma field-nya kosong dan harus diisi manual.
                    </p>
                    <a
                      href="/course/workspace"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#f8fafc',
                        color: '#0f172a',
                        fontWeight: 700,
                        padding: '10px 20px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.93rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      Buka Creator Workspace
                    </a>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(13, 51, 105, 0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.16)' }}>
                    <Layers size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                      Step 2 — Prompt di sini otomatis terisi
                    </h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.93rem' }}>
                      Begitu Brand Memory kamu lengkap, buka prompt manapun di library ini — field seperti <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px' }}>Brand/Product:</code>, <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px' }}>Tone:</code>, dan <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px' }}>Offer:</code> otomatis terisi data brand kamu, baik saat dibaca di halaman ini maupun saat di-copy. Field yang sifatnya per-konten (Funnel Stage, Channel) tetap kosong karena memang berubah tiap kamu bikin konten baru.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(13, 51, 105, 0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.16)' }}>
                    <Package size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                      Step 3 — Pakai Skill Marcatching di Claude/ChatGPT (opsional)
                    </h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.93rem', marginBottom: '12px' }}>
                      Kalau kamu sudah beli Skill Marcatching, download versi personalized dari Creator Workspace — <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px' }}>brand-memory.md</code> sudah otomatis ada di dalam ZIP-nya, tidak perlu upload atau rename manual lagi.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSkillStoreOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,255,255,0.06)',
                        color: '#f8fafc',
                        fontWeight: 700,
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '0.93rem',
                        border: '1px solid rgba(255,255,255,0.14)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Download size={17} />
                      Lihat Skill Marcatching
                    </button>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(13, 51, 105, 0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.16)' }}>
                    <Zap size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                      Step 4 — Copy Prompt & Jalankan
                    </h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.93rem', marginBottom: '12px' }}>
                      Klik &quot;Copy Prompt&quot; lalu paste ke Claude atau ChatGPT.
                    </p>

                    <div style={{
                      background: 'rgba(13, 51, 105, 0.28)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      padding: '14px 16px',
                      borderRadius: '8px'
                    }}>
                      <strong style={{ color: '#ffffff', display: 'block', marginBottom: '6px', fontSize: '0.88rem' }}>
                        Field kosong itu wajar, bukan error
                      </strong>
                      <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                        Kalau belum login atau Brand Memory belum lengkap, bagian <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px' }}>Konteks:</code> di prompt tetap kosong — isi manual sesuai brand kamu sebelum menjalankan prompt, atau lengkapi Brand Memory dulu supaya terisi otomatis di kunjungan berikutnya.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Setup Levels */}
              <div style={{ marginTop: '36px', padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <h4 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '14px', fontSize: '0.95rem' }}>Struktur yang Benar</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { icon: '01', label: 'Skill ZIP', desc: 'Operating system AI' },
                    { icon: '02', label: 'Brand Memory', desc: 'Data brand kamu' },
                    { icon: '03', label: 'Prompt Library', desc: 'Task templates' },
                  ].map((item, i) => (
                    <div key={i} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.82rem', marginBottom: '6px', color: '#ffffff', fontWeight: 700 }}>{item.icon}</div>
                      <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.87rem', lineHeight: 1.5, textAlign: 'center' }}>
                  <strong style={{ color: '#94a3b8' }}>Ingat:</strong> Brand Memory yang lengkap bikin hasil prompt jauh lebih spesifik — tapi opsional, prompt tetap jalan tanpanya.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    <SkillStoreModal isOpen={skillStoreOpen} onClose={() => setSkillStoreOpen(false)} />
    </>
  );
};
