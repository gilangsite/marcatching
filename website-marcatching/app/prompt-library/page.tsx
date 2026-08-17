'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { HeroSection } from '@/components/prompt-library/HeroSection';
import { SearchBar } from '@/components/prompt-library/SearchBar';
import { CategoryFilter } from '@/components/prompt-library/CategoryFilter';
import { SortDropdown, SortOption } from '@/components/prompt-library/SortDropdown';
import { PromptCard } from '@/components/prompt-library/PromptCard';
import { PromptDetailDrawer } from '@/components/prompt-library/PromptDetailDrawer';
import { HowToUsePromptLibrary } from '@/components/prompt-library/HowToUsePromptLibrary';
import { HowToUseModal } from '@/components/prompt-library/HowToUseModal';
import { promptLibrary, PromptCategory, PromptItem, PromptRole } from '@/src/data/promptLibrary';
import { supabase, type NavLink } from '@/lib/supabaseClient';
import { buildPromptContext, hasPromptContext, type PromptContext } from '@/lib/promptLibraryContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/components/prompt-library/PromptLibrary.module.css';

export default function PromptLibraryPage() {
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [activeRole, setActiveRole] = useState<PromptRole>('digital-marketer');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PromptCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHowToModalOpen, setIsHowToModalOpen] = useState(false);
  const [promptContext, setPromptContext] = useState<PromptContext>({});
  const [workspaceStatus, setWorkspaceStatus] = useState<'checking' | 'signed-out' | 'connected'>('checking');

  useEffect(() => {
    let mounted = true;

    supabase
      .from('nav_links')
      .select('*')
      .eq('is_active', true)
      .order('order_index')
      .then(({ data }) => {
        if (mounted) setNavLinks((data || []) as NavLink[]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function hydrateBrandContext() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!user) {
        setWorkspaceStatus('signed-out');
        return;
      }
      const { data: row } = await supabase.from('creator_workspaces').select('data').eq('user_id', user.id).maybeSingle();
      if (!mounted) return;
      setPromptContext(buildPromptContext(row?.data));
      setWorkspaceStatus('connected');
    }

    void hydrateBrandContext();
    return () => {
      mounted = false;
    };
  }, []);

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
    const result = promptLibrary.filter((prompt) => {
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
  }, [searchQuery, activeCategory, sortBy, activeRole]);

  return (
    <>
      <Navbar navLinks={navLinks} />

      <main className={styles.main}>
        <HeroSection />
        
        <div className={styles.container}>
          {workspaceStatus !== 'checking' && (
            <section
              id="brand-memory-gate"
              className={`${styles.memoryGate} ${hasPromptContext(promptContext) ? styles.memoryGateReady : ''}`}
            >
              <div className={styles.memoryGateCopy}>
                <span>{hasPromptContext(promptContext) ? <CheckCircle2 size={21} /> : <Sparkles size={21} />}</span>
                <div>
                  <small>Optional context</small>
                  <h2>{hasPromptContext(promptContext) ? 'Brand Memory kamu terhubung.' : 'Prompt di bawah masih kosong — isi manual atau hubungkan Brand Memory.'}</h2>
                  <p>{hasPromptContext(promptContext) ? 'Field seperti Brand/Product, Tone, dan Offer otomatis terisi dari Creator Workspace kamu saat prompt dibuka.' : 'Login dan lengkapi Brand Memory di Creator Workspace supaya field ini terisi otomatis tiap kamu buka prompt — atau tetap isi manual, itu opsional.'}</p>
                </div>
              </div>
              <Link href="/course/workspace" className={styles.memoryDropzone}>
                <span>{hasPromptContext(promptContext) ? 'Kelola Brand Memory' : 'Isi Brand Memory'}</span>
              </Link>
            </section>
          )}
          
          {/* Role Selector UI */}
          <div className={styles.roleSelectorWrap}>
            <div className={styles.roleSelector}>
              <button
                onClick={() => { setActiveRole('digital-marketer'); setActiveCategory('all'); }}
                className={`${styles.roleButton} ${activeRole === 'digital-marketer' ? styles.roleButtonActive : ''}`}
              >
                Digital Marketer
              </button>
              <button
                onClick={() => { setActiveRole('content-creator'); setActiveCategory('all'); }}
                className={`${styles.roleButton} ${activeRole === 'content-creator' ? styles.roleButtonActive : ''}`}
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
                className={styles.howToButton}
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
                  autoFilled={hasPromptContext(promptContext)}
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
          promptContext={promptContext}
        />
      </main>

      <Footer />
    </>
  );
}
