import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { productImageMap, resolveProductImage, defaultProductImage } from '@/lib/productImages';

interface CollectionProduct {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  images: string[];
  is_active: boolean;
}

const fallbackProducts: CollectionProduct[] = [
  { id: 'fb-1', name: 'Black Galaxy Granite', slug: 'black-galaxy-granite', price: 4500, images: [productImageMap['black-galaxy-granite'] || defaultProductImage], is_active: true },
  { id: 'fb-2', name: 'Absolute Black Granite', slug: 'absolute-black-granite', price: 3800, images: [productImageMap['absolute-black-granite'] || defaultProductImage], is_active: true },
  { id: 'fb-3', name: 'Tan Brown Granite', slug: 'tan-brown-granite', price: 2800, images: [productImageMap['tan-brown-granite'] || defaultProductImage], is_active: true },
  { id: 'fb-4', name: 'Blue Pearl Granite', slug: 'blue-pearl-granite', price: 5200, images: [productImageMap['blue-pearl-granite'] || defaultProductImage], is_active: true },
  { id: 'fb-5', name: 'Green Galaxy Granite', slug: 'green-galaxy-granite', price: 3500, images: [productImageMap['green-galaxy-granite'] || defaultProductImage], is_active: true },
  { id: 'fb-6', name: 'Imperial Red Granite', slug: 'imperial-red-granite', price: 4000, images: [productImageMap['imperial-red-granite'] || defaultProductImage], is_active: true },
  { id: 'fb-7', name: 'Kashmir White Granite', slug: 'kashmir-white-granite', price: 3200, images: [productImageMap['kashmir-white-granite'] || defaultProductImage], is_active: true },
  { id: 'fb-8', name: 'Steel Grey Granite', slug: 'steel-grey-granite', price: 2900, images: [productImageMap['steel-grey-granite'] || defaultProductImage], is_active: true },
  { id: 'fb-9', name: 'Red Granite', slug: 'red-granite', price: 3600, images: [productImageMap['red-granite'] || defaultProductImage], is_active: true },
  { id: 'fb-10', name: 'Brown Pearl Granite', slug: 'brown-pearl-granite', price: 3100, images: [productImageMap['brown-pearl-granite'] || defaultProductImage], is_active: true },
  { id: 'fb-11', name: 'Blue Galaxy Granite', slug: 'blue-galaxy-granite', price: 4800, images: [productImageMap['blue-galaxy-granite'] || defaultProductImage], is_active: true },
  { id: 'fb-12', name: 'Forest Green Granite', slug: 'forest-green-granite', price: 3400, images: [productImageMap['forest-green-granite'] || defaultProductImage], is_active: true },
];

export function PremiumCollection() {
  const [products, setProducts] = useState<CollectionProduct[]>(fallbackProducts);
  const containerRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const autoRotateRef = useRef(true);
  const isDraggingRef = useRef(false);
  const velocityRef = useRef(0);
  const lastMoveRef = useRef({ x: 0, time: 0 });
  const startXRef = useRef(0);
  const startRotRef = useRef(0);
  const pointerStartY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const momentumFrameRef = useRef<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const radiusRef = useRef(0);
  const speedRef = useRef(parseFloat(localStorage.getItem('spg_collection_speed') || '0.2'));

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchProducts = async (attempt = 0) => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (cancelled || error) return;
        const allProducts = (Array.isArray(data) ? data : []).filter((p: any) => p.is_active);
        if (allProducts.length >= 6) {
          const withLocalImages = allProducts.map((p: any) => {
            const slug = p.name?.toLowerCase().replace(/\s+/g, '-') || '';
            if (productImageMap[slug]) {
              return { ...p, images: [productImageMap[slug]] };
            }
            return p;
          });
          setProducts(withLocalImages.slice(0, 12));
        } else {
          setProducts(fallbackProducts);
        }
      } catch (err: any) {
        if (!cancelled && attempt < 2 && (err?.message?.includes('bort') || err?.message?.includes('Abort'))) {
          setTimeout(() => fetchProducts(attempt + 1), 500 * (attempt + 1));
          return;
        }
        if (!cancelled) setProducts(fallbackProducts);
      }
    };
    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      speedRef.current = (e as CustomEvent).detail;
    };
    window.addEventListener('spg_collection_speed_change', handler);
    return () => window.removeEventListener('spg_collection_speed_change', handler);
  }, []);

  const applyRotation = useCallback(() => {
    if (!spinnerRef.current) return;
    spinnerRef.current.style.transform = `translateX(-50%) translateY(-50%)`;

    const cardCount = products.length;
    if (cardCount === 0) return;
    const anglePerCard = 360 / cardCount;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const orbitAngle = index * anglePerCard + rotationRef.current;
      card.style.transform = `rotateY(${orbitAngle}deg) translateZ(${radiusRef.current}px) rotateY(${-orbitAngle}deg)`;
    });
  }, [products.length]);

  useEffect(() => {
    let lastTime = performance.now();
    const tick = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      if (autoRotateRef.current && !isDraggingRef.current && products.length > 0) {
        rotationRef.current -= speedRef.current * (dt / 16);
        applyRotation();
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [products.length, applyRotation]);

  const stopMomentum = useCallback(() => {
    if (momentumFrameRef.current) {
      cancelAnimationFrame(momentumFrameRef.current);
      momentumFrameRef.current = null;
    }
  }, []);

  const startMomentum = useCallback(() => {
    stopMomentum();
    let v = velocityRef.current;
    const friction = 0.95;
    const tick = () => {
      v *= friction;
      if (Math.abs(v) < 0.05) {
        setTimeout(() => { autoRotateRef.current = true; }, 2000);
        return;
      }
      rotationRef.current += v;
      applyRotation();
      momentumFrameRef.current = requestAnimationFrame(tick);
    };
    momentumFrameRef.current = requestAnimationFrame(tick);
  }, [stopMomentum, applyRotation]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    stopMomentum();
    autoRotateRef.current = false;
    startXRef.current = e.clientX;
    startRotRef.current = rotationRef.current;
    velocityRef.current = 0;
    lastMoveRef.current = { x: e.clientX, time: performance.now() };
    pointerStartY.current = e.clientY;
    isHorizontalSwipe.current = null;
  }, [stopMomentum]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isHorizontalSwipe.current === false) return;

    const dx = Math.abs(e.clientX - startXRef.current);
    const dy = Math.abs(e.clientY - pointerStartY.current);

    if (isHorizontalSwipe.current === null) {
      if (dx + dy < 8) return;
      if (dx > dy) {
        isHorizontalSwipe.current = true;
        isDraggingRef.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      } else {
        isHorizontalSwipe.current = false;
        return;
      }
    }

    e.preventDefault();
    const now = performance.now();
    const deltaX = e.clientX - startXRef.current;
    const sensitivity = 0.4;
    rotationRef.current = startRotRef.current + deltaX * sensitivity;
    applyRotation();

    const dt = now - lastMoveRef.current.time;
    if (dt > 0) {
      velocityRef.current = ((e.clientX - lastMoveRef.current.x) * sensitivity) / Math.max(dt / 16, 1);
    }
    lastMoveRef.current = { x: e.clientX, time: now };
  }, [applyRotation]);

  const handlePointerUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      startMomentum();
    } else {
      setTimeout(() => { autoRotateRef.current = true; }, 2000);
    }
    isHorizontalSwipe.current = null;
  }, [startMomentum]);

  const cardCount = products.length;
  if (cardCount === 0) return null;

  const anglePerCard = 360 / cardCount;
  const isLargeDesktop = !isMobile && typeof window !== 'undefined' && window.innerWidth >= 1280;
  const isTablet = !isMobile && typeof window !== 'undefined' && window.innerWidth >= 640 && window.innerWidth < 1280;
  const cardW = isMobile ? 90 : isLargeDesktop ? 226 : isTablet ? 189 : 136;
  const cardH = isMobile ? 128 : isLargeDesktop ? 255 : isTablet ? 213 : 196;
  const containerH = isMobile ? 170 : isLargeDesktop ? 300 : isTablet ? 260 : 247;
  const halfCard = cardW / 2;
  const gap = isMobile ? 4 : isLargeDesktop ? 6 : isTablet ? 5 : 5;
  const minRadius = Math.ceil((halfCard + gap) / Math.sin(Math.PI / cardCount));
  const radius = Math.max(minRadius, isMobile ? 100 : isLargeDesktop ? 320 : isTablet ? 260 : 160);
  radiusRef.current = radius;

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-3 sm:mb-5"
        >
          <h2 className="text-lg sm:text-2xl md:text-3xl font-display font-bold text-red-600">
            Premium Collection
          </h2>
          <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-muted-foreground">
            Swipe to rotate
          </p>
        </motion.div>

        <div
          ref={containerRef}
          className="relative mx-auto select-none"
          style={{
            height: `${containerH}px`,
            perspective: isMobile ? '800px' : isLargeDesktop ? '1800px' : isTablet ? '1400px' : '1200px',
            cursor: 'grab',
            touchAction: 'pan-y',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          data-testid="premium-collection-carousel"
        >
          <div
            ref={spinnerRef}
            className="absolute left-1/2 top-1/2 w-0 h-0"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateX(-50%) translateY(-50%) rotateY(0deg)`,
              willChange: 'transform',
            }}
          >
            {products.map((product, index) => {
              const angle = index * anglePerCard;

              return (
                <div
                  key={product.id}
                  ref={(el) => { cardRefs.current[index] = el; }}
                  className="absolute"
                  style={{
                    width: `${cardW}px`,
                    height: `${cardH}px`,
                    left: `${-cardW / 2}px`,
                    top: `${-cardH / 2}px`,
                    transform: `rotateY(${angle}deg) translateZ(${radius}px) rotateY(${-angle}deg)`,
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    opacity: 1,
                  }}
                >
                  <Link
                    to={`/products/${product.slug || product.id}`}
                    className={cn(
                      'block w-full h-full rounded-xl overflow-hidden shadow-xl',
                    )}
                    style={{
                      backfaceVisibility: 'visible',
                      WebkitBackfaceVisibility: 'visible',
                    }}
                    onClick={(e) => { if (isDraggingRef.current) e.preventDefault(); }}
                    data-testid={`collection-card-${product.id}`}
                  >
                    <div className="relative w-full h-full bg-card">
                      <img
                        src={resolveProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        draggable={false}
                        loading="eager"
                        fetchPriority="high"
                        onError={(e) => { (e.target as HTMLImageElement).src = defaultProductImage; }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 sm:px-3 sm:py-2 bg-gradient-to-t from-black/70 to-transparent">
                        <h3 className="text-white text-xs sm:text-base font-semibold leading-tight">
                          {product.name}
                        </h3>
                        {product.price && (
                          <p className="text-white/90 text-[10px] sm:text-sm mt-0.5 sm:mt-1">
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
