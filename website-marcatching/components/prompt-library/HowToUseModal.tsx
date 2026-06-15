'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Package, FileText, Layers, Zap } from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
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
                Prompt Library ini bekerja dengan <strong style={{ color: '#f1f5f9' }}>Marcatching Skill Main v1.1</strong> — satu skill yang diinstall di Claude. Setup cukup dilakukan sekali, lalu kamu bisa langsung jalankan prompt dari library ini kapan saja.
              </p>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(13, 51, 105, 0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.16)' }}>
                    <Package size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                      Step 1 — Install Skill di Claude
                    </h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.93rem', marginBottom: '12px' }}>
                      Download Skill ZIP dari Marcatching, lalu install di Claude. Setelah aktif, panggil skill dengan mengetik:
                    </p>
                    <div style={{ background: 'rgba(13, 51, 105, 0.30)', border: '1px solid rgba(255, 255, 255, 0.16)', borderRadius: '8px', padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#ffffff' }}>
                      /marcatching-skill-main
                    </div>

                    {/* Download Button */}
                    <a 
                      href="https://www.marcatching.com/product/master-skills-for-marketing-expert"
                      target="_blank"
                      rel="noreferrer"
                      style={{ 
                        marginTop: '16px', 
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
                      <Download size={17} />
                      Download Marcatching Skill
                    </a>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(13, 51, 105, 0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.16)' }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                      Step 2 — Isi Brand Memory Template
                    </h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.93rem', marginBottom: '10px' }}>
                      Buka file <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px' }}>brand-memory-template.md</code> dari Skill ZIP. Isi bagian:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      {['Brand Snapshot', 'Offer', 'Audience', 'Voice', 'Competitors', 'Proof', 'Usage Notes'].map(item => (
                        <span key={item} style={{ background: 'rgba(13, 51, 105, 0.30)', border: '1px solid rgba(255, 255, 255, 0.16)', borderRadius: '6px', padding: '3px 10px', fontSize: '0.82rem', color: '#ffffff' }}>{item}</span>
                      ))}
                    </div>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.93rem' }}>
                      Setelah selesai, rename jadi <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px' }}>brand-memory-profile.md</code> — ini adalah memory utama brandmu.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(13, 51, 105, 0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.16)' }}>
                    <Layers size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                      Step 3 — Simpan Brand Memory ke Claude Project
                    </h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.93rem', marginBottom: '12px' }}>
                      Ada 3 cara menyimpan brand memory agar tidak perlu diketik ulang:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { label: 'Option A — Claude Project', desc: 'Upload brand-memory-profile.md ke Project Knowledge. Setiap sesi baru langsung tersedia.' },
                        { label: 'Option B — Same Conversation', desc: 'Upload atau paste brand-memory-profile.md di awal conversation. Berlaku untuk satu sesi.' },
                        { label: 'Option C — Local File', desc: 'Simpan file di lokal. Jika ada update brand, edit file lalu upload ulang ke project.' },
                      ].map((opt, i) => (
                        <div key={i} style={{ background: 'rgba(13, 51, 105, 0.24)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', padding: '12px 14px' }}>
                          <strong style={{ color: '#ffffff', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>{opt.label}</strong>
                          <span style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>{opt.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(13, 51, 105, 0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.16)' }}>
                    <Zap size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                      Step 4 — Jalankan Skill + Copy Prompt
                    </h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.93rem', marginBottom: '12px' }}>
                      Setiap sesi baru, gunakan format ini:
                    </p>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.7 }}>
                      <span style={{ color: '#ffffff' }}>/marcatching-skill-main</span>
                      <br /><br />
                      Gunakan Brand Memory Profile yang tersedia sebagai konteks utama.
                      <br /><br />
                      Task:<br />
                      [Paste prompt dari library ini]
                    </div>

                    {/* Important Warning */}
                    <div style={{ 
                      background: 'rgba(13, 51, 105, 0.28)', 
                      border: '1px solid rgba(255, 255, 255, 0.14)', 
                      padding: '14px 16px', 
                      borderRadius: '8px',
                      marginTop: '12px'
                    }}>
                      <strong style={{ color: '#ffffff', display: 'block', marginBottom: '6px', fontSize: '0.88rem' }}>
                        WAJIB: Isi Placeholder di Bagian Konteks!
                      </strong>
                      <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                        Setiap prompt punya bagian <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px' }}>Konteks:</code>. Hapus contoh teks dan isi dengan data brand kamu yang spesifik. Output yang generic adalah akibat dari konteks yang kosong.
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
                  <strong style={{ color: '#94a3b8' }}>Ingat:</strong> Prompt ini tidak akan bekerja maksimal tanpa <em>Skill Main</em> dari Marcatching.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
