import { useEffect, useMemo, useState } from 'react';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fadeUpVariant, getAccessibleVariant, staggerContainerVariant } from '../utils/motionTokens';

type Option = { value: string; label: string };

const titleCase = (s: string) =>
  s
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const parseCSV = (v: string | null) => (v ? v.split(',').map(x => x.trim()).filter(Boolean) : []);

export default function ShopPage() {
  const { products, isLoading } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // URL State (what user has selected)
  const selectedCategories = parseCSV(searchParams.get('category'));
  const selectedSubCategories = parseCSV(searchParams.get('sub_category'));
  const selectedTypes = parseCSV(searchParams.get('product_type'));
  const selectedConcerns = parseCSV(searchParams.get('concern'));
  const selectedIngredients = parseCSV(searchParams.get('ingredient'));
  const sort = searchParams.get('sort') || 'best_selling';
  const inStock = searchParams.get('inStock') || ''; // true | false | ''
  const searchQuery = searchParams.get('search') || '';

  // Price range (max)
  const computedMaxPrice = useMemo(() => {
    const max = Math.max(0, ...products.map(p => Number(p.price ?? 0)));
    // round up nicely
    return Math.ceil(max / 100) * 100 || 2500;
  }, [products]);

  const priceMax = searchParams.get('priceMax') || String(computedMaxPrice);
  const [localPriceMax, setLocalPriceMax] = useState(priceMax);

  // Keep slider in sync when products load / computedMax changes
  useEffect(() => {
    if (!searchParams.get('priceMax')) {
      setLocalPriceMax(String(computedMaxPrice));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedMaxPrice]);

  // Debounce the price slider into URL
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localPriceMax !== priceMax) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('priceMax', localPriceMax);
        setSearchParams(newParams);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [localPriceMax, priceMax, searchParams, setSearchParams]);

  const shouldReduceMotion = useReducedMotion();
  const fadeUp = getAccessibleVariant(fadeUpVariant, !!shouldReduceMotion);
  const stagger = getAccessibleVariant(staggerContainerVariant, !!shouldReduceMotion);

  // Build filter options dynamically from actual products (so it ALWAYS matches your DB)
  const CATEGORY_OPTIONS: Option[] = useMemo(() => {
    const values = uniq(products.map(p => String(p.category || '')));
    const ordered = ['skin', 'hair', 'body', 'lip', 'makeup', 'other'];
    const sorted = values.sort((a, b) => {
      const ia = ordered.indexOf(a); const ib = ordered.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return sorted.map(v => ({ value: v, label: titleCase(v) }));
  }, [products]);

  const SUBCATEGORY_OPTIONS: Option[] = useMemo(() => {
    const values = uniq(products.map(p => String(p.sub_category || '')).filter(Boolean));
    return values.sort().map(v => ({ value: v, label: titleCase(v) }));
  }, [products]);

  const TYPE_OPTIONS: Option[] = useMemo(() => {
    const values = uniq(products.map(p => String(p.product_type || '')).filter(Boolean));
    return values.sort().map(v => ({ value: v, label: titleCase(v) }));
  }, [products]);

  const CONCERN_OPTIONS: Option[] = useMemo(() => {
    const values = uniq(products.flatMap(p => (p.concerns_targeted || []).map(String)));
    return values.sort().map(v => ({ value: v, label: titleCase(v) }));
  }, [products]);

  const INGREDIENT_OPTIONS: Option[] = useMemo(() => {
    const all = products.flatMap(p => {
      const ing = (p as any).ingredients;
      const list: string[] = [];
      if (ing?.key_actives?.length) list.push(...ing.key_actives.map(String));
      if (ing?.botanical_extracts?.length) list.push(...ing.botanical_extracts.map(String));
      if (ing?.others?.length) list.push(...ing.others.map(String));
      return list;
    });

    // normalize + de-dup, but keep original casing mostly
    const cleaned = uniq(all.map(s => s.trim()).filter(Boolean));
    return cleaned.sort().map(v => ({ value: v, label: v }));
  }, [products]);

  // URL helpers
  const handleToggle = (key: string, value: string) => {
    const current = parseCSV(searchParams.get(key));
    const newParams = new URLSearchParams(searchParams);

    if (current.includes(value)) {
      const filtered = current.filter(v => v !== value);
      if (filtered.length) newParams.set(key, filtered.join(','));
      else newParams.delete(key);
    } else {
      newParams.set(key, [...current, value].join(','));
    }

    setSearchParams(newParams);
  };

  const setSingleParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const handleClear = () => {
    const cleared = new URLSearchParams();
    // keep search if you want; otherwise remove it too
    // if (searchQuery) cleared.set('search', searchQuery);
    setSearchParams(cleared);
    setLocalPriceMax(String(computedMaxPrice));
  };

  // Actual filtering (WORKS even if backend doesn't support query params)
  const filteredProducts = useMemo(() => {
    const max = Number(priceMax || computedMaxPrice);

    const q = searchQuery.trim().toLowerCase();

    return products
      .filter(p => {
        // Category
        if (selectedCategories.length && !selectedCategories.includes(String(p.category))) return false;

        // Sub category
        if (selectedSubCategories.length && !selectedSubCategories.includes(String(p.sub_category || ''))) return false;

        // Product type
        if (selectedTypes.length && !selectedTypes.includes(String(p.product_type || ''))) return false;

        // Concerns
        if (selectedConcerns.length) {
          const c = (p.concerns_targeted || []).map(String);
          const ok = selectedConcerns.every(v => c.includes(v));
          if (!ok) return false;
        }

        // Ingredients
        if (selectedIngredients.length) {
          const ing = (p as any).ingredients;
          const list = [
            ...(ing?.key_actives || []),
            ...(ing?.botanical_extracts || []),
            ...(ing?.others || []),
          ].map((s: any) => String(s).toLowerCase());

          const ok = selectedIngredients.every(sel => list.includes(sel.toLowerCase()));
          if (!ok) return false;
        }

        // Stock
        if (inStock === 'true' && !(Number(p.stock ?? 0) > 0)) return false;
        if (inStock === 'false' && !(Number(p.stock ?? 0) <= 0)) return false;

        // Price
        if (Number(p.price ?? 0) > max) return false;

        // Search (name/description/ingredients)
        if (q) {
          const ing = (p as any).ingredients;
          const allIngredients = [
            ...(ing?.key_actives || []),
            ...(ing?.botanical_extracts || []),
            ...(ing?.others || []),
          ].join(' ').toLowerCase();

          const hay = `${p.name ?? ''} ${p.description ?? ''} ${allIngredients}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sorting
        if (sort === 'price_asc') return Number(a.price ?? 0) - Number(b.price ?? 0);
        if (sort === 'price_desc') return Number(b.price ?? 0) - Number(a.price ?? 0);

        // "best_selling" fallback:
        // If you have ratingCount or rating, sort by that.
        const ar = Number((a as any).ratingCount ?? 0);
        const br = Number((b as any).ratingCount ?? 0);
        if (br !== ar) return br - ar;

        return String(a.name || '').localeCompare(String(b.name || ''));
      });
  }, [
    products,
    selectedCategories,
    selectedSubCategories,
    selectedTypes,
    selectedConcerns,
    selectedIngredients,
    inStock,
    priceMax,
    computedMaxPrice,
    searchQuery,
    sort,
  ]);

  const totalProducts = filteredProducts.length;

  const FilterSection = ({
    title,
    items,
    paramKey,
    selected,
  }: {
    title: string;
    items: Option[];
    paramKey: string;
    selected: string[];
  }) => (
    <div className="mb-8">
      <h3 className="font-sans text-sm text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3 pl-2">
        {items.map(item => (
          <label key={item.value} className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                selected.includes(item.value)
                  ? 'bg-dark-red border-dark-red'
                  : 'border-gray-300 group-hover:border-dark-red'
              }`}
            >
              {selected.includes(item.value) && <span className="w-2 h-2 bg-white rounded-sm" />}
            </div>
            <span
              className={`text-sm font-sans transition-colors ${
                selected.includes(item.value)
                  ? 'text-dark-red'
                  : 'text-gray-600 group-hover:text-dark-red'
              }`}
            >
              {item.label}
            </span>
            <input
              type="checkbox"
              className="hidden"
              checked={selected.includes(item.value)}
              onChange={() => handleToggle(paramKey, item.value)}
            />
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-neutral-50 min-h-screen pt-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
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
                    {searchParams.toString() !== '' && (
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

                  <FilterSection title="Category" items={CATEGORY_OPTIONS} paramKey="category" selected={selectedCategories} />
                  <FilterSection title="Sub Category" items={SUBCATEGORY_OPTIONS} paramKey="sub_category" selected={selectedSubCategories} />
                  <FilterSection title="Product Type" items={TYPE_OPTIONS} paramKey="product_type" selected={selectedTypes} />
                  <FilterSection title="Concern" items={CONCERN_OPTIONS} paramKey="concern" selected={selectedConcerns} />
                  <FilterSection title="Ingredient" items={INGREDIENT_OPTIONS} paramKey="ingredient" selected={selectedIngredients} />

                  {/* Price */}
                  <div className="mb-8">
                    <h3 className="font-sans text-sm text-gray-800 mb-4">Price (max)</h3>
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
                      min="0"
                      max={String(computedMaxPrice)}
                      value={localPriceMax}
                      onChange={(e) => setLocalPriceMax(e.target.value)}
                      className="w-full accent-dark-red"
                    />
                  </div>

                  {/* Availability */}
                  <div className="mb-8 border-t border-gray-100 pt-6">
                    <h3 className="font-sans text-sm text-gray-800 mb-4">Availability</h3>
                    <div className="space-y-3 pl-2">
                      {[
                        { v: 'true', label: 'In stock' },
                        { v: 'false', label: 'Out of stock' },
                      ].map(opt => (
                        <label key={opt.v} className="flex items-center gap-3 cursor-pointer group">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              inStock === opt.v ? 'bg-dark-red border-dark-red' : 'border-gray-300 group-hover:border-dark-red'
                            }`}
                          >
                            {inStock === opt.v && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span
                            className={`text-sm font-sans transition-colors ${
                              inStock === opt.v ? 'text-dark-red' : 'text-gray-600 group-hover:text-dark-red'
                            }`}
                          >
                            {opt.label}
                          </span>
                          <input type="radio" className="hidden" checked={inStock === opt.v} onChange={() => setSingleParam('inStock', opt.v)} />
                        </label>
                      ))}

                      {/* "All" option */}
                      <button
                        type="button"
                        onClick={() => setSingleParam('inStock', '')}
                        className={`mt-2 text-xs font-sans underline ${
                          inStock === '' ? 'text-dark-red' : 'text-grey-beige hover:text-dark-red'
                        }`}
                      >
                        Show all
                      </button>
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
                {searchParams.toString() !== '' && (
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

              <FilterSection title="Category" items={CATEGORY_OPTIONS} paramKey="category" selected={selectedCategories} />
              <FilterSection title="Sub Category" items={SUBCATEGORY_OPTIONS} paramKey="sub_category" selected={selectedSubCategories} />
              <FilterSection title="Product Type" items={TYPE_OPTIONS} paramKey="product_type" selected={selectedTypes} />
              <FilterSection title="Concern" items={CONCERN_OPTIONS} paramKey="concern" selected={selectedConcerns} />
              <FilterSection title="Ingredient" items={INGREDIENT_OPTIONS} paramKey="ingredient" selected={selectedIngredients} />

              {/* Price */}
              <div className="mb-8">
                <h3 className="font-sans text-sm text-gray-800 mb-4">Price (max)</h3>
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
                  min="0"
                  max={String(computedMaxPrice)}
                  value={localPriceMax}
                  onChange={(e) => setLocalPriceMax(e.target.value)}
                  className="w-full accent-dark-red"
                />
              </div>

              {/* Availability */}
              <div className="mb-8 border-t border-gray-100 pt-6">
                <h3 className="font-sans text-sm text-gray-800 mb-4">Availability</h3>
                <div className="space-y-3 pl-2">
                  {[
                    { v: 'true', label: 'In stock' },
                    { v: 'false', label: 'Out of stock' },
                  ].map(opt => (
                    <label key={opt.v} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          inStock === opt.v ? 'bg-dark-red border-dark-red' : 'border-gray-300 group-hover:border-dark-red'
                        }`}
                      >
                        {inStock === opt.v && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span
                        className={`text-sm font-sans transition-colors ${
                          inStock === opt.v ? 'text-dark-red' : 'text-gray-600 group-hover:text-dark-red'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <input type="radio" className="hidden" checked={inStock === opt.v} onChange={() => setSingleParam('inStock', opt.v)} />
                    </label>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSingleParam('inStock', '')}
                    className={`mt-2 text-xs font-sans underline ${
                      inStock === '' ? 'text-dark-red' : 'text-grey-beige hover:text-dark-red'
                    }`}
                  >
                    Show all
                  </button>
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
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-sm">
                <SlidersHorizontal size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="font-serif text-2xl text-dark-red mb-2">No products found</h3>
                <p className="font-sans text-gray-500 mb-6">We couldn't find anything matching your current filters.</p>
                <button
                  onClick={handleClear}
                  className="px-6 py-2 bg-dark-red text-silk font-sans text-sm uppercase tracking-widest hover:bg-ruby-red transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <m.div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" layout>
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map(product => (
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