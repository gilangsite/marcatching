import React from 'react';
import styles from './PromptLibrary.module.css';

export const HeroSection: React.FC = () => {
  return (
    <section className={styles.heroSection}>
      <h1 className={styles.heroTitle}>
        The Marcatching <span>Prompt Library</span>
      </h1>
      <p className={styles.heroSubtitle}>
        Premium conversion prompts designed to trigger psychological responses. 
        Filter by category, copy the exact phrasing, and generate high-converting copy in seconds.
      </p>
    </section>
  );
};
