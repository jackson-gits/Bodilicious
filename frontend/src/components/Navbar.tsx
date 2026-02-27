import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Heart, User, Menu, X, Search, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useApp } from '../context/AppContext';

const NAV_LINKS = [
  { label: 'Home', page: 'home' as const },
  { label: 'Shop All', page: 'shop' as const, filter: 'all' as const },
  { label: 'Skin Care', page: 'shop' as const, filter: 'skin' as const },
  { label: 'Hair Care', page: 'shop' as const, filter: 'hair' as const },
];

export default function Navbar() {
  const { cartCount, wishlist, currentPage, authStatus, setShopFilter } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = useCallback((filter?: 'all' | 'skin' | 'hair' | 'other') => {
    if (filter) setShopFilter(filter);
    setMenuOpen(false);
    setSearchOpen(false);
  }, [setShopFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShopFilter('all');
      // Here you would optimally navigate to a shop search page, or set a search query context.
      // For now, we'll route to shop to reflect activity
      window.location.href = '/shop';
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || menuOpen
        ? 'bg-white shadow-sm border-b border-silk'
        : 'bg-white/95 backdrop-blur-sm'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex-shrink-0 flex w-32 md:w-48 justify-start">
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <Logo size="sm" />
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                to={link.page === 'home' ? '/' : `/${link.page}`}
                onClick={() => handleNav(link.filter)}
                className={`text-sm font-sans tracking-widest uppercase transition-colors duration-200 ${currentPage === link.page
                  ? 'text-ruby-red'
                  : 'text-dark-red/70 hover:text-dark-red'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 w-32 md:w-48 justify-end">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`hidden md:flex transition-colors ${searchOpen ? 'text-ruby-red' : 'text-dark-red/60 hover:text-dark-red'}`}
            >
              <Search size={18} className={searchOpen ? 'scale-110 transition-transform' : 'transition-transform'} />
            </button>
            <Link
              to="/chat"
              className={`text-dark-red/60 hover:text-ruby-red transition-colors relative ${currentPage === 'chat' ? 'text-dark-red' : ''}`}
              title="Chat with Beauty Advisor"
            >
              <MessageCircle size={18} />
            </Link>
            <Link
              to="/wishlist"
              className="relative text-dark-red/60 hover:text-ruby-red transition-colors"
            >
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-ruby-red text-white text-[10px] rounded-full flex items-center justify-center font-sans">
                  {wishlist.length}
                </span>
              )}
            </Link>
            {authStatus === 'loading' ? (
              <div className="w-[18px] h-[18px] rounded-full border-2 border-dark-red/20 border-t-dark-red/60 animate-spin" />
            ) : (
              <Link
                to={authStatus === 'authenticated' ? '/account' : '/signin'}
                className="text-dark-red/60 hover:text-dark-red transition-colors"
                title={authStatus === 'authenticated' ? 'My Account' : 'Sign In'}
              >
                <User size={18} />
              </Link>
            )}
            <Link
              to="/cart"
              className="relative text-dark-red/60 hover:text-dark-red transition-colors"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-dark-red text-silk text-[10px] rounded-full flex items-center justify-center font-sans">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="md:hidden text-dark-red/70 hover:text-dark-red"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <div
        className={`absolute top-full left-0 right-0 bg-white border-b border-silk transition-all duration-300 overflow-hidden shadow-sm ${searchOpen ? 'max-h-24 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}
      >
        <div className="max-w-3xl mx-auto px-6">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-3 text-grey-beige" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, ingredients, treatments..."
              className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-silk rounded focus:outline-none focus:border-dark-red/50 focus:ring-1 focus:ring-dark-red/30 transition-all font-sans text-sm text-dark-red placeholder:text-gray-400"
              autoFocus={searchOpen}
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="absolute right-3 text-gray-400 hover:text-dark-red transition-colors"
            >
              <X size={18} />
            </button>
          </form>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-silk px-6 py-4 space-y-3">
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              to={link.page === 'home' ? '/' : `/${link.page}`}
              onClick={() => handleNav(link.filter)}
              className="block w-full text-left text-sm font-sans tracking-widest uppercase text-dark-red/70 hover:text-ruby-red py-2 border-b border-silk-light transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
