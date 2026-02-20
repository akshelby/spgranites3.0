import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChefHat,
  Gem,
  UtensilsCrossed,
  LayoutGrid,
  Headphones,
  Store,
  Calculator,
  PhoneCall,
  MessageCircle,
  MessageSquareHeart,
} from 'lucide-react';
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
  glowColor?: string;
  prominent?: boolean;
  prominentBg?: string;
}

const categories: Category[] = [
  {
    id: 'kitchen-slab',
    nameKey: 'categories.kitchenSlab',
    icon: ChefHat,
    link: '/products?category=kitchen-slab',
    descriptionKey: 'categories.kitchenSlabDesc',
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-red-500 to-red-700',
    borderColor: '',
    glowColor: 'bg-red-500',
  },
  {
    id: 'vanity-top',
    nameKey: 'categories.vanityTop',
    icon: Gem,
    link: '/products?category=vanity-top',
    descriptionKey: 'categories.vanityTopDesc',
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-violet-500 to-purple-700',
    borderColor: '',
    glowColor: 'bg-violet-500',
  },
  {
    id: 'dining-top',
    nameKey: 'categories.diningTop',
    icon: UtensilsCrossed,
    link: '/products?category=dining-top',
    descriptionKey: 'categories.diningTopDesc',
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-red-600 to-rose-800',
    borderColor: '',
    glowColor: 'bg-rose-600',
  },
  {
    id: 'bhrundhavan',
    nameKey: 'categories.bhrundhavan',
    icon: BhrundhavanIcon,
    link: '/products?category=bhrundhavan',
    descriptionKey: 'categories.bhrundhavanDesc',
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-zinc-800 to-zinc-950',
    borderColor: '',
    glowColor: 'bg-zinc-700',
  },
  {
    id: 'tiles-fixing',
    nameKey: 'categories.tilesFixing',
    icon: LayoutGrid,
    link: '/services',
    descriptionKey: 'categories.tilesFixingDesc',
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-violet-600 to-indigo-800',
    borderColor: '',
    glowColor: 'bg-violet-600',
  },
  {
    id: 'contact-us',
    nameKey: 'categories.contactUs',
    icon: Headphones,
    link: '/contact',
    descriptionKey: 'categories.contactUsDesc',
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-red-500 to-red-700',
    borderColor: '',
    glowColor: 'bg-red-500',
  },
  {
    id: 'offline-stores',
    nameKey: 'categories.offlineStores',
    icon: Store,
    link: '/stores',
    descriptionKey: 'categories.offlineStoresDesc',
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-zinc-700 to-zinc-900',
    borderColor: '',
    glowColor: 'bg-zinc-700',
  },
  {
    id: 'free-estimation',
    nameKey: 'categories.freeEstimation',
    icon: Calculator,
    link: '/estimation',
    descriptionKey: 'categories.freeEstimationDesc',
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-purple-500 to-violet-700',
    borderColor: '',
    glowColor: 'bg-purple-500',
  },
  {
    id: 'call-us',
    nameKey: 'categories.callUs',
    icon: PhoneCall,
    link: 'tel:+919876543210',
    descriptionKey: 'categories.callUsDesc',
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-red-500 to-red-700',
    borderColor: '',
    glowColor: 'bg-red-500',
  },
  {
    id: 'whatsapp',
    nameKey: 'categories.whatsapp',
    icon: MessageCircle,
    link: 'https://wa.me/919876543210',
    descriptionKey: 'categories.whatsappDesc',
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-[#25D366] to-[#128C7E]',
    borderColor: 'border-transparent',
    glowColor: 'bg-[#25D366]',
    prominent: true,
    prominentBg: 'bg-gradient-to-br from-[#25D366] to-[#128C7E]',
  },
  {
    id: 'chat-support',
    nameKey: 'categories.chatSupport',
    icon: MessageSquareHeart,
    link: '#chat',
    descriptionKey: 'categories.chatSupportDesc',
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-red-500 to-red-700',
    borderColor: 'border-transparent',
    glowColor: 'bg-red-500',
    prominent: true,
    prominentBg: 'bg-gradient-to-br from-red-500 to-red-700',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
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
          className="grid grid-cols-4 sm:flex sm:flex-wrap sm:justify-center gap-4 sm:gap-5 md:gap-6 lg:gap-8"
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
              glowColor={category.glowColor}
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
