import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, Page } from '../types';

interface AppContextType {
  currentPage: Page;
  selectedProductPid: string | null;
  shopFilter: 'all' | 'skin' | 'hair' | 'other';
  cartItems: CartItem[];
  wishlist: Product[];
  navigateTo: (page: Page, pid?: string) => void;
  setShopFilter: (f: 'all' | 'skin' | 'hair' | 'other') => void;
  addToCart: (product: Product) => void;
  removeFromCart: (pid: string) => void;
  updateQuantity: (pid: string, qty: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (pid: string) => boolean;
  cartCount: number;
  cartTotal: number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductPid, setSelectedProductPid] = useState<string | null>(null);
  const [shopFilter, setShopFilter] = useState<'all' | 'skin' | 'hair' | 'other'>('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const navigateTo = (page: Page, pid?: string) => {
    setCurrentPage(page);
    if (pid) setSelectedProductPid(pid);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.pid === product.pid);
      if (existing) {
        return prev.map(i =>
          i.product.pid === product.pid
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (pid: string) => {
    setCartItems(prev => prev.filter(i => i.product.pid !== pid));
  };

  const updateQuantity = (pid: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(pid);
      return;
    }
    setCartItems(prev =>
      prev.map(i =>
        i.product.pid === pid
          ? { ...i, quantity: Math.min(qty, i.product.stock) }
          : i
      )
    );
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev =>
      prev.find(p => p.pid === product.pid)
        ? prev.filter(p => p.pid !== product.pid)
        : [...prev, product]
    );
  };

  const isInWishlist = (pid: string) => wishlist.some(p => p.pid === pid);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        selectedProductPid,
        shopFilter,
        cartItems,
        wishlist,
        navigateTo,
        setShopFilter,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isInWishlist,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
