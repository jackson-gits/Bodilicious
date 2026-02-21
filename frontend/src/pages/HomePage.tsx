import { ArrowRight, Leaf, Shield, Sparkles, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sampleProducts } from '../data/products';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';

const bestSellers = sampleProducts.filter((_, i) => [0, 1, 2, 4].includes(i));

const reviews = sampleProducts
  .flatMap(p => p.reviews.map(r => ({ ...r, productName: p.name })))
  .slice(0, 3);

export default function HomePage() {
  const { navigateTo, setShopFilter } = useApp();

  const handleShop = (filter: 'all' | 'skin' | 'hair' | 'other') => {
    setShopFilter(filter);
    navigateTo('shop');
  };

  return (
    <div className="bg-white">
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.pexels.com/photos/3321416/pexels-photo-3321416.jpeg?auto=compress&cs=tinysrgb&w=1400)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-red/80 via-dark-red/50 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <div className="max-w-xl">
            <p className="text-silk/80 font-sans text-xs tracking-[0.3em] uppercase mb-6">
              Herbal &bull; Clean &bull; Effective
            </p>
            <h1 className="font-serif text-silk text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
              Beauty Rooted in
              <em className="block not-italic text-indian-red">Ancient Wisdom</em>
            </h1>
            <p className="text-silk/70 font-sans text-base leading-relaxed mb-10 max-w-md">
              Premium Indian herbal skincare and haircare, crafted with nature's finest ingredients
              for results you can feel.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleShop('all')}
                className="flex items-center gap-2 bg-silk text-dark-red px-8 py-4 font-sans text-xs tracking-widest uppercase hover:bg-white transition-colors duration-200"
              >
                Shop Best Sellers
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => handleShop('skin')}
                className="flex items-center gap-2 border border-silk/60 text-silk px-8 py-4 font-sans text-xs tracking-widest uppercase hover:bg-silk/10 transition-colors duration-200"
              >
                Explore Skin Care
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-silk-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-2">
                Discover
              </p>
              <h2 className="font-serif text-dark-red text-3xl md:text-4xl">Best Sellers</h2>
            </div>
            <button
              onClick={() => handleShop('all')}
              className="flex items-center gap-1 mt-4 md:mt-0 text-xs font-sans tracking-widest uppercase text-grey-beige hover:text-ruby-red transition-colors"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map(product => (
              <ProductCard key={product.pid} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-2">
              Shop by
            </p>
            <h2 className="font-serif text-dark-red text-3xl md:text-4xl">Category</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: 'Skin Care',
                filter: 'skin' as const,
                img: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=600',
                desc: 'Serums, oils & cleansers for radiant skin',
              },
              {
                label: 'Hair Care',
                filter: 'hair' as const,
                img: 'https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg?auto=compress&cs=tinysrgb&w=600',
                desc: 'Oils & serums for lustrous, healthy hair',
              },
              {
                label: 'Body Care',
                filter: 'other' as const,
                img: 'https://images.pexels.com/photos/6621461/pexels-photo-6621461.jpeg?auto=compress&cs=tinysrgb&w=600',
                desc: 'Butters & treatments for glowing skin',
              },
            ].map(cat => (
              <button
                key={cat.filter}
                onClick={() => handleShop(cat.filter)}
                className="group relative overflow-hidden aspect-[4/5] text-left"
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-red/80 via-dark-red/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-serif text-silk text-2xl mb-1">{cat.label}</h3>
                  <p className="text-silk/70 text-xs font-sans">{cat.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-indian-red text-xs font-sans tracking-widest uppercase">
                    Shop Now <ChevronRight size={12} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-red text-silk">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-indian-red mb-2">
              Our Promise
            </p>
            <h2 className="font-serif text-3xl md:text-4xl">Why Bodilicious?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                Icon: Leaf,
                title: 'Clean Ingredients',
                desc: 'Every formula is free from harmful chemicals. We use only ethically sourced, plant-based ingredients proven effective by science.',
              },
              {
                Icon: Shield,
                title: 'Dermatologically Inspired',
                desc: 'Developed with guidance from dermatologists and Ayurvedic practitioners for formulas that truly work on Indian skin.',
              },
              {
                Icon: Sparkles,
                title: 'Herbal & Effective',
                desc: 'Ancient Indian herbs, time-tested for centuries, now formulated with modern science for visible, lasting results.',
              },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 rounded-full bg-ruby-red/20 border border-ruby-red/30 flex items-center justify-center mx-auto mb-6">
                  <Icon size={22} className="text-indian-red" />
                </div>
                <h3 className="font-serif text-xl mb-3">{title}</h3>
                <p className="text-silk/60 font-sans text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-silk-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-2">
              Real Results
            </p>
            <h2 className="font-serif text-dark-red text-3xl md:text-4xl">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <div key={i} className="bg-white p-7">
                <StarRating rating={review.rating} size={14} />
                <p className="font-sans text-dark-red/80 text-sm leading-relaxed mt-4 mb-5 italic">
                  "{review.comment}"
                </p>
                <div className="border-t border-silk pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-sans font-semibold text-dark-red">{review.user}</p>
                    <p className="text-[10px] font-sans text-grey-beige mt-0.5">{review.productName}</p>
                  </div>
                  <p className="text-[10px] font-sans text-grey-beige">{review.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-3">
            Join the Family
          </p>
          <h2 className="font-serif text-dark-red text-3xl md:text-4xl mb-4">
            Start Your Glow Journey
          </h2>
          <p className="font-sans text-grey-beige text-sm leading-relaxed mb-8">
            Thousands of women trust Bodilicious for clean, effective beauty. Find your perfect ritual today.
          </p>
          <button
            onClick={() => handleShop('all')}
            className="inline-flex items-center gap-2 bg-dark-red text-silk px-10 py-4 font-sans text-xs tracking-widest uppercase hover:bg-ruby-red transition-colors"
          >
            Shop Now <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
