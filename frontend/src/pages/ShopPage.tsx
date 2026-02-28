import { Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { fadeUpVariant, getAccessibleVariant, staggerContainerVariant } from '../utils/motionTokens';

const categories = [
  { value: 'all', label: 'All Products' },
  { value: 'skin', label: 'Skin Care' },
  { value: 'hair', label: 'Hair Care' },
  { value: 'other', label: 'Body Care' },
] as const;

export default function ShopPage() {
  const { shopFilter, setShopFilter, products, isLoading } = useApp();
  const shouldReduceMotion = useReducedMotion();
  const fadeUp = getAccessibleVariant(fadeUpVariant, !!shouldReduceMotion);
  const stagger = getAccessibleVariant(staggerContainerVariant, !!shouldReduceMotion);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-dark-red animate-spin mb-4" />
        <p className="text-dark-red font-sans text-sm uppercase tracking-widest">Loading Bodilicious...</p>
      </div>
    );
  }

  const filtered =
    shopFilter === 'all'
      ? products
      : products.filter(p => p.type === shopFilter);

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-silk-light pt-28 pb-10 px-6">
        <m.div
          className="max-w-7xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <m.p variants={fadeUp} className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-2">
            Collection
          </m.p>
          <m.h1 variants={fadeUp} className="font-serif text-dark-red text-4xl md:text-5xl">
            {categories.find(c => c.value === shopFilter)?.label ?? 'All Products'}
          </m.h1>
        </m.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-2 flex-wrap mb-10">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setShopFilter(cat.value)}
              className={`px-5 py-2 text-xs font-sans tracking-widest uppercase transition-all duration-200 border ${shopFilter === cat.value
                ? 'bg-dark-red text-silk border-dark-red'
                : 'bg-white text-dark-red/60 border-silk hover:border-dark-red hover:text-dark-red'
                }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-xs font-sans text-grey-beige self-center">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <m.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(product => (
              <m.div
                key={product.pid}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <ProductCard product={product} />
              </m.div>
            ))}
          </AnimatePresence>
        </m.div>
      </div>

      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
}
