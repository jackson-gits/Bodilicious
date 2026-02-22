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

export type Page =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'wishlist'
  | 'account'
  | 'signin';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
