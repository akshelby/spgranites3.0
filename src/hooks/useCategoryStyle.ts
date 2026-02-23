import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

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
    let cancelled = false;
    const fetchStyle = async () => {
      try {
        const data = await api.get('/api/hero-carousel/settings');
        if (!cancelled && data?.category_style) {
          const dbStyle = data.category_style as CategoryStyle;
          setStyle(dbStyle);
          try { localStorage.setItem(STORAGE_KEY, dbStyle); } catch {}
        }
      } catch {}
    };
    fetchStyle();
    return () => { cancelled = true; };
  }, []);

  const updateStyle = async (newStyle: CategoryStyle) => {
    setStyle(newStyle);
    try { localStorage.setItem(STORAGE_KEY, newStyle); } catch {}
    try {
      await api.put('/api/admin/carousel/settings', { category_style: newStyle });
    } catch {}
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
