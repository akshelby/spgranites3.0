import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CategoryItem } from './CategoryItem';
import { CategoryItemPill } from './CategoryItemPill';
import { BhrundhavanIcon } from './BhrundhavanIcon';
import { ContactNumbersDialog } from './ContactNumbersDialog';
import { useCategoryStyle } from '@/hooks/useCategoryStyle';
import {
  KitchenSlabIcon,
  VanityTopIcon,
  DiningTopIcon,
  TilesFixingIcon,
  ContactIcon,
  OfflineStoreIcon,
  EstimationIcon,
  CallIcon,
  WhatsAppIcon,
  ChatSupportIcon,
} from './CustomCategoryIcons';
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
  arcColor?: string;
  prominent?: boolean;
  prominentBg?: string;
}

const RED = 'bg-gradient-to-br from-red-500 to-red-700';
const RED_GLOW = 'bg-red-500';

const categories: Category[] = [
  {
    id: 'kitchen-slab',
    nameKey: 'categories.kitchenSlab',
    icon: KitchenSlabIcon,
    link: '/products?category=kitchen-slab',
    descriptionKey: 'categories.kitchenSlabDesc',
    iconColor: 'text-white',
    bgColor: RED,
    borderColor: '',
    glowColor: RED_GLOW,
  },
  {
    id: 'vanity-top',
    nameKey: 'categories.vanityTop',
    icon: VanityTopIcon,
    link: '/products?category=vanity-top',
    descriptionKey: 'categories.vanityTopDesc',
    iconColor: 'text-white',
    bgColor: RED,
    borderColor: '',
    glowColor: RED_GLOW,
  },
  {
    id: 'dining-top',
    nameKey: 'categories.diningTop',
    icon: DiningTopIcon,
    link: '/products?category=dining-top',
    descriptionKey: 'categories.diningTopDesc',
    iconColor: 'text-white',
    bgColor: RED,
    borderColor: '',
    glowColor: RED_GLOW,
  },
  {
    id: 'bhrundhavan',
    nameKey: 'categories.bhrundhavan',
    icon: BhrundhavanIcon,
    link: '/products?category=bhrundhavan',
    descriptionKey: 'categories.bhrundhavanDesc',
    iconColor: 'text-white',
    bgColor: RED,
    borderColor: '',
    glowColor: RED_GLOW,
  },
  {
    id: 'tiles-fixing',
    nameKey: 'categories.tilesFixing',
    icon: TilesFixingIcon,
    link: '/services',
    descriptionKey: 'categories.tilesFixingDesc',
    iconColor: 'text-white',
    bgColor: RED,
    borderColor: '',
    glowColor: RED_GLOW,
  },
  {
    id: 'contact-us',
    nameKey: 'categories.contactUs',
    icon: ContactIcon,
    link: '/contact',
    descriptionKey: 'categories.contactUsDesc',
    iconColor: 'text-white',
    bgColor: RED,
    borderColor: '',
    glowColor: RED_GLOW,
  },
  {
    id: 'offline-stores',
    nameKey: 'categories.offlineStores',
    icon: OfflineStoreIcon,
    link: '/stores',
    descriptionKey: 'categories.offlineStoresDesc',
    iconColor: 'text-white',
    bgColor: RED,
    borderColor: '',
    glowColor: RED_GLOW,
  },
  {
    id: 'free-estimation',
    nameKey: 'categories.freeEstimation',
    icon: EstimationIcon,
    link: '/estimation',
    descriptionKey: 'categories.freeEstimationDesc',
    iconColor: 'text-white',
    bgColor: RED,
    borderColor: '',
    glowColor: RED_GLOW,
  },
  {
    id: 'call-us',
    nameKey: 'categories.callUs',
    icon: CallIcon,
    link: 'tel:+919876543210',
    descriptionKey: 'categories.callUsDesc',
    iconColor: 'text-white',
    bgColor: RED,
    borderColor: '',
    glowColor: RED_GLOW,
  },
  {
    id: 'whatsapp',
    nameKey: 'categories.whatsapp',
    icon: WhatsAppIcon,
    link: 'https://wa.me/919876543210',
    descriptionKey: 'categories.whatsappDesc',
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-[#25D366] to-[#128C7E]',
    borderColor: 'border-transparent',
    glowColor: 'bg-[#25D366]',
    arcColor: '#25D366',
    prominent: true,
    prominentBg: 'bg-gradient-to-br from-[#25D366] to-[#128C7E]',
  },
  {
    id: 'chat-support',
    nameKey: 'categories.chatSupport',
    icon: ChatSupportIcon,
    link: '/chat',
    descriptionKey: 'categories.chatSupportDesc',
    iconColor: 'text-white',
    bgColor: RED,
    borderColor: 'border-transparent',
    glowColor: RED_GLOW,
    prominent: true,
    prominentBg: RED,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

export function CategoriesSection() {
  const { t } = useTranslation();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const { style } = useCategoryStyle();

  const isPill = style === 'pill';

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
          className={isPill
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4'
            : 'grid grid-cols-4 sm:flex sm:flex-wrap sm:justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12'
          }
        >
          {categories.map((category, index) => {
            const commonProps = {
              id: category.id,
              name: t(category.nameKey),
              icon: category.icon,
              link: category.link,
              description: t(category.descriptionKey),
              arcColor: category.arcColor,
              prominent: category.prominent,
              index,
              onClick:
                category.id === 'contact-us' ? () => setContactDialogOpen(true) :
                undefined,
            };

            return isPill ? (
              <CategoryItemPill
                key={category.id}
                {...commonProps}
                prominentBg={category.prominentBg}
              />
            ) : (
              <CategoryItem
                key={category.id}
                {...commonProps}
                iconColor={category.iconColor}
                bgColor={category.bgColor}
                borderColor={category.borderColor}
                glowColor={category.glowColor}
                prominentBg={category.prominentBg}
              />
            );
          })}
        </motion.div>
      </div>

      <ContactNumbersDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </section>
  );
}
