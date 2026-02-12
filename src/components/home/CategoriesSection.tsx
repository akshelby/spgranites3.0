import { motion } from 'framer-motion';
import { Gem, Bath, Utensils, LayoutGrid, Headset, Store } from 'lucide-react';
import { CategoryItem } from './CategoryItem';
import { BhrundhavanIcon } from './BhrundhavanIcon';
import { ElementType } from 'react';

interface Category {
  id: string;
  name: string;
  icon: ElementType;
  link: string;
  description: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

const categories: Category[] = [
  {
    id: 'kitchen-slab',
    name: 'Kitchen Slab',
    icon: Gem,
    link: '/products?category=kitchen-slab',
    description: 'Premium kitchen countertops',
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  {
    id: 'vanity-top',
    name: 'Vanity Top',
    icon: Bath,
    link: '/products?category=vanity-top',
    description: 'Elegant bathroom vanities',
    iconColor: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-100 dark:bg-sky-900/40',
    borderColor: 'border-sky-200 dark:border-sky-800',
  },
  {
    id: 'dining-top',
    name: 'Dining Table Top',
    icon: Utensils,
    link: '/products?category=dining-top',
    description: 'Stunning dining surfaces',
    iconColor: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/40',
    borderColor: 'border-rose-200 dark:border-rose-800',
  },
  {
    id: 'bhrundhavan',
    name: 'Bhrundhavan',
    icon: BhrundhavanIcon,
    link: '/products?category=bhrundhavan',
    description: 'Traditional tulsi planters',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'tiles-fixing',
    name: 'Tiles Fixing',
    icon: LayoutGrid,
    link: '/services',
    description: 'Professional tile installation',
    iconColor: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/40',
    borderColor: 'border-violet-200 dark:border-violet-800',
  },
  {
    id: 'contact-us',
    name: 'Contact Us',
    icon: Headset,
    link: '/contact',
    description: 'Get in touch with us',
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/40',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'offline-stores',
    name: 'Offline Stores',
    icon: Store,
    link: '/stores',
    description: 'Visit our showrooms',
    iconColor: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/40',
    borderColor: 'border-teal-200 dark:border-teal-800',
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
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">
            Explore Categories
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Premium stone surfaces for every space
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10"
        >
          {categories.map((category, index) => (
            <CategoryItem
              key={category.id}
              {...category}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
