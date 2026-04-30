import { useMemo } from 'react';

/**
 * Generic hook for filtering items based on search query
 * @param items - Array of items to filter
 * @param searchQuery - Search query string
 * @param searchFields - Array of field names to search in (optional)
 * @returns Filtered items array
 */
export const useSearchItems = <T extends object>(
  items: T[] | undefined,
  searchQuery: string,
  searchFields?: (keyof T)[]
): T[] | undefined => {
  return useMemo(() => {
    if (!items || !searchQuery.trim()) return items;

    // Split search query into individual words
    const searchWords = searchQuery.toLowerCase().trim().split(/\s+/);
    
    return items.filter((item) => {
      // If searchFields provided, use only those fields
      const fieldsToSearch = searchFields || (Object.keys(item) as (keyof T)[]);
      
      // Create searchable text from specified fields
      const searchText = fieldsToSearch
        .map((field) => String(item[field] ?? ''))
        .join(' ')
        .toLowerCase();

      // Check that EVERY word exists in the text
      return searchWords.every((word) => searchText.includes(word));
    });
  }, [items, searchQuery, searchFields]);
};