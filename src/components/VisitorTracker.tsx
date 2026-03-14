import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const SESSION_KEY = 'spg_visit_session';
const SESSION_DURATION = 30 * 60 * 1000;
const PAGE_COOLDOWN = 5 * 60 * 1000;

function getSession(): Record<string, number> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setSession(data: Record<string, number>) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {}
}

export function VisitorTracker() {
  const location = useLocation();
  const pendingRef = useRef(false);

  useEffect(() => {
    const pageUrl = location.pathname;

    if (pageUrl.startsWith('/admin')) return;
    if (pendingRef.current) return;

    const now = Date.now();
    const session = getSession();
    const lastTime = session[pageUrl] || 0;

    if (now - lastTime < PAGE_COOLDOWN) return;

    const sessionStart = session['__start'] || 0;
    if (sessionStart && now - sessionStart < SESSION_DURATION) {
      if (Object.keys(session).filter(k => k !== '__start').length > 0 && pageUrl === '/') return;
    }

    session[pageUrl] = now;
    if (!session['__start']) session['__start'] = now;
    setSession(session);

    pendingRef.current = true;

    void (async () => {
      try {
        await supabase.from('site_visitors').insert({
          page_url: pageUrl,
          user_agent: navigator.userAgent,
          visited_at: new Date().toISOString(),
        });
      } catch {}
      pendingRef.current = false;
    })();
  }, [location.pathname]);

  return null;
}
