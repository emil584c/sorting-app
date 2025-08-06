import { useMemo } from 'react';

export function useSearch<T>(
  items: T[],
  searchKeys: (keyof T)[],
  searchTerm: string
) {
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;

    return items.filter(item => {
      return searchKeys.some(key => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value).toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
  }, [items, searchKeys, searchTerm]);

  return filteredItems;
}

export function useFilter<T>(
  items: T[],
  filters: Record<string, any>
) {
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          return true; // Skip empty filters
        }

        const itemValue = (item as any)[key];
        
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        
        if (typeof value === 'boolean') {
          return itemValue === value;
        }
        
        if (typeof value === 'string') {
          return String(itemValue).toLowerCase().includes(value.toLowerCase());
        }
        
        return itemValue === value;
      });
    });
  }, [items, filters]);

  return filteredItems;
}