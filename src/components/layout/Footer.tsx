import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
];

export function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { name: t('footer.about'), href: '/about' },
    { name: t('nav.products'), href: '/products' },
    { name: t('nav.services'), href: '/services' },
    { name: t('footer.getEstimation'), href: '/estimation' },
    { name: t('nav.catalogs'), href: '/catalogs' },
    { name: t('testimonials.label'), href: '/testimonials' },
    { name: t('footer.contactInfo'), href: '/contact' },
  ];

  const productLinks = [
    { name: t('footer.graniteCountertops'), href: '/products?category=countertops' },
    { name: t('footer.marbleFlooring'), href: '/products?category=flooring' },
    { name: t('footer.kitchenSlabs'), href: '/products?category=kitchen' },
    { name: t('footer.bathroomVanities'), href: '/products?category=bathroom' },
    { name: t('footer.staircases'), href: '/products?category=staircases' },
  ];

  return (
    <footer className="bg-charcoal text-white">
      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          <div className="space-y-3 sm:space-y-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-premium rounded-lg flex items-center justify-center shadow-lg shadow-red-900/30">
                <span className="text-white font-bold text-sm sm:text-lg" style={{fontFamily: "'Playfair Display', Georgia, serif"}}>SP</span>
              </div>
              <div className="flex flex-col">
                <h3 className="brand-name-white text-lg sm:text-xl leading-none">SP Granites</h3>
                <span className="brand-tagline text-[10px] sm:text-[11px] text-gray-400/70 mt-1">Premium Stone Works</span>
                <span className="brand-divider-white" />
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              {t('footer.companyDesc')}
            </p>
            <div className="flex gap-2 sm:gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm sm:text-lg mb-2 sm:mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-1 sm:space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-xs sm:text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm sm:text-lg mb-2 sm:mb-4">{t('footer.ourProducts')}</h4>
            <ul className="space-y-1 sm:space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-primary transition-colors text-xs sm:text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm sm:text-lg mb-2 sm:mb-4">{t('footer.contactInfo')}</h4>
            <ul className="space-y-2 sm:space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  123 Stone Avenue, Industrial Area,<br />
                  Chennai, Tamil Nadu 600001
                </span>
              </li>
              <li>
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@spgranites.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors text-sm"
                >
                  <Mail className="h-5 w-5 text-primary" />
                  info@spgranites.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          <p className="text-gray-400 text-xs sm:text-sm">
            © {new Date().getFullYear()} SP Granites. {t('footer.copyright')}
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">
              {t('footer.privacyPolicy')}
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
              {t('footer.termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
