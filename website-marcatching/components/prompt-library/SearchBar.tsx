import React from 'react';
import { Search } from 'lucide-react';
import styles from './PromptLibrary.module.css';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className={styles.searchContainer}>
      <Search size={20} className={styles.searchIcon} />
      <input
        type="text"
        placeholder="Search prompts (e.g., 'Risk Reversal', 'High-Ticket')"
        className={styles.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};
