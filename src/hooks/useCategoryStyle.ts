import { useState, useEffect, useCallback } from 'react';

export type CategoryStyle = 'circle' | 'pill';

const STORAGE_KEY = 'sp_category_style';

function getStoredStyle(): CategoryStyle {
  try {
    return (localStorage.getItem(STORAGE_KEY) as CategoryStyle) || 'pill';
  } catch {
    return 'pill';
  }
}

export function useCategoryStyle() {
  const [style, setStyle] = useState<CategoryStyle>(getStoredStyle);

  const updateStyle = useCallback((newStyle: CategoryStyle) => {
    setStyle(newStyle);
    try {
      localStorage.setItem(STORAGE_KEY, newStyle);
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setStyle(e.newValue as CategoryStyle);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      const current = getStoredStyle();
      setStyle(current);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return { style, updateStyle };
}
