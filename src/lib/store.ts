import { ProductivityEntry } from './types';

const STORAGE_KEY = 'productivity_entries';

export const getEntries = (): ProductivityEntry[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveEntry = (entry: ProductivityEntry) => {
  const entries = getEntries();
  const index = entries.findIndex(e => e.id === entry.id);
  if (index >= 0) {
    entries[index] = entry;
  } else {
    entries.push(entry);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const deleteEntry = (id: string) => {
  const entries = getEntries();
  const filtered = entries.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};