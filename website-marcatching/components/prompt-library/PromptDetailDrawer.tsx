'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle2 } from 'lucide-react';
import { PromptItem } from '@/src/data/promptLibrary';
import { fillPromptContext, hasPromptContext, type PromptContext } from '@/lib/promptLibraryContext';
import styles from './PromptLibrary.module.css';

interface PromptDetailDrawerProps {
  prompt: PromptItem | null;
  isOpen: boolean;
  onClose: () => void;
  promptContext: PromptContext;
}

export const PromptDetailDrawer: React.FC<PromptDetailDrawerProps> = ({ prompt, isOpen, onClose, promptContext }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setCopied(false), 300);
    }
  }, [isOpen]);

  const filledPrompt = prompt
    ? fillPromptContext(prompt.fullPrompt.replace(/```text\n/g, '').replace(/```\n*/g, ''), promptContext)
    : '';

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(filledPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && prompt && (
        <>
          <motion.div
            className={styles.drawerOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.drawerContent}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.drawerHeader}>
              <div>
                <span className={styles.cardBadge} style={{ marginBottom: 8, display: 'inline-block' }}>
                  {prompt.categoryLabel}
                </span>
                <h2 className={styles.drawerTitle}>{prompt.title}</h2>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {hasPromptContext(promptContext) && (
                <div className={styles.memoryAttachedBadge}><CheckCircle2 size={15} /> Terisi otomatis dari Brand Memory kamu</div>
              )}
              <div className={styles.infoSection}>
                <div className={styles.infoLabel}>Psychological Job</div>
                <div className={styles.infoText}>{prompt.psychologicalJob}</div>
              </div>

              <div className={styles.infoSection}>
                <div className={styles.infoLabel}>Best Used For</div>
                <div className={styles.tags} style={{ marginTop: 8 }}>
                  {prompt.bestUsedFor.map((use, i) => (
                    <span key={i} className={styles.tag}>{use}</span>
                  ))}
                </div>
              </div>

              <div className={styles.promptBox}>
                <div className={styles.promptText}>
                  {filledPrompt}
                </div>
                <button className={styles.copyBtn} onClick={handleCopy}>
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {copied && (
        <motion.div
          className={styles.toast}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <CheckCircle2 size={20} color="#ffffff" />
          Prompt copied to clipboard!
        </motion.div>
      )}
    </AnimatePresence>
  );
};
