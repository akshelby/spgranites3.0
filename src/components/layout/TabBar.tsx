import { useRef, useEffect } from 'react';
import { X, Plus, Home, ShoppingBag, Wrench, Gem, FileText, BookOpen, Phone, LayoutDashboard, Eye } from 'lucide-react';
import { useTabs } from '@/contexts/TabContext';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, typeof Home> = {
  '/': Home,
  '/products': ShoppingBag,
  '/services': Wrench,
  '/visualizer': Gem,
  '/estimation': FileText,
  '/catalogs': BookOpen,
  '/contact': Phone,
  '/admin': LayoutDashboard,
};

function getTabIcon(path: string) {
  const basePath = '/' + path.split('/').filter(Boolean)[0];
  return ICON_MAP[path] || ICON_MAP[basePath] || Eye;
}

export function TabBar() {
  const { tabs, activeTabId, switchTab, removeTab, addTab } = useTabs();
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeTabId]);

  return (
    <div className="bg-muted/50 border-b border-border flex items-center" data-testid="tab-bar">
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-end overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const Icon = getTabIcon(tab.path);

          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : undefined}
              onClick={() => switchTab(tab.id)}
              className={cn(
                'group relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium',
                'min-w-[100px] max-w-[180px] shrink-0 transition-colors duration-150',
                'border-r border-border/50',
                isActive
                  ? 'bg-background text-foreground border-b-2 border-b-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
              data-testid={`tab-${tab.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.title}</span>
              {tabs.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTab(tab.id);
                  }}
                  className={cn(
                    'ml-auto shrink-0 rounded-sm p-0.5 transition-all',
                    isActive
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      : 'invisible group-hover:visible text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  data-testid={`tab-close-${tab.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => addTab('/', 'Home')}
        className="shrink-0 p-2 text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors border-l border-border/50"
        data-testid="button-add-tab"
        title="New tab"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
