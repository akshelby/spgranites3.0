import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, Heart, User, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { useTabs } from '@/contexts/TabContext';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', label: 'English', short: 'ENG' },
  { code: 'hi', label: 'हिन्दी', short: 'हिन्दी' },
  { code: 'kn', label: 'ಕನ್ನಡ', short: 'ಕನ್ನಡ' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const { user, role, signOut } = useAuth();
  const { getCartCount, setMiniCartOpen } = useCart();
  const { addTab } = useTabs();
  const { t, i18n } = useTranslation();

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.products'), href: '/products' },
    { name: t('nav.services'), href: '/services' },
    { name: t('nav.estimation'), href: '/estimation' },
    { name: t('nav.catalogs'), href: '/catalogs' },
    { name: t('footer.about'), href: '/about' },
    { name: t('nav.contact'), href: '/contact' },
    { name: t('nav.visualizer'), href: '/visualizer' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  const cartCount = getCartCount();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/90 backdrop-blur-xl shadow-soft border-b border-border/40'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/images/sp-logo.png" alt="SP Granites" className="w-20 h-20 object-contain transition-transform group-hover:scale-105 dark:hidden" />
            <img src="/images/sp-logo-dark.png" alt="SP Granites" className="w-20 h-20 object-contain transition-transform group-hover:scale-105 hidden dark:block" />
          </Link>

          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto max-w-[calc(100%-360px)] scrollbar-hide rounded-xl px-3 py-1.5 bg-muted/40 mr-2 border-2 border-red-500">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                  e.preventDefault();
                  addTab(link.href, link.name);
                }}
                className={cn(
                  'px-4 py-2.5 text-base font-medium rounded-lg whitespace-nowrap shrink-0 text-center min-w-[80px]',
                  location.pathname === link.href
                    ? 'text-white bg-primary shadow-sm'
                    : 'text-foreground hover-slide border border-transparent'
                )}
                data-testid={`nav-${link.href.replace('/', '') || 'home'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 px-2 min-w-[60px]" data-testid="button-language-switcher">
                  <span className="text-xs font-semibold">{languages.find(l => l.code === i18n.language)?.short || 'ENG'}</span>
                  <svg className="h-3 w-3 opacity-60" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {languages.filter((lang) => lang.code !== i18n.language).map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="flex items-center justify-between gap-2"
                    data-testid={`button-lang-${lang.code}`}
                  >
                    <span>{lang.label}</span>
                    <span className="text-xs font-mono text-muted-foreground">{lang.short}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="flex"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user && (
              <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
                <Link to="/wishlist">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMiniCartOpen(true)}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">{t('nav.myProfile')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">{t('nav.myOrders')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist">{t('nav.wishlist')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-reviews">{t('nav.myReviews')}</Link>
                  </DropdownMenuItem>
                  {role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="text-primary">
                          {t('nav.adminDashboard')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>{t('nav.signOut')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="h-auto py-1.5 px-3 hover-slide border border-transparent">
                <Link to="/auth" className="text-xs whitespace-nowrap">
                  Sign In
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                    e.preventDefault();
                    addTab(link.href, link.name);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === link.href
                      ? 'text-white bg-primary shadow-sm'
                      : 'text-foreground hover:text-primary hover:bg-accent'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={toggleTheme}>
                  {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {isDark ? t('nav.lightMode') : t('nav.darkMode')}
                </Button>
                <div className="flex items-center gap-1">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={i18n.language === lang.code ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeLanguage(lang.code)}
                      data-testid={`button-mobile-lang-${lang.code}`}
                    >
                      {lang.short}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
