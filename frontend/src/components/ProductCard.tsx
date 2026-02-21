import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import StarRating from './StarRating';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { navigateTo, addToCart, toggleWishlist, isInWishlist } = useApp();
  const inWishlist = isInWishlist(product.pid);

  return (
    <div className="group relative bg-white">
      <div
        className="relative overflow-hidden cursor-pointer bg-silk-light aspect-[3/4]"
        onClick={() => navigateTo('product', product.pid)}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-dark-red/0 group-hover:bg-dark-red/5 transition-colors duration-300" />

        <button
          onClick={e => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            inWishlist
              ? 'bg-ruby-red text-white shadow-md'
              : 'bg-white/90 text-dark-red/50 hover:text-ruby-red hover:bg-white shadow-sm'
          }`}
        >
          <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 left-3 bg-indian-red text-white text-[10px] font-sans tracking-widest uppercase px-2 py-1">
            Low Stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 bg-dark-red text-silk text-[10px] font-sans tracking-widest uppercase px-2 py-1">
            Sold Out
          </div>
        )}

        <button
          onClick={e => {
            e.stopPropagation();
            if (product.stock > 0) addToCart(product);
          }}
          disabled={product.stock === 0}
          className="absolute bottom-0 left-0 right-0 bg-dark-red text-silk py-3 flex items-center justify-center gap-2 text-xs font-sans tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ruby-red"
        >
          <ShoppingBag size={13} />
          {product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
        </button>
      </div>

      <div className="pt-3 pb-1">
        <button
          onClick={() => navigateTo('product', product.pid)}
          className="block text-left w-full"
        >
          <p className="text-[10px] font-sans tracking-widest uppercase text-grey-beige mb-1">
            {product.type === 'skin' ? 'Skin Care' : product.type === 'hair' ? 'Hair Care' : 'Body Care'}
          </p>
          <h3 className="font-serif text-dark-red text-sm leading-snug mb-2 group-hover:text-ruby-red transition-colors">
            {product.name}
          </h3>
        </button>
        <div className="flex items-center justify-between">
          <StarRating rating={product.rating} count={product.ratingCount} size={12} />
          <span className="font-sans font-semibold text-dark-red text-sm">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}
