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
    iconColor: 'text-red-600',
    bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
    borderColor: 'border-red-200',
  },
  {
    id: 'vanity-top',
    nameKey: 'categories.vanityTop',
    icon: Bath,
    link: '/products?category=vanity-top',
    descriptionKey: 'categories.vanityTopDesc',
    iconColor: 'text-violet-700',
    bgColor: 'bg-gradient-to-br from-violet-50 to-purple-100',
    borderColor: 'border-violet-200',
  },
  {
    id: 'dining-top',
    nameKey: 'categories.diningTop',
    icon: UtensilsCrossed,
    link: '/products?category=dining-top',
    descriptionKey: 'categories.diningTopDesc',
    iconColor: 'text-red-600',
    bgColor: 'bg-gradient-to-br from-red-50 to-rose-100',
    borderColor: 'border-red-200',
  },
  {
    id: 'bhrundhavan',
    nameKey: 'categories.bhrundhavan',
    icon: BhrundhavanIcon,
    link: '/products?category=bhrundhavan',
    descriptionKey: 'categories.bhrundhavanDesc',
    iconColor: 'text-red-700',
    bgColor: 'bg-gradient-to-br from-zinc-900 to-zinc-800',
    borderColor: 'border-zinc-700',
  },
  {
    id: 'tiles-fixing',
    nameKey: 'categories.tilesFixing',
    icon: Grid3X3,
    link: '/services',
    descriptionKey: 'categories.tilesFixingDesc',
    iconColor: 'text-violet-700',
    bgColor: 'bg-gradient-to-br from-violet-50 to-indigo-100',
    borderColor: 'border-violet-200',
  },
  {
    id: 'contact-us',
    nameKey: 'categories.contactUs',
    icon: HeadphonesIcon,
    link: '/contact',
    descriptionKey: 'categories.contactUsDesc',
    iconColor: 'text-red-600',
    bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
    borderColor: 'border-red-200',
  },
  {
    id: 'offline-stores',
    nameKey: 'categories.offlineStores',
    icon: MapPin,
    link: '/stores',
    descriptionKey: 'categories.offlineStoresDesc',
    iconColor: 'text-zinc-100',
    bgColor: 'bg-gradient-to-br from-zinc-800 to-zinc-900',
    borderColor: 'border-zinc-700',
  },
  {
    id: 'free-estimation',
    nameKey: 'categories.freeEstimation',
    icon: ClipboardList,
    link: '/estimation',
    descriptionKey: 'categories.freeEstimationDesc',
    iconColor: 'text-violet-700',
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-100',
    borderColor: 'border-purple-200',
  },
  {
    id: 'call-us',
    nameKey: 'categories.callUs',
    icon: PhoneCall,
    link: 'tel:+919876543210',
    descriptionKey: 'categories.callUsDesc',
    iconColor: 'text-red-600',
    bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
    borderColor: 'border-red-200',
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
    <section className="py-8 sm:py-10 md:py-14 bg-background" data-testid="categories-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-3 sm:mb-6 md:mb-8"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground leading-tight" data-testid="text-categories-title">
            {t('categories.title')}
          </h2>
          <p className="mt-1 text-[11px] sm:text-xs md:text-sm text-muted-foreground">
            {t('categories.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-4 sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7"
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
