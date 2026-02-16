import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bath, UtensilsCrossed, Grid3X3, HeadphonesIcon, MapPin, ClipboardList, PhoneCall, MessageCircleHeart, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CategoryItem } from './CategoryItem';
import { BhrundhavanIcon } from './BhrundhavanIcon';
import { ContactNumbersDialog } from './ContactNumbersDialog';
import { ElementType } from 'react';

interface Category {
  id: string;
  nameKey: string;
  icon: ElementType;
  link: string;
  descriptionKey: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  prominent?: boolean;
  prominentBg?: string;
}

const categories: Category[] = [
  {
    id: 'kitchen-slab',
    nameKey: 'categories.kitchenSlab',
    icon: Sparkles,
    link: '/products?category=kitchen-slab',
    descriptionKey: 'categories.kitchenSlabDesc',
    iconColor: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'vanity-top',
    nameKey: 'categories.vanityTop',
    icon: Bath,
    link: '/products?category=vanity-top',
    descriptionKey: 'categories.vanityTopDesc',
    iconColor: 'text-slate-700 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-900/30',
    borderColor: 'border-slate-200 dark:border-slate-800',
  },
  {
    id: 'dining-top',
    nameKey: 'categories.diningTop',
    icon: UtensilsCrossed,
    link: '/products?category=dining-top',
    descriptionKey: 'categories.diningTopDesc',
    iconColor: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  {
    id: 'bhrundhavan',
    nameKey: 'categories.bhrundhavan',
    icon: BhrundhavanIcon,
    link: '/products?category=bhrundhavan',
    descriptionKey: 'categories.bhrundhavanDesc',
    iconColor: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  {
    id: 'tiles-fixing',
    nameKey: 'categories.tilesFixing',
    icon: Grid3X3,
    link: '/services',
    descriptionKey: 'categories.tilesFixingDesc',
    iconColor: 'text-zinc-700 dark:text-zinc-400',
    bgColor: 'bg-zinc-50 dark:bg-zinc-900/30',
    borderColor: 'border-zinc-200 dark:border-zinc-800',
  },
  {
    id: 'contact-us',
    nameKey: 'categories.contactUs',
    icon: HeadphonesIcon,
    link: '/contact',
    descriptionKey: 'categories.contactUsDesc',
    iconColor: 'text-teal-700 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/30',
    borderColor: 'border-teal-200 dark:border-teal-800',
  },
  {
    id: 'offline-stores',
    nameKey: 'categories.offlineStores',
    icon: MapPin,
    link: '/stores',
    descriptionKey: 'categories.offlineStoresDesc',
    iconColor: 'text-neutral-700 dark:text-neutral-400',
    bgColor: 'bg-neutral-50 dark:bg-neutral-900/30',
    borderColor: 'border-neutral-200 dark:border-neutral-800',
  },
  {
    id: 'free-estimation',
    nameKey: 'categories.freeEstimation',
    icon: ClipboardList,
    link: '/estimation',
    descriptionKey: 'categories.freeEstimationDesc',
    iconColor: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  {
    id: 'call-us',
    nameKey: 'categories.callUs',
    icon: PhoneCall,
    link: 'tel:+919876543210',
    descriptionKey: 'categories.callUsDesc',
    iconColor: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'whatsapp',
    nameKey: 'categories.whatsapp',
    icon: Send,
    link: 'https://wa.me/919876543210',
    descriptionKey: 'categories.whatsappDesc',
    iconColor: 'text-white',
    bgColor: 'bg-[#25D366]',
    borderColor: 'border-transparent',
    prominent: true,
    prominentBg: 'bg-[#25D366]',
  },
  {
    id: 'chat-support',
    nameKey: 'categories.chatSupport',
    icon: MessageCircleHeart,
    link: '#chat',
    descriptionKey: 'categories.chatSupportDesc',
    iconColor: 'text-white',
    bgColor: 'bg-[#E60000]',
    borderColor: 'border-transparent',
    prominent: true,
    prominentBg: 'bg-[#E60000]',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export function CategoriesSection() {
  const { t } = useTranslation();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const openChatWidget = () => {
    window.dispatchEvent(new CustomEvent('open-chat-widget'));
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-background" data-testid="categories-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4 sm:mb-8 md:mb-12"
        >
          <h2 className="text-xl sm:text-3xl md:text-4xl font-display font-bold text-foreground" data-testid="text-categories-title">
            {t('categories.title')}
          </h2>
          <p className="mt-1 text-xs sm:text-sm md:text-base text-muted-foreground">
            {t('categories.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-4 sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-6 md:gap-8 lg:gap-8 xl:gap-10"
        >
          {categories.map((category, index) => (
            <CategoryItem
              key={category.id}
              id={category.id}
              name={t(category.nameKey)}
              icon={category.icon}
              link={category.link}
              description={t(category.descriptionKey)}
              iconColor={category.iconColor}
              bgColor={category.bgColor}
              borderColor={category.borderColor}
              prominent={category.prominent}
              prominentBg={category.prominentBg}
              index={index}
              onClick={
                category.id === 'contact-us' ? () => setContactDialogOpen(true) :
                category.id === 'chat-support' ? openChatWidget :
                undefined
              }
            />
          ))}
        </motion.div>
      </div>

      <ContactNumbersDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </section>
  );
}
