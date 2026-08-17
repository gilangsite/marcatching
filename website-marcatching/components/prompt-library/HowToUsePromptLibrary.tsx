import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PromptLibrary.module.css';

const faqs = [
  {
    question: "How do I use these prompts?",
    answer: "If you're logged in and your Brand Memory is filled in the Creator Workspace, the 'Konteks' section fills in automatically. Otherwise, copy the prompt, fill in the blanks with your specific product and audience details, and paste it into ChatGPT, Claude, or any AI tool."
  },
  {
    question: "Do I need a paid AI tool?",
    answer: "No, these prompts work well with free versions of ChatGPT and Claude. However, advanced models like GPT-4 or Claude 3 Opus will generally follow the complex tone instructions more precisely."
  },
  {
    question: "Why shouldn't I just ask the AI to 'write a sales page'?",
    answer: "Generic prompts produce generic, robotic copy. Marcatching prompts are engineered with specific consumer psychology frameworks (like Trust, Urgency, Premium Perception) to generate strategic copy that converts."
  },
  {
    question: "Can I use multiple prompts for one campaign?",
    answer: "Yes! In fact, we recommend it. Use a Trust prompt for your guarantee section, an Urgency prompt for your closing email, and a Premium Perception prompt for your main sales page."
  }
];

export const HowToUsePromptLibrary: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className={styles.howToUse}>
      <div className={styles.howToUseContainer}>
        <h2 className={styles.howToUseTitle}>How to Get the Best Results</h2>
        
        <div className={styles.stepList}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Fill in the Context Blanks</h3>
              <p>Every prompt has a 'Konteks' section. Fill in your Brand Memory once in the Creator Workspace and it auto-fills here — or fill it manually per prompt. Either way, don't leave it empty: the more precise your Product, Audience, and Friction, the sharper the AI's output will be.</p>
            </div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Don't Accept the First Output</h3>
              <p>Treat the AI like a junior copywriter. If the tone is too hyped, tell it: "Make it more premium and calm." If it's too long, say: "Condense this to 3 short sentences."</p>
            </div>
          </div>
          
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Combine Categories</h3>
              <p>For a sales page, use a Trust prompt for the hero section, an Urgency prompt for the CTA, and a Premium Perception prompt for the pricing table.</p>
            </div>
          </div>
        </div>

        <div className={styles.faqSection} style={{ marginTop: '80px' }}>
          <h2 className={styles.howToUseTitle} style={{ marginBottom: '40px' }}>Frequently Asked Questions</h2>
          <div className={styles.faqList} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: 'var(--mc-radius-md)',
                  overflow: 'hidden'
                }}
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '24px', 
                    color: 'var(--mc-paper)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {faq.question}
                  {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div style={{ padding: '0 24px 24px', color: 'var(--mc-silver)', lineHeight: 1.6 }}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.ctaSection}>
          <h2>Want to master consumer psychology?</h2>
          <p>Read our Skill Docs to understand the principles behind these prompts.</p>
          <Link href="/skill-docs" className={styles.ctaBtn}>
            Read Skill Docs <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};
