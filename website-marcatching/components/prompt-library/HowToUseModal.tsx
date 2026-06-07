'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Settings, Sparkles, Download } from 'lucide-react';
import styles from './PromptLibrary.module.css';

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
              background: '#0D1118', 
              border: '1px solid #1e293b', 
              borderRadius: '16px', 
              width: '100%', 
              maxWidth: '650px', 
              maxHeight: '85vh', 
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ position: 'sticky', top: 0, background: 'rgba(13, 17, 24, 0.95)', backdropFilter: 'blur(10px)', padding: '24px 32px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Cara Menggunakan Prompt</h2>
              <button 
                onClick={onClose}
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '32px' }}>
              <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '32px' }}>
                Mulai versi 1.2.0, Prompt Library ini terhubung dengan <strong>Marcatching Modular Skill System V2</strong>. Untuk hasil yang optimal, ikuti panduan berikut:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>1. Upload Skill Documents</h3>
                    <div style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>
                      Buka AI workspace kamu. Kamu punya dua pilihan:
                      <br/><br/>
                      <strong>MODE A — Master File Mode:</strong><br/>
                      Cukup upload 1 file: <code>marcatching-modular-skill-system-v2-master.md</code>
                      <br/><br/>
                      <strong>MODE B — Modular Mode:</strong><br/>
                      Upload 4 file wajib: <code>skill-marcatching.md</code>, <code>marcatching-core.md</code>, <code>marcatching-copy-engine.md</code>, <code>marcatching-evaluator-engine.md</code>, lalu tambahkan modul spesifik sesuai instruksi prompt.
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
                        fontWeight: 600,
                        padding: '10px 20px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Download size={18} />
                      Download Skill Documents
                    </a>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(95, 183, 176, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5FB7B0' }}>
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>2. Copy & Paste Prompt Utama</h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>
                      Pilih prompt dari <em>Library</em> yang sesuai strategi kamu. Copy seluruh isi prompt tersebut (termasuk instruksi awalnya) dan tempelkan ke kolom chat AI.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>3. PENTING: Isi Placeholder Konteks</h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>
                      Di dalam prompt, kamu akan melihat bagian <code>Konteks:</code> yang berisi variabel. 
                    </p>
                    <div style={{ 
                      background: 'rgba(239, 68, 68, 0.15)', 
                      border: '1px solid rgba(239, 68, 68, 0.3)', 
                      padding: '16px', 
                      borderRadius: '8px',
                      marginTop: '12px'
                    }}>
                      <strong style={{ color: '#fca5a5', display: 'block', marginBottom: '8px', fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                        ⚠️ WAJIB: HAPUS CONTOH TEXT DAN GANTI SESUAI KEBUTUHAN BRAND KAMU!
                      </strong>
                      <p style={{ color: '#fecaca', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                        Jangan biarkan placeholder terisi dengan *contoh* dari kami atau kosong. Isi secara spesifik (misal: "Target Audience: Founder muda yang pusing mikirin cashflow") agar AI tidak menghasilkan output yang generic.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, textAlign: 'center' }}>
                  <strong>Ingat:</strong> Prompt ini tidak akan bekerja maksimal tanpa <em>Skill Document</em> dari Marcatching!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
