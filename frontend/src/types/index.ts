export interface Review {
  user: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  pid: string;
  name: string;
  images: string[];
  description: string;
  uses: string[];
  symptomsCured: string[];
  ingredients: string[];
  type: 'skin' | 'hair' | 'other';
  rating: number;
  ratingCount: number;
  reviews: Review[];
  price: number;
  stock: number;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Page = 'home' | 'shop' | 'product' | 'signin' | 'signup' | 'cart' | 'wishlist' | 'account' | 'tracking' | 'chat' | 'payment' | 'shipping';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface TimelineEvent {
  status: string;
  location: string;
  date: string;
  completed: boolean;
}

export interface Order {
  _id: string;
  awb: string | null;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  shippingDetails: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: {
    product: Product;
    quantity: number;
    priceAtPurchase: number;
  }[];
}
