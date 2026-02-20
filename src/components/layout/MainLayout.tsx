import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingActionButton } from './FloatingActionButton';
import { MiniCart } from '@/components/cart/MiniCart';
import { TabBar } from './TabBar';
import { AIChatPanel } from '@/components/ai/AIChatPanel';

interface MainLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function MainLayout({ children, hideFooter = false }: MainLayoutProps) {
  const { pathname } = useLocation();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-16 lg:pt-20">
        <div className="sticky top-16 lg:top-20 z-40 lg:hidden">
          <TabBar />
        </div>
      </div>
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
      <AIChatPanel isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
      <FloatingActionButton isAIChatOpen={isAIChatOpen} onToggle={() => setIsAIChatOpen(prev => !prev)} />
      <MiniCart />
    </div>
  );
}
