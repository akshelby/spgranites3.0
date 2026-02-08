import { motion } from 'framer-motion';
import { ChefHat, Bath, UtensilsCrossed, Grid3X3, Phone, MapPin } from 'lucide-react';
import { CategoryItem } from './CategoryItem';
import { BhrundhavanIcon } from './BhrundhavanIcon';
import { ElementType } from 'react';

interface Category {
  id: string;
  name: string;
  icon: ElementType;
  link: string;
  description: string;
}

const categories: Category[] = [
  {
    id: 'kitchen-slab',
    name: 'Kitchen Slab',
    icon: ChefHat,
    link: '/products?category=kitchen-slab',
    description: 'Premium kitchen countertops',
  },
  {
    id: 'vanity-top',
    name: 'Vanity Top',
    icon: Bath,
    link: '/products?category=vanity-top',
    description: 'Elegant bathroom vanities',
  },
  {
    id: 'dining-top',
    name: 'Dining Table Top',
    icon: UtensilsCrossed,
    link: '/products?category=dining-top',
    description: 'Stunning dining surfaces',
  },
  {
    id: 'bhrundhavan',
    name: 'Bhrundhavan',
    icon: BhrundhavanIcon,
    link: '/products?category=bhrundhavan',
    description: 'Traditional tulsi planters',
  },
  {
    id: 'tiles-fixing',
    name: 'Tiles Fixing',
    icon: Grid3X3,
    link: '/services',
    description: 'Professional tile installation',
  },
  {
    id: 'contact-us',
    name: 'Contact Us',
    icon: Phone,
    link: '/contact',
    description: 'Get in touch with us',
  },
  {
    id: 'offline-stores',
    name: 'Offline Stores',
    icon: MapPin,
    link: '/stores',
    description: 'Visit our showrooms',
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
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 sm:gap-6 md:gap-8 justify-items-center"
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
