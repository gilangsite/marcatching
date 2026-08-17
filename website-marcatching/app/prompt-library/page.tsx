'use client';

import React, { useState, useEffect } from 'react';
import { HeroSection } from '@/components/prompt-library/HeroSection';
import { PromptLibraryBrowser } from '@/components/prompt-library/PromptLibraryBrowser';
import { supabase, type NavLink } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from '@/components/prompt-library/PromptLibrary.module.css';

export default function PromptLibraryPage() {
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);

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

  return (
    <>
      <Navbar navLinks={navLinks} />

      <main className={styles.main}>
        <HeroSection />
        <PromptLibraryBrowser />
      </main>

      <Footer />
    </>
  );
}
