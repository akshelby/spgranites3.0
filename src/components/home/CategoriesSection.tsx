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
  gradient: string;
}

const categories: Category[] = [
  {
    id: 'kitchen-slab',
    name: 'Kitchen Slab',
    icon: Gem,
    link: '/products?category=kitchen-slab',
    description: 'Premium kitchen countertops',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 'vanity-top',
    name: 'Vanity Top',
    icon: Bath,
    link: '/products?category=vanity-top',
    description: 'Elegant bathroom vanities',
    gradient: 'from-sky-500/20 to-cyan-500/20',
  },
  {
    id: 'dining-top',
    name: 'Dining Table Top',
    icon: Utensils,
    link: '/products?category=dining-top',
    description: 'Stunning dining surfaces',
    gradient: 'from-rose-500/20 to-pink-500/20',
  },
  {
    id: 'bhrundhavan',
    name: 'Bhrundhavan',
    icon: BhrundhavanIcon,
    link: '/products?category=bhrundhavan',
    description: 'Traditional tulsi planters',
    gradient: 'from-emerald-500/20 to-green-500/20',
  },
  {
    id: 'tiles-fixing',
    name: 'Tiles Fixing',
    icon: LayoutGrid,
    link: '/services',
    description: 'Professional tile installation',
    gradient: 'from-violet-500/20 to-purple-500/20',
  },
  {
    id: 'contact-us',
    name: 'Contact Us',
    icon: Headset,
    link: '/contact',
    description: 'Get in touch with us',
    gradient: 'from-blue-500/20 to-indigo-500/20',
  },
  {
    id: 'offline-stores',
    name: 'Offline Stores',
    icon: Store,
    link: '/stores',
    description: 'Visit our showrooms',
    gradient: 'from-teal-500/20 to-emerald-500/20',
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
        {/* Header */}
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

        {/* Categories Grid */}
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
