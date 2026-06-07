'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Settings, Sparkles } from 'lucide-react';
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
                Prompt di Marcatching dirancang sebagai <strong>thinking system</strong> yang kuat. Untuk mendapatkan output terbaik, ikuti langkah wajib ini sebelum memasukkan prompt:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>1. Upload Dokumen Skill Marcatching</h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>
                      Buka AI workspace kamu (ChatGPT, Claude, dsb). Sebelum melakukan apa-apa, kamu wajib <strong>mengunggah (upload) dua dokumen berikut</strong> secara berurutan:
                      <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#cbd5e1' }}>
                        <li style={{ marginBottom: '4px' }}><code>skill-marcatching.md</code> (sebagai orchestrator logika AI)</li>
                        <li><code>skill.copywritting-marcatching.md</code> (sebagai panduan gaya penulisan final)</li>
                      </ul>
                    </p>
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
                      Pilih prompt dari <em>Library</em> ini yang sesuai dengan strategi kamu. Copy seluruh isi prompt tersebut (termasuk instruksi awalnya) dan tempelkan ke kolom chat AI yang sama dengan dokumen yang sudah kamu upload tadi.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(167, 139, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '8px' }}>3. Isi Placeholder Konteks</h3>
                    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>
                      Di dalam prompt, kamu akan melihat bagian <code>Konteks:</code> yang berisi variabel kosong seperti <code>Brand/Product:</code>, <code>Target Audience:</code>, dsb. 
                      Isi bagian ini secara spesifik dengan <strong>kebutuhan brand atau perusahaan kamu</strong>. Jangan gunakan jawaban *generic*.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, textAlign: 'center' }}>
                  <strong>Ingat:</strong> Prompt ini tidak akan bekerja maksimal tanpa melampirkan kedua <em>Skill Document</em> dari Marcatching terlebih dahulu!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
