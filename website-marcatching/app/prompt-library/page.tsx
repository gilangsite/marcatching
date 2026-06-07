'use client';

import React, { useState, useMemo } from 'react';
import { HeroSection } from '@/components/prompt-library/HeroSection';
import { SearchBar } from '@/components/prompt-library/SearchBar';
import { CategoryFilter } from '@/components/prompt-library/CategoryFilter';
import { SortDropdown, SortOption } from '@/components/prompt-library/SortDropdown';
import { PromptCard } from '@/components/prompt-library/PromptCard';
import { PromptDetailDrawer } from '@/components/prompt-library/PromptDetailDrawer';
import { HowToUsePromptLibrary } from '@/components/prompt-library/HowToUsePromptLibrary';
import { HowToUseModal } from '@/components/prompt-library/HowToUseModal';
import { promptLibrary, PromptCategory, PromptItem } from '@/src/data/promptLibrary';
import styles from '@/components/prompt-library/PromptLibrary.module.css';

const CATEGORIES: { id: PromptCategory | 'all', label: string }[] = [
  { id: 'all', label: 'All Prompts' },
  { id: 'trust', label: 'Trust & Safety' },
  { id: 'urgency', label: 'Ethical Urgency' },
  { id: 'premium-perception', label: 'Premium Perception' },
  { id: 'identity-signaling', label: 'Identity Signaling' },
  { id: 'loss-aversion', label: 'Loss Aversion' },
  { id: 'cognitive-ease', label: 'Cognitive Ease' },
  { id: 'belonging', label: 'Belonging' },
  { id: 'relief', label: 'Relief' },
];

export default function PromptLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PromptCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHowToModalOpen, setIsHowToModalOpen] = useState(false);

  const handleOpenDrawer = (prompt: PromptItem) => {
    setSelectedPrompt(prompt);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const filteredAndSortedPrompts = useMemo(() => {
    // Filter
    let result = promptLibrary.filter((prompt) => {
      const matchesCategory = activeCategory === 'all' || prompt.category === activeCategory;
      const matchesSearch = 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        prompt.psychologicalJob.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'recommended') {
        return a.recommendedOrder - b.recommendedOrder;
      } else if (sortBy === 'a-z') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'z-a') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return result;
  }, [searchQuery, activeCategory, sortBy]);

  return (
    <main>
      <HeroSection />
      
      <div className={styles.container}>
        <div className={styles.topBar}>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <div className={styles.filterSortContainer}>
            <button 
              onClick={() => setIsHowToModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              How to Use This Prompt
            </button>
            <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
          </div>
        </div>

        <CategoryFilter 
          categories={CATEGORIES} 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
        />

        {filteredAndSortedPrompts.length > 0 ? (
          <div className={styles.grid}>
            {filteredAndSortedPrompts.map((prompt) => (
              <PromptCard 
                key={prompt.id} 
                prompt={prompt} 
                onClick={handleOpenDrawer} 
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>No prompts found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      <HowToUsePromptLibrary />

      <HowToUseModal 
        isOpen={isHowToModalOpen} 
        onClose={() => setIsHowToModalOpen(false)} 
      />

      <PromptDetailDrawer 
        prompt={selectedPrompt} 
        isOpen={isDrawerOpen} 
        onClose={handleCloseDrawer} 
      />
    </main>
  );
}
