import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './PromptLibrary.module.css';

export type SortOption = 'recommended' | 'a-z' | 'z-a';

interface SortDropdownProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, setSortBy }) => {
  return (
    <div className={styles.selectWrapper}>
      <select 
        className={styles.select}
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortOption)}
      >
        <option value="recommended">Recommended</option>
        <option value="a-z">A - Z</option>
        <option value="z-a">Z - A</option>
      </select>
      <ChevronDown size={16} className={styles.selectIcon} />
    </div>
  );
};
