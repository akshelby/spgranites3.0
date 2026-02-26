import blackGraniteImg from '@/assets/products/black-granite.webp';
import absoluteBlackImg from '@/assets/products/absolute-black-granite.webp';
import brownGraniteImg from '@/assets/products/brown-granite.webp';
import greenGraniteImg from '@/assets/products/green-granite.webp';
import bluePearlImg from '@/assets/products/blue-pearl.webp';
import redGraniteImg from '@/assets/products/red-granite.webp';
import greyGraniteImg from '@/assets/products/grey-granite.webp';
import kashmirWhiteImg from '@/assets/products/kashmir-white-granite.webp';
import steelGreyImg from '@/assets/products/steel-grey-granite.webp';
import imperialRedImg from '@/assets/products/imperial-red-granite.webp';
import greenGalaxyImg from '@/assets/products/green-galaxy-granite.webp';
import brownPearlImg from '@/assets/products/brown-pearl-granite.webp';
import blueGalaxyImg from '@/assets/products/blue-galaxy-granite.webp';
import forestGreenImg from '@/assets/products/forest-green-granite.webp';

export const productImageMap: Record<string, string> = {
  'black-galaxy-granite': blackGraniteImg,
  'absolute-black-granite': absoluteBlackImg,
  'kashmir-white-granite': kashmirWhiteImg,
  'tan-brown-granite': brownGraniteImg,
  'blue-pearl-granite': bluePearlImg,
  'imperial-red-granite': imperialRedImg,
  'steel-grey-granite': steelGreyImg,
  'green-galaxy-granite': greenGalaxyImg,
  'red-granite': redGraniteImg,
  'brown-pearl-granite': brownPearlImg,
  'blue-galaxy-granite': blueGalaxyImg,
  'forest-green-granite': forestGreenImg,
  'green-granite': greenGraniteImg,
  'grey-granite': greyGraniteImg,
};

export const defaultProductImage = blackGraniteImg;

export function resolveProductImage(product: { name?: string; slug?: string; images?: string[] }): string {
  const nameSlug = product.name?.toLowerCase().replace(/\s+/g, '-') || '';
  if (productImageMap[nameSlug]) return productImageMap[nameSlug];

  const slug = product.slug || '';
  if (productImageMap[slug]) return productImageMap[slug];

  if (product.images?.[0] && !product.images[0].includes('unsplash') && product.images[0] !== '/placeholder.svg') {
    return product.images[0];
  }

  return defaultProductImage;
}
