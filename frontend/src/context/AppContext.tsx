import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { CartItem, Product, Page, User, AuthStatus, Order } from '../types';

/* ================================
   Types
================================ */

export interface ShippingDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
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

  isChatOpen: boolean;
  setIsChatOpen: (isOpen: boolean) => void;
  toggleChat: () => void;

  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, n: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;

  getAuthHeaders: () => Promise<HeadersInit>;

  navigateTo: (page: Page, pid?: string) => void;
  setShopFilter: (f: 'all' | 'skin' | 'hair' | 'other') => void;

  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (pid: string) => void;
  updateQuantity: (pid: string, qty: number) => void;

  // Modified checkout function to return razorpayOrder
  checkout: (shippingDetails: ShippingDetails, paymentMethod: string) => Promise<{ order: Order, razorpayOrder: any }>;
  verifyPayment: (razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) => Promise<void>;

  cancelOrder: (orderId: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  toggleWishlist: (product: Product) => void;
  isInWishlist: (pid: string) => boolean;

  cartCount: number;
  cartTotal: number;
}

const AppContext = createContext<AppContextType | null>(null);

const API_BASE = 'http://localhost:5000/api/v1';
const USER_BASE = `${API_BASE}/user`;

/* ================================
   Provider
================================ */

export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductPid, setSelectedProductPid] = useState<string | null>(
    null
  );
  const [shopFilter, setShopFilter] =
    useState<'all' | 'skin' | 'hair' | 'other'>('all');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentlyBought, setRecentlyBought] = useState<Product[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = useCallback(() => setIsChatOpen(prev => !prev), []);

  /* =============================
     Auth headers
  ============================== */
  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };

    if (auth.currentUser) {
      const token = await getIdToken(auth.currentUser);
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }, []);

  /* =============================
     Profile sync
  ============================== */
  const fetchUserProfileAndSync = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(USER_BASE, { headers });

      if (!res.ok) throw new Error('Profile fetch failed');

      const { data } = await res.json();

      setWishlist(data?.wishlist ?? []);
      setCartItems(data?.cart ?? []);

      // Filter out nulls that occur when populated references are physically/soft deleted
      const validOrders = (data?.orders ?? []).filter((o: any) => o !== null);
      setOrders(validOrders);

      setRecentlyBought(data?.recentlyBought ?? []);

      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          phone: data?.phone,
          address: data?.address,
          city: data?.city,
          state: data?.state,
          pincode: data?.pincode,
        };
      });
    } catch (err) {
      console.error('Profile sync failed', err);
    }
  }, [getAuthHeaders]);

  /* =============================
     Firebase auth listener
  ============================== */
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

  /* =============================
     Auth actions
  ============================== */
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    navigateTo('home');
  };

  const signInWithEmail = async (e: string, p: string) => {
    await signInWithEmailAndPassword(auth, e, p);
    navigateTo('home');
  };

  const signUpWithEmail = async (e: string, p: string, n: string) => {
    const cred = await createUserWithEmailAndPassword(auth, e, p);
    await updateProfile(cred.user, { displayName: n });
    navigateTo('home');
  };

  const logout = async () => {
    await signOut(auth);
    navigateTo('home');
  };

  const updateUserProfile = async (updateData: Partial<User>) => {
    if (authStatus !== 'authenticated') return;

    const headers = await getAuthHeaders();
    const res = await fetch(USER_BASE, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updateData)
    });

    if (!res.ok) {
      throw new Error("Failed to update profile");
    }

    const { data } = await res.json();
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  /* =============================
     Products
  ============================== */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/products/all`);
        const json = await res.json();
        setProducts(json?.data ?? []);
      } catch {
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /* =============================
     Navigation
  ============================== */
  useEffect(() => {
    const path = location.pathname.substring(1) || 'home';
    setCurrentPage(path as Page);
  }, [location.pathname]);

  const navigateTo = (page: Page, pid?: string) => {
    setCurrentPage(page);
    setSelectedProductPid(pid ?? null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'home') {
      navigate('/');
    } else {
      navigate(`/${page}`);
    }
  };

  /* =============================
     Cart helpers
  ============================== */
  const syncCartToBackend = async (newCart: CartItem[]) => {
    if (authStatus !== 'authenticated') return;

    const headers = await getAuthHeaders();
    await fetch(`${USER_BASE}/cart`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        cartItems: newCart
          .filter(i => i.product && (i.product as any)._id)
          .map(i => ({
            productId: (i.product as any)._id,
            quantity: i.quantity,
          })),
      }),
    });
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!product) return;

    let nextCart: CartItem[] = [];
    setCartItems(prev => {
      let isMutated = false;
      const newItems = prev.map(i => {
        if (i.product && i.product.pid === product.pid) {
          isMutated = true;
          return { ...i, quantity: (i.quantity ?? 0) + quantity };
        }
        return i;
      });

      if (!isMutated) {
        newItems.push({ product, quantity });
      }

      nextCart = newItems;
      return newItems;
    });

    setTimeout(() => syncCartToBackend(nextCart), 0);
  };

  const removeFromCart = (pid: string) => {
    let nextCart: CartItem[] = [];
    setCartItems(prev => {
      nextCart = prev.filter(i => i.product && i.product.pid !== pid);
      return nextCart;
    });
    setTimeout(() => syncCartToBackend(nextCart), 0);
  };

  const updateQuantity = (pid: string, qty: number) => {
    let nextCart: CartItem[] = [];
    setCartItems(prev => {
      nextCart = prev.map(i =>
        i.product && i.product.pid === pid
          ? { ...i, quantity: qty }
          : i
      );
      return nextCart;
    });
    setTimeout(() => syncCartToBackend(nextCart), 0);
  };

  const checkout = async (shippingDetails: ShippingDetails, paymentMethod: string): Promise<{ order: Order, razorpayOrder: any }> => {
    if (authStatus !== 'authenticated' || cartItems.length === 0) {
      throw new Error("Cannot checkout");
    }

    const headers = await getAuthHeaders();

    // Prepare items for backend
    const items = cartItems
      .filter(i => i.product && (i.product as any)._id)
      .map(i => ({
        productId: (i.product as any)._id,
        quantity: i.quantity,
      }));

    const response = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify({ items, shippingDetails, paymentMethod }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to checkout");
    }

    const json = await response.json();
    const { order, razorpayOrder } = json.data;

    // Clear cart locally and on backend
    setCartItems([]);
    await syncCartToBackend([]);

    // Update local orders
    setOrders(prev => [order, ...prev]);

    return { order, razorpayOrder };
  };

  const verifyPayment = async (razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/payment/verify`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Payment verification failed");
    }

    // Update the local order to show the newly confirmed paid status
    setOrders(prev => prev.map(o => o.razorpayOrderId === razorpay_order_id ? { ...o, paymentStatus: 'paid' } : o));
  };

  const cancelOrder = async (orderId: string) => {
    if (authStatus !== 'authenticated') return;
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers,
    });
    if (!res.ok) throw new Error('Failed to cancel order');

    // Update local order status to cancelled
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o));
  };

  const deleteOrder = async (orderId: string) => {
    if (authStatus !== 'authenticated') return;
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to delete order');

    // Remove from local orders
    setOrders(prev => prev.filter(o => o._id !== orderId));
  };

  /* =============================
     Wishlist
  ============================== */
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

  /* =============================
     Derived values (CRASH FIX)
  ============================== */
  const cartCount = cartItems.reduce(
    (sum, i) => sum + (i.product ? (i.quantity ?? 0) : 0),
    0
  );

  const cartTotal = cartItems.reduce((sum, i) => {
    if (!i.product) return sum;
    return sum + i.product.price * i.quantity;
  }, 0);

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
        updateUserProfile,
        getAuthHeaders,
        navigateTo,
        setShopFilter,
        addToCart,
        removeFromCart,
        updateQuantity,
        checkout,
        cancelOrder,
        deleteOrder,
        toggleWishlist,
        isInWishlist,
        cartCount,
        cartTotal,
        isChatOpen,
        setIsChatOpen,
        toggleChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/* ================================
   Hook
================================ */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}