import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Heart,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Loader2,
} from 'lucide-react';
import { m, useReducedMotion } from 'framer-motion';
import { fadeUpVariant, staggerContainerVariant, getAccessibleVariant } from '../utils/motionTokens';
import { useApp } from '../context/AppContext';
import StarRating from '../components/StarRating';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

export default function ProductPage() {
  const {
    products,
    selectedProductPid,
    addToCart,
    toggleWishlist,
    isInWishlist,
    navigateTo,
  } = useApp();

  const shouldReduceMotion = useReducedMotion();
  const fadeUp = getAccessibleVariant(fadeUpVariant, !!shouldReduceMotion);
  const stagger = getAccessibleVariant(staggerContainerVariant, !!shouldReduceMotion);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'uses' | 'symptoms'>('ingredients');

  useEffect(() => {
    if (!selectedProductPid) {
      setError('No product selected');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/v1/products/${selectedProductPid}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error('Failed to fetch product');
        }

        setProduct(data.data);
      } catch {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [selectedProductPid]);

  // reset UI state when product changes
  useEffect(() => {
    setActiveImage(0);
    setQty(1);
    setActiveTab('ingredients');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.pid]);

  const inWishlist = product ? isInWishlist(product.pid) : false;

  const related = useMemo(
    () => product ? products.filter(p => p.type === product.type && p.pid !== product.pid).slice(0, 4) : [],
    [products, product]
  );

  const prevImage = useCallback(() => {
    setActiveImage(i => (i === 0 ? (product?.images.length || 1) - 1 : i - 1));
  }, [product?.images.length]);

  const nextImage = useCallback(() => {
    setActiveImage(i => (i === (product?.images.length || 1) - 1 ? 0 : i + 1));
  }, [product?.images.length]);

  const handleAddToCart = useCallback(() => {
    if (product) {
      addToCart(product, qty);
    }
  }, [qty, addToCart, product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-dark-red mb-4" />
        <p className="text-xs uppercase tracking-widest font-sans text-dark-red">Loading Bodilicious...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center -mt-10">
        <p className="font-serif text-3xl text-dark-red mb-5">{error ?? 'Product not found'}</p>
        <button
          onClick={() => navigateTo('shop')}
          className="text-xs uppercase font-sans tracking-widest text-grey-beige hover:text-dark-red transition-colors border-b border-grey-beige hover:border-dark-red pb-1"
        >
          Return to shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <button
          onClick={() => navigateTo('shop')}
          className="group flex items-center gap-1.5 text-xs font-sans tracking-widest uppercase text-grey-beige hover:text-dark-red transition-colors mb-12"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to shop
        </button>

        <m.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* Images Section */}
          <m.div variants={fadeUp} className="flex flex-col-reverse md:flex-row gap-4 lg:gap-6">
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-20 lg:w-24 shrink-0 pb-2 md:pb-0 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 md:w-full aspect-square shrink-0 overflow-hidden border ${activeImage === idx ? 'border-dark-red' : 'border-transparent hover:border-silk-dark'
                      } transition-colors duration-200`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className={`relative flex-1 bg-silk-light overflow-hidden aspect-square ${product.images.length <= 1 ? 'md:aspect-auto' : ''}`}>
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {product.images.length > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 md:hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={prevImage}
                    className="w-10 h-10 bg-white/80 hover:bg-white text-dark-red flex items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all hover:scale-105"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="w-10 h-10 bg-white/80 hover:bg-white text-dark-red flex items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all hover:scale-105"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </m.div>

          {/* Product Details Section */}
          <m.div variants={fadeUp} className="flex flex-col py-2">
            <m.p variants={fadeUp} className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-3">
              {product.type === 'skin' ? 'Skin Care' : product.type === 'hair' ? 'Hair Care' : 'Body Care'}
            </m.p>

            <m.h1 variants={fadeUp} className="text-4xl md:text-5xl font-serif text-dark-red mb-4 leading-tight">
              {product.name}
            </m.h1>

            <m.div variants={fadeUp} className="flex items-center gap-3 mb-8">
              <StarRating rating={product.rating ?? 0} size={15} />
              <span className="text-xs font-sans text-grey-beige">
                ({product.ratingCount ?? 0} reviews)
              </span>
            </m.div>

            <m.p variants={fadeUp} className="text-2xl font-sans text-dark-red mb-8">
              ₹{product.price.toLocaleString('en-IN')}
            </m.p>

            <m.p variants={fadeUp} className="text-dark-red/80 font-sans text-sm leading-relaxed mb-10">
              {product.description}
            </m.p>

            <m.div variants={fadeUp} className="mt-auto border-t border-silk pt-10">
              {product.stock > 0 ? (
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  {/* Quantity Selector */}
                  <div className="flex border border-silk h-14 w-full sm:w-32 items-center justify-between px-4 bg-white">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="text-dark-red/60 hover:text-dark-red transition-colors p-2 -ml-2"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-sans text-sm font-semibold text-dark-red">{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="text-dark-red/60 hover:text-dark-red transition-colors p-2 -mr-2"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-dark-red text-silk h-14 font-sans text-xs tracking-widest uppercase hover:bg-ruby-red hover:text-white transition-colors flex items-center justify-center gap-3"
                  >
                    <ShoppingBag size={16} />
                    Add to Bag
                  </button>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`h-14 w-14 sm:w-14 border flex items-center justify-center transition-colors ${inWishlist
                      ? 'border-ruby-red bg-ruby-red text-white'
                      : 'border-silk text-dark-red hover:border-dark-red'
                      }`}
                  >
                    <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ) : (
                <div className="h-14 bg-silk-light flex items-center justify-center text-dark-red/60 font-sans text-xs tracking-widest uppercase mb-4">
                  Out of Stock
                </div>
              )}

              <p className="text-[10px] font-sans text-grey-beige uppercase tracking-wider text-center sm:text-left">
                {product.stock > 0 && product.stock <= 5
                  ? `Only ${product.stock} left in stock`
                  : product.stock > 5
                    ? 'In stock and ready to ship'
                    : 'We are restocking soon'}
              </p>
            </m.div>
          </m.div>
        </m.div>

        {/* Tabbed Info Section */}
        <m.div
          className="mt-32 max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <div className="flex border-b border-silk mb-10 overflow-x-auto scrollbar-hide">
            {(['ingredients', 'uses', 'symptoms'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[120px] pb-4 uppercase font-sans text-xs tracking-widest transition-colors whitespace-nowrap px-4 ${activeTab === tab
                  ? 'border-b-2 border-dark-red text-dark-red font-semibold'
                  : 'text-grey-beige hover:text-dark-red'
                  }`}
              >
                {tab === 'symptoms' ? 'Symptoms Cured' : tab}
              </button>
            ))}
          </div>

          <div className="min-h-[200px] font-sans text-dark-red/80 text-sm leading-relaxed px-2">
            {activeTab === 'ingredients' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(product.ingredients ?? []).map((i, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-silk-light/50 border border-silk/50 rounded-sm hover:border-silk transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-indian-red shrink-0" />
                    <span>{i}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'uses' && (
              <ul className="space-y-6 max-w-2xl">
                {(product.uses ?? []).map((u, i) => (
                  <li key={i} className="flex gap-5 items-start">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full border border-silk text-dark-red text-xs font-semibold shrink-0">
                      {i + 1}
                    </span>
                    <span className="pt-1.5">{u}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'symptoms' && (
              <div className="flex flex-wrap gap-4">
                {(product.symptomsCured ?? []).map((s, idx) => (
                  <span key={idx} className="px-6 py-3 border border-silk text-dark-red bg-white text-xs uppercase tracking-widest hover:bg-silk-light transition-colors cursor-default">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </m.div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <m.div
            className="mt-32 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <m.div variants={fadeUp} className="text-center mb-16">
              <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-3">
                Real Results
              </p>
              <h2 className="font-serif text-dark-red text-3xl md:text-4xl">Customer Reviews</h2>
            </m.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {product.reviews.map((review, idx) => (
                <m.div key={idx} variants={fadeUp} className="bg-silk-light p-8 lg:p-10 border border-silk/30 hover:border-silk transition-colors">
                  <StarRating rating={review.rating} size={14} />
                  <p className="font-sans text-dark-red/80 text-sm leading-relaxed mt-5 mb-8 italic">
                    "{review.comment}"
                  </p>
                  <div className="border-t border-silk/60 pt-5 flex items-center justify-between">
                    <p className="text-sm font-sans font-semibold text-dark-red">{review.user}</p>
                    <p className="text-[10px] font-sans text-grey-beige uppercase tracking-widest">
                      {"createdAt" in review ? (review as { createdAt?: string }).createdAt : "Verified Buyer"}
                    </p>
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <m.div
            className="mt-40"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <m.div variants={fadeUp} className="flex items-end justify-between mb-12 border-b border-silk pb-6">
              <div>
                <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-2">
                  Complete your ritual
                </p>
                <h2 className="font-serif text-dark-red text-3xl md:text-4xl">You May Also Like</h2>
              </div>
              <button
                onClick={() => navigateTo('shop')}
                className="hidden md:flex items-center gap-1.5 text-xs font-sans tracking-widest uppercase text-grey-beige hover:text-dark-red transition-colors group"
              >
                View all <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </m.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => (
                <m.div key={p.pid} variants={fadeUp}>
                  <ProductCard product={p} />
                </m.div>
              ))}
            </div>

            <div className="mt-10 text-center md:hidden">
              <button
                onClick={() => navigateTo('shop')}
                className="inline-flex items-center gap-1.5 text-xs font-sans tracking-widest uppercase text-dark-red border-b border-dark-red pb-1"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>
          </m.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
