import { memo } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { m, useReducedMotion } from 'framer-motion';
import { hoverLift, hoverLiftSubtle } from '../utils/motionTokens';

interface ProductCardProps {
  product: Product;
}

export default memo(function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const inWishlist = isInWishlist(product.pid);

  const shouldReduceMotion = useReducedMotion();
  const lift = shouldReduceMotion ? {} : hoverLift;
  const subtleLift = shouldReduceMotion ? {} : hoverLiftSubtle;

  return (
    <m.div
      className="group relative bg-white transition-shadow hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-sm"
      whileHover={lift}
      layout // enable smooth layout transitions when filtering the shop grid
    >
      <Link
        to={`/product?id=${product.pid}`}
        className="relative overflow-hidden cursor-pointer bg-silk-light aspect-[3/4] block rounded-sm"
      >
        <m.img
          whileHover={subtleLift}
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark-red/0 group-hover:bg-dark-red/5 transition-colors duration-300" />

        <button
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${inWishlist
            ? 'bg-ruby-red text-white shadow-md'
            : 'bg-white/90 text-dark-red/50 hover:text-ruby-red hover:bg-white shadow-sm'
            }`}
        >
          <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 left-3 bg-indian-red text-white text-[10px] font-sans tracking-widest uppercase px-2 py-1 rounded-sm">
            Low Stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 bg-dark-red text-silk text-[10px] font-sans tracking-widest uppercase px-2 py-1 rounded-sm">
            Sold Out
          </div>
        )}

        <button
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            if (product.stock > 0) addToCart(product);
          }}
          disabled={product.stock === 0}
          className="absolute bottom-0 left-0 right-0 bg-dark-red text-silk py-3 flex items-center justify-center gap-2 text-xs font-sans tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ruby-red"
        >
          <ShoppingBag size={13} />
          {product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
        </button>
      </Link>

      <div className="pt-3 pb-1 px-1">
        <Link
          to={`/product?id=${product.pid}`}
          className="block text-left w-full"
        >
          <p className="text-[10px] font-sans tracking-widest uppercase text-grey-beige mb-1">
            {product.category === 'skin' ? 'Skin Care' : product.category === 'hair' ? 'Hair Care' : 'Body Care'}
          </p>
          <h3 className="font-serif text-dark-red text-sm leading-snug mb-2 group-hover:text-ruby-red transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <StarRating rating={product.rating} count={product.ratingCount} size={12} />
          <span className="font-sans font-semibold text-dark-red text-sm">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </m.div>
  );
});
