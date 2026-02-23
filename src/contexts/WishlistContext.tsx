import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface WishlistItem {
  id: string;
  productId: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch wishlist when user changes
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await api.get('/api/wishlist');
      setItems(
        (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id,
          productId: item.product_id || item.productId,
        }))
      );
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const data = await api.post('/api/wishlist', { product_id: productId });
      if (data) {
        setItems((prev) => [
          ...prev,
          { id: data.id, productId: data.product_id || productId },
        ]);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      await api.delete(`/api/wishlist/${productId}`);
      setItems((prev) => prev.filter((item) => item.productId !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
