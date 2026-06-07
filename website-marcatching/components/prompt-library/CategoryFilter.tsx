import React from 'react';
import { PromptCategory } from '@/src/data/promptLibrary';
import styles from './PromptLibrary.module.css';

interface CategoryFilterProps {
  categories: { id: PromptCategory | 'all', label: string }[];
  activeCategory: PromptCategory | 'all';
  setActiveCategory: (category: PromptCategory | 'all') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  activeCategory, 
  setActiveCategory 
}) => {
  return (
    <div className={styles.categoryList}>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`${styles.categoryBtn} ${activeCategory === category.id ? styles.categoryBtnActive : ''}`}
          onClick={() => setActiveCategory(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};
