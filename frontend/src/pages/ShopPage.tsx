import { useApp } from '../context/AppContext';
import { sampleProducts } from '../data/products';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

const categories = [
  { value: 'all', label: 'All Products' },
  { value: 'skin', label: 'Skin Care' },
  { value: 'hair', label: 'Hair Care' },
  { value: 'other', label: 'Body Care' },
] as const;

export default function ShopPage() {
  const { shopFilter, setShopFilter } = useApp();

  const filtered =
    shopFilter === 'all'
      ? sampleProducts
      : sampleProducts.filter(p => p.type === shopFilter);

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-silk-light pt-28 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-2">
            Collection
          </p>
          <h1 className="font-serif text-dark-red text-4xl md:text-5xl">
            {categories.find(c => c.value === shopFilter)?.label ?? 'All Products'}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-2 flex-wrap mb-10">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setShopFilter(cat.value)}
              className={`px-5 py-2 text-xs font-sans tracking-widest uppercase transition-all duration-200 border ${
                shopFilter === cat.value
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map(product => (
            <ProductCard key={product.pid} product={product} />
          ))}
        </div>
      </div>

      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
}
