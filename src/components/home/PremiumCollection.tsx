import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CollectionProduct {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  images: string[];
  is_active: boolean;
}

import blackGraniteImg from '@/assets/products/black-granite.jpg';
import brownGraniteImg from '@/assets/products/brown-granite.jpg';
import greenGraniteImg from '@/assets/products/green-granite.jpg';
import bluePearlImg from '@/assets/products/blue-pearl.jpg';
import redGraniteImg from '@/assets/products/red-granite.jpg';
import greyGraniteImg from '@/assets/products/grey-granite.jpg';

const productImages: Record<string, string> = {
  'black-galaxy-granite': blackGraniteImg,
  'absolute-black-granite': blackGraniteImg,
  'kashmir-white-granite': greyGraniteImg,
  'tan-brown-granite': brownGraniteImg,
  'blue-pearl-granite': bluePearlImg,
  'imperial-red-granite': redGraniteImg,
  'steel-grey-granite': greyGraniteImg,
  'green-galaxy-granite': greenGraniteImg,
};

function getProductImage(product: CollectionProduct): string {
  const slug = product.name?.toLowerCase().replace(/\s+/g, '-') || '';
  if (productImages[slug]) return productImages[slug];
  if (product.images?.[0] && product.images[0] !== '/placeholder.svg') return product.images[0];
  return blackGraniteImg;
}

export function PremiumCollection() {
  const [products, setProducts] = useState<CollectionProduct[]>([]);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startRotation, setStartRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(8);
      if (data && data.length > 0) setProducts(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!autoRotate || isDragging || products.length === 0) return;
    const interval = setInterval(() => {
      setRotation(prev => prev - 0.3);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate, isDragging, products.length]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    setStartX(e.clientX);
    setStartRotation(rotation);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [rotation]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const sensitivity = 0.3;
    setRotation(startRotation + deltaX * sensitivity);
  }, [isDragging, startX, startRotation]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setTimeout(() => setAutoRotate(true), 3000);
  }, []);

  const cardCount = products.length;
  if (cardCount === 0) return null;

  const anglePerCard = 360 / cardCount;
  const radius = cardCount <= 4 ? 220 : cardCount <= 6 ? 280 : 320;

  return (
    <section className="py-16 sm:py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground">
            Premium Collection
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Swipe to rotate
          </p>
        </motion.div>

        <div
          className="relative mx-auto select-none"
          style={{
            height: '420px',
            perspective: '1200px',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          data-testid="premium-collection-carousel"
        >
          <div
            className="absolute left-1/2 top-1/2 w-0 h-0"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateX(-50%) translateY(-50%) rotateY(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.1s linear',
            }}
          >
            {products.map((product, index) => {
              const angle = index * anglePerCard;
              const cardRotation = angle + rotation;
              const normalizedAngle = ((cardRotation % 360) + 360) % 360;
              const isFront = normalizedAngle < 60 || normalizedAngle > 300;

              return (
                <div
                  key={product.id}
                  className="absolute"
                  style={{
                    width: '220px',
                    height: '300px',
                    left: '-110px',
                    top: '-150px',
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <Link
                    to={`/products/${product.slug || product.id}`}
                    className={cn(
                      'block w-full h-full rounded-xl overflow-hidden shadow-lg',
                      'transition-shadow duration-300',
                      isFront ? 'shadow-xl' : 'shadow-md'
                    )}
                    onClick={(e) => { if (isDragging) e.preventDefault(); }}
                    data-testid={`collection-card-${product.id}`}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-base font-semibold leading-tight">
                          {product.name}
                        </h3>
                        {product.price && (
                          <p className="text-white/80 text-sm mt-1">
                            ₹{Number(product.price).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-2">Swipe</p>
      </div>
    </section>
  );
}
