'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { SearchBar } from '@/components/prompt-library/SearchBar';
import { CategoryFilter } from '@/components/prompt-library/CategoryFilter';
import { SortDropdown, SortOption } from '@/components/prompt-library/SortDropdown';
import { PromptCard } from '@/components/prompt-library/PromptCard';
import { PromptDetailDrawer } from '@/components/prompt-library/PromptDetailDrawer';
import { HowToUsePromptLibrary } from '@/components/prompt-library/HowToUsePromptLibrary';
import { HowToUseModal } from '@/components/prompt-library/HowToUseModal';
import { PromptLibraryLoginModal } from '@/components/prompt-library/PromptLibraryLoginModal';
import { promptLibrary, PromptCategory, PromptItem, PromptRole } from '@/src/data/promptLibrary';
import { supabase } from '@/lib/supabaseClient';
import { buildPromptContext, hasPromptContext, type PromptContext } from '@/lib/promptLibraryContext';
import styles from './PromptLibrary.module.css';

export function PromptLibraryBrowser() {
  const [activeRole, setActiveRole] = useState<PromptRole>('digital-marketer');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<PromptCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHowToModalOpen, setIsHowToModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [promptContext, setPromptContext] = useState<PromptContext>({});
  const [workspaceStatus, setWorkspaceStatus] = useState<'checking' | 'signed-out' | 'connected'>('checking');

  const hydrateBrandContext = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setWorkspaceStatus('signed-out');
      return;
    }
    const { data: row } = await supabase.from('creator_workspaces').select('data').eq('user_id', user.id).maybeSingle();
    setPromptContext(buildPromptContext(row?.data));
    setWorkspaceStatus('connected');
  }, []);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!mounted) return;
      await hydrateBrandContext();
    }
    void run();
    return () => { mounted = false };
  }, [hydrateBrandContext]);

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
    const result = promptLibrary.filter((prompt) => {
      if (prompt.role !== activeRole) return false;
      const matchesCategory = activeCategory === 'all' || prompt.category === activeCategory;
      const matchesSearch =
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.psychologicalJob.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });

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

  const isSignedOut = workspaceStatus === 'signed-out';
  const isConnected = workspaceStatus === 'connected';
  const contextReady = hasPromptContext(promptContext);

  return (
    <div className={styles.container}>
      {workspaceStatus !== 'checking' && (
        <section
          id="brand-memory-gate"
          className={`${styles.memoryGate} ${contextReady ? styles.memoryGateReady : ''}`}
        >
          <div className={styles.memoryGateCopy}>
            <span>{contextReady ? <CheckCircle2 size={21} /> : <Sparkles size={21} />}</span>
            <div>
              <small>Optional context</small>
              <h2>
                {contextReady
                  ? 'Brand Memory kamu terhubung.'
                  : isSignedOut
                    ? 'Login supaya prompt di bawah otomatis terisi Brand Memory kamu.'
                    : 'Prompt di bawah masih kosong — isi manual atau hubungkan Brand Memory.'}
              </h2>
              <p>
                {contextReady
                  ? 'Field seperti Brand/Product, Tone, dan Offer otomatis terisi dari Creator Workspace kamu saat prompt dibuka.'
                  : isSignedOut
                    ? 'Pakai akun member yang sama dengan Creator Workspace — atau tetap isi manual, itu opsional.'
                    : 'Login dan lengkapi Brand Memory di Creator Workspace supaya field ini terisi otomatis tiap kamu buka prompt — atau tetap isi manual, itu opsional.'}
              </p>
            </div>
          </div>
          {isSignedOut ? (
            <button type="button" className={styles.memoryDropzone} onClick={() => setIsLoginModalOpen(true)}>
              <span>Login</span>
            </button>
          ) : (
            <Link href="/course/workspace" className={styles.memoryDropzone}>
              <span>{contextReady ? 'Kelola Brand Memory' : 'Isi Brand Memory'}</span>
            </Link>
          )}
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
              autoFilled={contextReady}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3>No prompts found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      <HowToUsePromptLibrary />

      <HowToUseModal
        isOpen={isHowToModalOpen}
        onClose={() => setIsHowToModalOpen(false)}
      />

      <PromptLibraryLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          void hydrateBrandContext();
        }}
      />

      <PromptDetailDrawer
        prompt={selectedPrompt}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        promptContext={promptContext}
      />
    </div>
  );
}
