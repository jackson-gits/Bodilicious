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

export type Page = 'home' | 'shop' | 'product' | 'signin' | 'signup' | 'cart' | 'wishlist' | 'account' | 'tracking' | 'order-details' | 'chat' | 'payment' | 'shipping' | 'confirmation';

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
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  shippingDetails: {
    name: string;
    phone: string;
    email?: string;
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
