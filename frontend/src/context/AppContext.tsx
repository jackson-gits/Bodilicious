import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  getIdToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { CartItem, Product, Page, User, AuthStatus } from '../types';

export interface Order {
  _id: string;
  items: { product: Product; quantity: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface AppContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;

  currentPage: Page;
  selectedProductPid: string | null;
  shopFilter: 'all' | 'skin' | 'hair' | 'other';

  cartItems: CartItem[];
  wishlist: Product[];
  orders: Order[];
  recentlyBought: Product[];

  user: User | null;
  authStatus: AuthStatus;

  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, n: string) => Promise<void>;
  logout: () => Promise<void>;

  getAuthHeaders: () => Promise<HeadersInit>;

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

const API_BASE = 'http://localhost:5000/api/v1';
const USER_BASE = `${API_BASE}/user`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductPid, setSelectedProductPid] = useState<string | null>(null);
  const [shopFilter, setShopFilter] =
    useState<'all' | 'skin' | 'hair' | 'other'>('all');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentlyBought, setRecentlyBought] = useState<Product[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  // =============================
  // Auth Headers
  // =============================
  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (auth.currentUser) {
      const token = await getIdToken(auth.currentUser);
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }, []);

  // =============================
  // Profile Sync
  // =============================
  const fetchUserProfileAndSync = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(USER_BASE, { headers });

      if (!res.ok) throw new Error('Failed to fetch profile');

      const { data } = await res.json();

      setWishlist(data.wishlist || []);
      setCartItems(data.cart || []);
      setOrders(data.orders || []);
      setRecentlyBought(data.recentlyBought || []);
    } catch (err) {
      console.error('Profile sync failed', err);
    }
  }, [getAuthHeaders]);

  // =============================
  // Firebase Auth Listener
  // =============================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async currUser => {
      if (currUser) {
        setUser({
          uid: currUser.uid,
          email: currUser.email,
          displayName: currUser.displayName,
          photoURL: currUser.photoURL,
        });

        await currUser.getIdToken(true);
        setAuthStatus('authenticated');
        fetchUserProfileAndSync();
      } else {
        setUser(null);
        setWishlist([]);
        setCartItems([]);
        setOrders([]);
        setRecentlyBought([]);
        setAuthStatus('unauthenticated');
      }
    });

    return () => unsub();
  }, [fetchUserProfileAndSync]);

  // =============================
  // Auth Actions
  // =============================
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    navigateTo('home');
  };

  const signInWithEmail = async (e: string, p: string) => {
    await signInWithEmailAndPassword(auth, e, p);
    navigateTo('home');
  };

  const signUpWithEmail = async (e: string, p: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, e, p);
    await updateProfile(cred.user, { displayName: name });
    navigateTo('home');
  };

  const logout = async () => {
    await signOut(auth);
    navigateTo('home');
  };

  // =============================
  // Products
  // =============================
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/products/all`);
        const json = await res.json();
        setProducts(json.data || []);
      } catch {
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // =============================
  // Navigation
  // =============================
  const navigateTo = (page: Page, pid?: string) => {
    setCurrentPage(page);
    setSelectedProductPid(pid ?? null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =============================
  // Cart
  // =============================
  const syncCartToBackend = async (newCart: CartItem[]) => {
    if (authStatus !== 'authenticated') return;

    const headers = await getAuthHeaders();
    await fetch(`${USER_BASE}/cart`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        cartItems: newCart.map(i => ({
          productId: (i.product as any)._id,
          quantity: i.quantity,
        })),
      }),
    });
  };

  const addToCart = (product: Product) => {
    let nextCart: CartItem[] = [];
    setCartItems(prev => {
      nextCart = [...prev];
      const idx = nextCart.findIndex(i => i.product.pid === product.pid);

      if (idx >= 0) nextCart[idx].quantity++;
      else nextCart.push({ product, quantity: 1 });

      return nextCart;
    });
    setTimeout(() => syncCartToBackend(nextCart), 0);
  };

  const removeFromCart = (pid: string) => {
    let nextCart: CartItem[] = [];
    setCartItems(prev => {
      nextCart = prev.filter(i => i.product.pid !== pid);
      return nextCart;
    });
    setTimeout(() => syncCartToBackend(nextCart), 0);
  };

  const updateQuantity = (pid: string, qty: number) => {
    let nextCart: CartItem[] = [];
    setCartItems(prev => {
      nextCart = prev.map(i =>
        i.product.pid === pid ? { ...i, quantity: qty } : i
      );
      return nextCart;
    });
    setTimeout(() => syncCartToBackend(nextCart), 0);
  };

  // =============================
  // Wishlist
  // =============================
  const toggleWishlist = async (product: Product) => {
    const exists = wishlist.some(p => p.pid === product.pid);
    const pWithId = product as Product & { _id?: string };

    setWishlist(prev =>
      exists ? prev.filter(p => p.pid !== product.pid) : [...prev, product]
    );

    if (authStatus === 'authenticated' && pWithId._id) {
      const headers = await getAuthHeaders();

      await fetch(
        exists
          ? `${USER_BASE}/wishlist/${pWithId._id}`
          : `${USER_BASE}/wishlist`,
        {
          method: exists ? 'DELETE' : 'POST',
          headers,
          body: exists ? undefined : JSON.stringify({ productId: pWithId._id }),
        }
      );
    }
  };

  const isInWishlist = (pid: string) =>
    wishlist.some(p => p.pid === pid);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0
  );

  return (
    <AppContext.Provider
      value={{
        products,
        isLoading,
        error,
        currentPage,
        selectedProductPid,
        shopFilter,
        cartItems,
        wishlist,
        orders,
        recentlyBought,
        user,
        authStatus,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        getAuthHeaders,
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