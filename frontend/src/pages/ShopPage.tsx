import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fadeUpVariant, getAccessibleVariant, staggerContainerVariant } from '../utils/motionTokens';
import { useSearchParams } from 'react-router-dom';

const CATEGORIES = [
  { value: 'skin', label: 'Skin' },
  { value: 'body', label: 'Body' },
  { value: 'eye_care', label: 'Eye' },
  { value: 'hair', label: 'Hair' }
];

const STEPS = [
  { value: 'cleanser', label: 'Cleanse' },
  { value: 'toner', label: 'Tone' },
  { value: 'treatment', label: 'Treat' },
  { value: 'serum', label: 'Serum' },
  { value: 'moisturizer', label: 'Moisturize' },
  { value: 'sunscreen', label: 'SPF' }
];

const CONCERNS = [
  { value: 'acne', label: 'Acne' },
  { value: 'pigmentation', label: 'Hyperpigmentation / Dark Spots' },
  { value: 'aging', label: 'Fine Lines / Wrinkles' },
  { value: 'dullness', label: 'Dull Skin' },
  { value: 'dehydration', label: 'Dehydrated Skin' }
];

const INGREDIENTS = [
  { value: 'Vitamin C', label: 'Vitamin C' },
  { value: 'Retinol', label: 'Retinoid / Retinol' },
  { value: 'Hyaluronic Acid', label: 'Hyaluronic Acid' },
  { value: 'Alpha Arbutin', label: 'Alpha Arbutin' },
  { value: 'Salicylic Acid', label: 'BHA (Salicylic Acid)' }
];

export default function ShopPage() {
  const { products, totalProducts, isLoading, fetchProducts } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // URL State
  const selectedCategories = searchParams.get('category')?.split(',') || [];
  const selectedSteps = searchParams.get('type')?.split(',') || []; // Maps to product_type for Steps/Type
  const selectedConcerns = searchParams.get('concern')?.split(',') || [];
  const selectedIngredients = searchParams.get('ingredient')?.split(',') || [];
  const sort = searchParams.get('sort') || 'best_selling';
  const inStock = searchParams.get('inStock') || '';
  const priceMax = searchParams.get('priceMax') || '1499';
  const searchQuery = searchParams.get('search') || '';

  // Local state for debounced slider
  const [localPriceMax, setLocalPriceMax] = useState(priceMax);

  const shouldReduceMotion = useReducedMotion();
  const fadeUp = getAccessibleVariant(fadeUpVariant, !!shouldReduceMotion);
  const stagger = getAccessibleVariant(staggerContainerVariant, !!shouldReduceMotion);

  useEffect(() => {
    // Wait for the debounced slider to set URL, then fetch
    fetchProducts(`?${searchParams.toString()}`);
  }, [searchParams, fetchProducts]);

  // Debounced price slider
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localPriceMax !== priceMax) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('priceMax', localPriceMax);
        newParams.set('page', '1');
        setSearchParams(newParams);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [localPriceMax, priceMax, searchParams, setSearchParams]);

  const handleToggle = (key: string, value: string) => {
    const current = searchParams.get(key)?.split(',') || [];
    const newParams = new URLSearchParams(searchParams);

    if (current.includes(value)) {
      const filtered = current.filter(v => v !== value);
      if (filtered.length) newParams.set(key, filtered.join(','));
      else newParams.delete(key);
    } else {
      newParams.set(key, [...current, value].join(','));
    }

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleClear = () => {
    setSearchParams(new URLSearchParams());
    setLocalPriceMax('1499');
  };

  const setSingleParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const FilterSection = ({ title, items, paramKey, selected }: { title: string, items: { value: string, label: string }[], paramKey: string, selected: string[] }) => (
    <div className="mb-8">
      <h3 className="font-sans text-sm text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3 pl-2">
        {items.map(item => (
          <label key={item.value} className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${selected.includes(item.value) ? 'bg-dark-red border-dark-red' : 'border-gray-300 group-hover:border-dark-red'}`}>
              {selected.includes(item.value) && <span className="w-2 h-2 bg-white rounded-sm" />}
            </div>
            <span className={`text-sm font-sans transition-colors ${selected.includes(item.value) ? 'text-dark-red' : 'text-gray-600 group-hover:text-dark-red'}`}>
              {item.label}
            </span>
            <input type="checkbox" className="hidden" checked={selected.includes(item.value)} onChange={() => handleToggle(paramKey, item.value)} />
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-neutral-50 min-h-screen pt-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Map */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 border-b border-gray-200 pb-6">
          <m.div initial="hidden" animate="visible" variants={stagger}>
            <m.h1 variants={fadeUp} className="font-serif text-dark-red text-4xl">
              {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
            </m.h1>
            <m.p variants={fadeUp} className="text-sm font-sans text-gray-500 mt-2">
              {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
            </m.p>
          </m.div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden mt-4 flex items-center gap-2 text-sm font-sans font-medium text-dark-red"
          >
            <SlidersHorizontal size={18} /> Filters
          </button>
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {isMobileFiltersOpen && (
            <>
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFiltersOpen(false)}
                className="fixed inset-0 bg-black/50 z-[60] md:hidden"
              />
              <m.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white z-[70] md:hidden flex flex-col shadow-xl"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="font-serif text-2xl text-dark-red">Filters</h2>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="text-gray-400 hover:text-dark-red p-2 -mr-2">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-lg text-dark-red">Active Filters</h3>
                    {(searchParams.toString() !== '') && (
                      <button onClick={handleClear} className="text-xs font-sans text-grey-beige hover:text-dark-red underline">
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Sort By */}
                  <div className="mb-8">
                    <h3 className="font-sans text-sm text-gray-800 mb-3">Sort by:</h3>
                    <div className="relative">
                      <select
                        value={sort}
                        onChange={(e) => setSingleParam('sort', e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-200 text-sm font-sans text-gray-700 py-2.5 px-3 rounded-none focus:outline-none focus:border-dark-red"
                      >
                        <option value="best_selling">Best selling</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" size={16} />
                    </div>
                  </div>

                  <FilterSection title="Category" items={CATEGORIES} paramKey="category" selected={selectedCategories} />
                  <FilterSection title="Step & Type" items={STEPS} paramKey="type" selected={selectedSteps} />
                  <FilterSection title="Concern" items={CONCERNS} paramKey="concern" selected={selectedConcerns} />

                  <div className="mb-8">
                    <h3 className="font-sans text-sm text-gray-800 mb-4">Price</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-sans text-sm">₹</span>
                        <input type="number" readOnly value={0} className="w-full pl-7 px-3 py-2 border border-gray-200 bg-gray-50 text-sm font-sans text-gray-500" />
                      </div>
                      <span className="text-gray-400">to</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-sans text-sm">₹</span>
                        <input
                          type="number"
                          value={localPriceMax}
                          onChange={(e) => setLocalPriceMax(e.target.value)}
                          className="w-full pl-7 px-3 py-2 border border-gray-200 focus:border-dark-red outline-none text-sm font-sans text-gray-700"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0" max="2500"
                      value={localPriceMax}
                      onChange={(e) => setLocalPriceMax(e.target.value)}
                      className="w-full accent-dark-red"
                    />
                  </div>

                  <FilterSection title="Ingredient" items={INGREDIENTS} paramKey="ingredient" selected={selectedIngredients} />

                  <div className="mb-8 border-t border-gray-100 pt-6">
                    <h3 className="font-sans text-sm text-gray-800 mb-4">Availability</h3>
                    <div className="space-y-3 pl-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${inStock === 'true' ? 'bg-dark-red border-dark-red' : 'border-gray-300 group-hover:border-dark-red'}`}>
                          {inStock === 'true' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className={`text-sm font-sans transition-colors ${inStock === 'true' ? 'text-dark-red' : 'text-gray-600 group-hover:text-dark-red'}`}>
                          In stock
                        </span>
                        <input type="radio" className="hidden" checked={inStock === 'true'} onChange={() => setSingleParam('inStock', 'true')} />
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${inStock === 'false' ? 'bg-dark-red border-dark-red' : 'border-gray-300 group-hover:border-dark-red'}`}>
                          {inStock === 'false' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className={`text-sm font-sans transition-colors ${inStock === 'false' ? 'text-dark-red' : 'text-gray-600 group-hover:text-dark-red'}`}>
                          Out of stock
                        </span>
                        <input type="radio" className="hidden" checked={inStock === 'false'} onChange={() => setSingleParam('inStock', 'false')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="w-full py-4 bg-dark-red text-silk font-sans text-sm uppercase tracking-widest hover:bg-ruby-red transition-colors"
                  >
                    View {totalProducts} results
                  </button>
                </div>
              </m.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex gap-10">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-32 max-h-[calc(100vh-140px)] overflow-y-auto pr-4 custom-scrollbar">

              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-xl text-dark-red">Filters</h2>
                {(searchParams.toString() !== '') && (
                  <button onClick={handleClear} className="text-xs font-sans text-grey-beige hover:text-dark-red underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Sort By */}
              <div className="mb-8">
                <h3 className="font-sans text-sm text-gray-800 mb-3">Sort by:</h3>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSingleParam('sort', e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 text-sm font-sans text-gray-700 py-2.5 px-3 rounded-none focus:outline-none focus:border-dark-red"
                  >
                    <option value="best_selling">Best selling</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" size={16} />
                </div>
              </div>

              <FilterSection title="Category" items={CATEGORIES} paramKey="category" selected={selectedCategories} />

              {/* Using Type for 'Step' and 'Type of Product' loosely based on db fields */}
              <FilterSection title="Step & Type" items={STEPS} paramKey="type" selected={selectedSteps} />

              <FilterSection title="Concern" items={CONCERNS} paramKey="concern" selected={selectedConcerns} />

              <div className="mb-8">
                <h3 className="font-sans text-sm text-gray-800 mb-4">Price</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-sans text-sm">₹</span>
                    <input type="number" readOnly value={0} className="w-full pl-7 px-3 py-2 border border-gray-200 bg-gray-50 text-sm font-sans text-gray-500" />
                  </div>
                  <span className="text-gray-400">to</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-sans text-sm">₹</span>
                    <input
                      type="number"
                      value={localPriceMax}
                      onChange={(e) => setLocalPriceMax(e.target.value)}
                      className="w-full pl-7 px-3 py-2 border border-gray-200 focus:border-dark-red outline-none text-sm font-sans text-gray-700"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="0" max="2500"
                  value={localPriceMax}
                  onChange={(e) => setLocalPriceMax(e.target.value)}
                  className="w-full accent-dark-red"
                />
              </div>

              <FilterSection title="Ingredient" items={INGREDIENTS} paramKey="ingredient" selected={selectedIngredients} />

              <div className="mb-8 border-t border-gray-100 pt-6">
                <h3 className="font-sans text-sm text-gray-800 mb-4">Availability</h3>
                <div className="space-y-3 pl-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${inStock === 'true' ? 'bg-dark-red border-dark-red' : 'border-gray-300 group-hover:border-dark-red'}`}>
                      {inStock === 'true' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className={`text-sm font-sans transition-colors ${inStock === 'true' ? 'text-dark-red' : 'text-gray-600 group-hover:text-dark-red'}`}>
                      In stock
                    </span>
                    <input type="radio" className="hidden" checked={inStock === 'true'} onChange={() => setSingleParam('inStock', 'true')} />
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${inStock === 'false' ? 'bg-dark-red border-dark-red' : 'border-gray-300 group-hover:border-dark-red'}`}>
                      {inStock === 'false' && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className={`text-sm font-sans transition-colors ${inStock === 'false' ? 'text-dark-red' : 'text-gray-600 group-hover:text-dark-red'}`}>
                      Out of stock
                    </span>
                    <input type="radio" className="hidden" checked={inStock === 'false'} onChange={() => setSingleParam('inStock', 'false')} />
                  </label>
                </div>
              </div>

            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 pb-20">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse bg-white border border-gray-100 shadow-sm p-4">
                    <div className="w-full aspect-[4/5] bg-gray-200 mb-4"></div>
                    <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-sm">
                <SlidersHorizontal size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="font-serif text-2xl text-dark-red mb-2">No products found</h3>
                <p className="font-sans text-gray-500 mb-6">We couldn't find anything matching your current filters.</p>
                <button onClick={handleClear} className="px-6 py-2 bg-dark-red text-silk font-sans text-sm uppercase tracking-widest hover:bg-ruby-red transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <m.div
                className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
                layout
              >
                <AnimatePresence mode="popLayout">
                  {products.map(product => (
                    <m.div
                      key={product.pid}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    >
                      <ProductCard product={product} />
                    </m.div>
                  ))}
                </AnimatePresence>
              </m.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
