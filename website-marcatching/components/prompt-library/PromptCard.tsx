import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { PromptItem } from '@/src/data/promptLibrary';
import styles from './PromptLibrary.module.css';

interface PromptCardProps {
  prompt: PromptItem;
  onClick: (prompt: PromptItem) => void;
  locked?: boolean;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onClick, locked = false }) => {
  return (
    <button type="button" className={`${styles.card} ${locked ? styles.cardLocked : ''}`} onClick={() => onClick(prompt)} aria-label={`${locked ? 'Upload brand-memory.md untuk membuka' : 'Buka'} ${prompt.title}`}>
      <div className={styles.cardHeader}>
        <span className={styles.cardBadge}>{prompt.categoryLabel}</span>
        <span className={styles.cardNumber}>#{prompt.promptNumber}</span>
      </div>
      
      <h3 className={styles.cardTitle}>{prompt.title}</h3>
      <p className={styles.cardDesc}>{prompt.psychologicalJob}</p>
      
      <div className={styles.tags}>
        {prompt.bestUsedFor.slice(0, 3).map((use, index) => (
          <span key={index} className={styles.tag}>{use}</span>
        ))}
        {prompt.bestUsedFor.length > 3 && (
          <span className={styles.tag}>+{prompt.bestUsedFor.length - 3}</span>
        )}
      </div>
      
      <div className={styles.cardFooter}>
        <span className={styles.cardAction}>
          {locked ? <><Lock size={15} /> Perlu Brand Memory</> : <>View Prompt <ArrowRight size={16} className={styles.cardActionIcon} /></>}
        </span>
      </div>
    </button>
  );
};
