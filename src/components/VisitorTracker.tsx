import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '@/lib/api';

const SESSION_DURATION = 30 * 60 * 1000;

export function VisitorTracker() {
  const location = useLocation();
  const lastTracked = useRef<{ page: string; time: number } | null>(null);

  useEffect(() => {
    const pageUrl = location.pathname;

    if (pageUrl.startsWith('/admin')) return;

    const now = Date.now();
    if (
      lastTracked.current &&
      lastTracked.current.page === pageUrl &&
      now - lastTracked.current.time < SESSION_DURATION
    ) {
      return;
    }

    lastTracked.current = { page: pageUrl, time: now };

    api.post('/api/site-visitors', {
      page_url: pageUrl,
      user_agent: navigator.userAgent,
      visited_at: new Date().toISOString(),
    }).catch(() => {});
  }, [location.pathname]);

  return null;
}
