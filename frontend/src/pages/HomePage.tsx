import { ArrowRight, Leaf, Shield, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { useMemo, useCallback } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';
import { fadeUpVariant, staggerContainerVariant, getAccessibleVariant, durations } from '../utils/motionTokens';

const SHOP_CATEGORIES = [
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
];

const PROMISES = [
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
];

export default function HomePage() {
  const { setShopFilter, products, isLoading } = useApp();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const fadeUp = getAccessibleVariant(fadeUpVariant, !!shouldReduceMotion);
  const stagger = getAccessibleVariant(staggerContainerVariant, !!shouldReduceMotion);

  const handleShop = useCallback((filter: 'all' | 'skin' | 'hair' | 'body' | 'lip' | 'makeup' | 'other') => {
    setShopFilter(filter);

    // Use navigate to include URL parameter so ShopPage registers the category
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (filter === 'all') {
      navigate('/shop');
    } else {
      navigate(`/shop?category=${filter}`);
    }
  }, [navigate, setShopFilter]);

  const bestSellers = useMemo(() => products.filter((_, i) => [0, 1, 2, 4].includes(i)), [products]);

  const reviews = useMemo(() => products
    .flatMap(p => p.reviews.map(r => ({ ...r, productName: p.name })))
    .slice(0, 3), [products]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-dark-red animate-spin mb-4" />
        <p className="text-dark-red font-sans text-sm uppercase tracking-widest">Loading Bodilicious...</p>
      </div>
    );
  }

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
          <m.div
            className="max-w-xl"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <m.p variants={fadeUp} className="text-silk/80 font-sans text-xs tracking-[0.3em] uppercase mb-6">
              Herbal &bull; Clean &bull; Effective
            </m.p>
            <m.h1 variants={fadeUp} className="font-serif text-silk text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
              Beauty Rooted in
              <em className="block not-italic text-indian-red">Ancient Wisdom</em>
            </m.h1>
            <m.p variants={fadeUp} className="text-silk/70 font-sans text-base leading-relaxed mb-10 max-w-md">
              Premium Indian herbal skincare and haircare, crafted with nature's finest ingredients
              for results you can feel.
            </m.p>
            <m.div variants={fadeUp} className="flex flex-wrap gap-4">
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
            </m.div>
          </m.div>
        </div>
      </section>

      <section className="py-20 bg-silk-light overflow-hidden">
        <m.div
          className="max-w-7xl mx-auto px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <m.div variants={fadeUp}>
              <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-2">
                Discover
              </p>
              <h2 className="font-serif text-dark-red text-3xl md:text-4xl">Best Sellers</h2>
            </m.div>
            <m.button
              variants={fadeUp}
              onClick={() => handleShop('all')}
              className="flex items-center gap-1 mt-4 md:mt-0 text-xs font-sans tracking-widest uppercase text-grey-beige hover:text-ruby-red transition-colors"
            >
              View All <ChevronRight size={14} />
            </m.button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {bestSellers.map(product => (
              <m.div key={product.pid} variants={fadeUp}>
                <ProductCard product={product} />
              </m.div>
            ))}
          </div>
        </m.div>
      </section>

      <section className="py-20 bg-white overflow-hidden">
        <m.div
          className="max-w-7xl mx-auto px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <m.div variants={fadeUp} className="text-center mb-12">
            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-2">
              Shop by
            </p>
            <h2 className="font-serif text-dark-red text-3xl md:text-4xl">Category</h2>
          </m.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SHOP_CATEGORIES.map(cat => (
              <m.button
                key={cat.filter}
                variants={fadeUp}
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
              </m.button>
            ))}
          </div>
        </m.div>
      </section>

      <section className="py-20 bg-dark-red text-silk overflow-hidden">
        <m.div
          className="max-w-7xl mx-auto px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <m.div variants={fadeUp} className="text-center mb-14">
            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-indian-red mb-2">
              Our Promise
            </p>
            <h2 className="font-serif text-3xl md:text-4xl">Why Bodilicious?</h2>
          </m.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {PROMISES.map(({ Icon, title, desc }) => (
              <m.div key={title} variants={fadeUp} className="text-center">
                <div className="w-14 h-14 rounded-full bg-ruby-red/20 border border-ruby-red/30 flex items-center justify-center mx-auto mb-6">
                  <Icon size={22} className="text-indian-red" />
                </div>
                <h3 className="font-serif text-xl mb-3">{title}</h3>
                <p className="text-silk/60 font-sans text-sm leading-relaxed">{desc}</p>
              </m.div>
            ))}
          </div>
        </m.div>
      </section>

      <section className="py-20 bg-silk-light overflow-hidden">
        <m.div
          className="max-w-7xl mx-auto px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <m.div variants={fadeUp} className="text-center mb-12">
            <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-2">
              Real Results
            </p>
            <h2 className="font-serif text-dark-red text-3xl md:text-4xl">What Our Customers Say</h2>
          </m.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <m.div key={i} variants={fadeUp} className="bg-white p-7">
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
              </m.div>
            ))}
          </div>
        </m.div>
      </section>

      <section className="py-20 bg-white overflow-hidden">
        <m.div
          className="max-w-2xl mx-auto px-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <m.p variants={fadeUp} className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-3">
            Join the Family
          </m.p>
          <m.h2 variants={fadeUp} className="font-serif text-dark-red text-3xl md:text-4xl mb-4">
            Start Your Glow Journey
          </m.h2>
          <m.p variants={fadeUp} className="font-sans text-grey-beige text-sm leading-relaxed mb-8">
            Thousands of women trust Bodilicious for clean, effective beauty. Find your perfect ritual today.
          </m.p>
          <m.button
            variants={fadeUp}
            onClick={() => handleShop('all')}
            className="inline-flex items-center gap-2 bg-dark-red text-silk px-10 py-4 font-sans text-xs tracking-widest uppercase hover:bg-ruby-red transition-colors"
          >
            Shop Now <ArrowRight size={14} />
          </m.button>
        </m.div>
      </section>

      <Footer />
    </div>
  );
}
