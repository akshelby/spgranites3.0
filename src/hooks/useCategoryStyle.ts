import { useState, useEffect } from 'react';


export type CategoryStyle = 'circle' | 'pill';

const STORAGE_KEY = 'sp_category_style';

export function useCategoryStyle() {
  const [style, setStyle] = useState<CategoryStyle>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as CategoryStyle) || 'pill';
    } catch {
      return 'pill';
    }
  });

  useEffect(() => {
    // localStorage-driven style to avoid dependency on unstable legacy API endpoints
    let cancelled = false;
    if (!cancelled) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) as CategoryStyle | null;
        if (stored === 'circle' || stored === 'pill') {
          setStyle(stored);
        }
      } catch {}
    }
    return () => { cancelled = true; };
  }, []);

  const updateStyle = async (newStyle: CategoryStyle) => {
    setStyle(newStyle);
    try { localStorage.setItem(STORAGE_KEY, newStyle); } catch {}
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: newStyle }));
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
