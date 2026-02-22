import { useState, useEffect } from 'react';

export type CategoryStyle = 'circle' | 'pill';

const STORAGE_KEY = 'sp_category_style';

export function useCategoryStyle() {
  const [style, setStyle] = useState<CategoryStyle>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as CategoryStyle) || 'pill';
    } catch {
      return 'circle';
    }
  });

  const updateStyle = (newStyle: CategoryStyle) => {
    setStyle(newStyle);
    try {
      localStorage.setItem(STORAGE_KEY, newStyle);
      // Notify other tabs/components
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: newStyle }));
    } catch {}
  };

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setStyle(e.newValue as CategoryStyle);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return { style, updateStyle };
}
