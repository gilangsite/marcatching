'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ProductPickerGrid } from '@/components/store/ProductPickerGrid';

interface SkillStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkillStoreModal: React.FC<SkillStoreModalProps> = ({ isOpen, onClose }) => {
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
              maxWidth: '760px',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px' }}>Pilih Skill Marcatching</h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>Semua Skill yang bisa dipersonalisasi dengan Brand Memory kamu. Pilih satu untuk lanjut ke checkout.</p>
              </div>
              <button
                onClick={onClose}
                style={{ flexShrink: 0, background: 'rgba(255, 255, 255, 0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px 28px', overflowY: 'auto' }}>
              <ProductPickerGrid lockedCategorySlug="skill" emptyLabel="Belum ada Skill yang tersedia saat ini." />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
