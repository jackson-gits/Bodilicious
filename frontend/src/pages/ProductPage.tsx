import { useState } from 'react';
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sampleProducts } from '../data/products';
import StarRating from '../components/StarRating';
import Footer from '../components/Footer';

export default function ProductPage() {
  const { selectedProductPid, addToCart, toggleWishlist, isInWishlist, navigateTo } = useApp();
  const product = sampleProducts.find(p => p.pid === selectedProductPid) ?? sampleProducts[0];

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'uses' | 'symptoms'>('ingredients');
  const inWishlist = isInWishlist(product.pid);

  const prevImage = () => setActiveImage(i => (i === 0 ? product.images.length - 1 : i - 1));
  const nextImage = () => setActiveImage(i => (i === product.images.length - 1 ? 0 : i + 1));

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
  };

  const related = sampleProducts.filter(p => p.type === product.type && p.pid !== product.pid).slice(0, 3);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <button
          onClick={() => navigateTo('shop')}
          className="flex items-center gap-1 text-xs font-sans tracking-widest uppercase text-grey-beige hover:text-dark-red transition-colors mb-8"
        >
          <ChevronLeft size={14} /> Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <div className="relative aspect-square bg-silk-light overflow-hidden group">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={16} className="text-dark-red" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={16} className="text-dark-red" />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {product.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === activeImage ? 'bg-dark-red w-4' : 'bg-dark-red/30'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 overflow-hidden border-2 transition-colors ${
                      i === activeImage ? 'border-dark-red' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-2">
              {product.type === 'skin' ? 'Skin Care' : product.type === 'hair' ? 'Hair Care' : 'Body Care'}
            </p>
            <h1 className="font-serif text-dark-red text-3xl md:text-4xl mb-3">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <StarRating rating={product.rating} count={product.ratingCount} size={15} />
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-sans font-bold text-dark-red text-3xl">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>

            <p className="font-sans text-grey-beige text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            <div className={`inline-flex items-center gap-1.5 text-xs font-sans mb-8 px-3 py-1.5 ${
              product.stock === 0
                ? 'bg-dark-red/10 text-dark-red'
                : product.stock <= 5
                ? 'bg-indian-red/10 text-indian-red'
                : 'bg-silk text-dark-red'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                product.stock === 0 ? 'bg-dark-red' : product.stock <= 5 ? 'bg-indian-red' : 'bg-grey-beige'
              }`} />
              {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
            </div>

            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center border border-silk">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-dark-red hover:bg-silk-light transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-sans text-dark-red text-sm font-medium">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-dark-red hover:bg-silk-light transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-dark-red text-silk py-4 font-sans text-xs tracking-widest uppercase hover:bg-ruby-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={15} />
                {product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-14 flex items-center justify-center border transition-colors ${
                  inWishlist
                    ? 'border-ruby-red bg-ruby-red text-white'
                    : 'border-silk text-dark-red/50 hover:border-ruby-red hover:text-ruby-red'
                }`}
              >
                <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex border-b border-silk mb-8">
            {(['ingredients', 'uses', 'symptoms'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-xs font-sans tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-dark-red text-dark-red'
                    : 'border-transparent text-grey-beige hover:text-dark-red'
                }`}
              >
                {tab === 'symptoms' ? 'Symptoms Cured' : tab}
              </button>
            ))}
          </div>

          {activeTab === 'ingredients' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {product.ingredients.map(ing => (
                <div key={ing} className="bg-silk-light px-4 py-3 text-center">
                  <p className="text-xs font-sans text-dark-red font-medium leading-snug">{ing}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'uses' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {product.uses.map((use, i) => (
                <div key={i} className="bg-silk-light px-5 py-4 flex items-start gap-3">
                  <span className="font-serif text-ruby-red text-lg leading-none">{i + 1}.</span>
                  <p className="text-xs font-sans text-dark-red leading-relaxed">{use}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'symptoms' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {product.symptomsCured.map(sym => (
                <div key={sym} className="bg-silk-light px-5 py-4 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-ruby-red flex-shrink-0" />
                  <p className="text-xs font-sans text-dark-red">{sym}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {product.reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-dark-red text-2xl mb-8">Customer Reviews</h2>
            <div className="space-y-5">
              {product.reviews.map((review, i) => (
                <div key={i} className="border-b border-silk pb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-sans font-semibold text-dark-red">{review.user}</p>
                      <p className="text-[10px] font-sans text-grey-beige">{review.createdAt}</p>
                    </div>
                    <StarRating rating={review.rating} size={13} />
                  </div>
                  <p className="text-sm font-sans text-dark-red/70 leading-relaxed italic">"{review.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-serif text-dark-red text-2xl">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {related.map(p => (
                <div key={p.pid}>
                  <button
                    onClick={() => navigateTo('product', p.pid)}
                    className="group block w-full text-left"
                  >
                    <div className="aspect-[3/4] bg-silk-light overflow-hidden mb-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <p className="font-serif text-dark-red text-sm group-hover:text-ruby-red transition-colors">
                      {p.name}
                    </p>
                    <p className="font-sans font-semibold text-dark-red text-sm mt-1">
                      ₹{p.price.toLocaleString('en-IN')}
                    </p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
