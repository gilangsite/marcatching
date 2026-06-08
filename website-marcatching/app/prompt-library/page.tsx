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
import { promptLibrary, PromptCategory, PromptItem, PromptRole } from '@/src/data/promptLibrary';
import styles from '@/components/prompt-library/PromptLibrary.module.css';

export default function PromptLibraryPage() {
  const [activeRole, setActiveRole] = useState<PromptRole>('digital-marketer');
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

  const categoriesForRole = useMemo(() => {
    const rolePrompts = promptLibrary.filter(p => p.role === activeRole);
    const uniqueCatLabels = Array.from(new Set(rolePrompts.map(p => p.categoryLabel)));
    const dynamicCats = uniqueCatLabels.map(label => ({
      id: rolePrompts.find(p => p.categoryLabel === label)?.category || label,
      label
    }));
    return [{ id: 'all', label: 'All Prompts' }, ...dynamicCats];
  }, [activeRole]);

  const filteredAndSortedPrompts = useMemo(() => {
    // Filter
    let result = promptLibrary.filter((prompt) => {
      if (prompt.role !== activeRole) return false;
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
        
        {/* Role Selector UI */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <button
              onClick={() => { setActiveRole('digital-marketer'); setActiveCategory('all'); }}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: activeRole === 'digital-marketer' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                color: activeRole === 'digital-marketer' ? '#38bdf8' : '#94a3b8',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeRole === 'digital-marketer' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              Digital Marketer
            </button>
            <button
              onClick={() => { setActiveRole('content-creator'); setActiveCategory('all'); }}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: activeRole === 'content-creator' ? 'rgba(167, 139, 250, 0.1)' : 'transparent',
                color: activeRole === 'content-creator' ? '#a855f7' : '#94a3b8',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeRole === 'content-creator' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              Content Creator
            </button>
          </div>
        </div>

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
          categories={categoriesForRole} 
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
