import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationSearch } from '../../hooks/useLocationSearch';
import type { Location } from '../../types';
import styles from './SearchBox.module.css';

interface SearchBoxProps {
  autoFocus?: boolean;
  placeholder?: string;
}

export function SearchBox({ autoFocus = false, placeholder = "Search for a town or city..." }: SearchBoxProps) {
  const navigate = useNavigate();
  const { query, setQuery, results, isLoading } = useLocationSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Open dropdown when results are available
  useEffect(() => {
    setIsOpen(results.length > 0);
    setHighlightedIndex(-1);
  }, [results]);

  // Handle selecting a location
  const handleSelect = (location: Location) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/weather/${location.slug}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          aria-label="Search for a location"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      </div>

      {isOpen && results.length > 0 && (
        <ul
          ref={listRef}
          className={styles.dropdown}
          role="listbox"
          aria-label="Search results"
        >
          {results.map((location, index) => (
            <li
              key={location.slug}
              className={`${styles.option} ${index === highlightedIndex ? styles.highlighted : ''}`}
              onClick={() => handleSelect(location)}
              onMouseEnter={() => setHighlightedIndex(index)}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <span className={styles.locationName}>{location.name}</span>
              {location.county && (
                <span className={styles.locationCounty}>{location.county}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
