import blackGraniteImg from '@/assets/products/black-granite.jpg';
import absoluteBlackImg from '@/assets/products/absolute-black-granite.jpg';
import brownGraniteImg from '@/assets/products/brown-granite.jpg';
import greenGraniteImg from '@/assets/products/green-granite.jpg';
import bluePearlImg from '@/assets/products/blue-pearl.jpg';
import redGraniteImg from '@/assets/products/red-granite.jpg';
import greyGraniteImg from '@/assets/products/grey-granite.jpg';
import kashmirWhiteImg from '@/assets/products/kashmir-white-granite.jpg';
import steelGreyImg from '@/assets/products/steel-grey-granite.jpg';
import imperialRedImg from '@/assets/products/imperial-red-granite.jpg';
import greenGalaxyImg from '@/assets/products/green-galaxy-granite.jpg';
import brownPearlImg from '@/assets/products/brown-pearl-granite.jpg';
import blueGalaxyImg from '@/assets/products/blue-galaxy-granite.jpg';
import forestGreenImg from '@/assets/products/forest-green-granite.jpg';

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
