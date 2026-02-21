import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, User, Menu, X, Search } from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { navigateTo, cartCount, wishlist, currentPage } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Shop All', page: 'shop' as const, filter: 'all' as const },
    { label: 'Skin Care', page: 'shop' as const, filter: 'skin' as const },
    { label: 'Hair Care', page: 'shop' as const, filter: 'hair' as const },
  ];

  const { setShopFilter } = useApp();

  const handleNav = (page: 'home' | 'shop', filter?: 'all' | 'skin' | 'hair' | 'other') => {
    if (filter) setShopFilter(filter);
    navigateTo(page);
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-white shadow-sm border-b border-silk'
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button onClick={() => navigateTo('home')} className="flex-shrink-0">
            <Logo size="sm" />
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleNav(link.page, link.filter)}
                className={`text-sm font-sans tracking-widest uppercase transition-colors duration-200 ${
                  currentPage === link.page
                    ? 'text-ruby-red'
                    : 'text-dark-red/70 hover:text-dark-red'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex text-dark-red/60 hover:text-dark-red transition-colors">
              <Search size={18} />
            </button>
            <button
              onClick={() => navigateTo('wishlist')}
              className="relative text-dark-red/60 hover:text-ruby-red transition-colors"
            >
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-ruby-red text-white text-[10px] rounded-full flex items-center justify-center font-sans">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              onClick={() => navigateTo('account')}
              className="text-dark-red/60 hover:text-dark-red transition-colors"
            >
              <User size={18} />
            </button>
            <button
              onClick={() => navigateTo('cart')}
              className="relative text-dark-red/60 hover:text-dark-red transition-colors"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-dark-red text-silk text-[10px] rounded-full flex items-center justify-center font-sans">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden text-dark-red/70 hover:text-dark-red"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-silk px-6 py-4 space-y-3">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => handleNav(link.page, link.filter)}
              className="block w-full text-left text-sm font-sans tracking-widest uppercase text-dark-red/70 hover:text-ruby-red py-2 border-b border-silk-light transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
