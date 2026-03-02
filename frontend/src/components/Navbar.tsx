import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ShoppingBag, Heart, User, Menu, X, Search, MessageCircle, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useApp } from '../context/AppContext';

type MegaMenuConfig = {
  label: string;
  filter: 'all' | 'skin' | 'hair' | 'other';
  subLabel?: string;
  items: { label: string; filter: string }[];
};

const MEGA_MENU_DATA: Record<string, MegaMenuConfig> = {
  skinCare: {
    label: "Skin Care",
    filter: "skin",
    subLabel: "View All Skin Care →",
    items: [
      { label: "Serums", filter: "serum" },
      { label: "Moisturizers", filter: "moisturizer" },
      { label: "Sunscreens", filter: "sunscreen" },
      { label: "Face Wash", filter: "cleanser" },
      { label: "Face & Body Wash", filter: "cleanser" },
      { label: "Gel", filter: "soothing_gel" },
      { label: "Acne Care", filter: "cleanser" }
    ]
  },
  hairCare: {
    label: "Hair Care",
    filter: "hair",
    subLabel: "View All Hair Care →",
    items: [
      { label: "Hair Serums", filter: "hair_serum" },
      { label: "Hair Oils", filter: "hair_oil" },
      { label: "Shampoos", filter: "shampoo" },
      { label: "Shampoo Bars", filter: "shampoo_bar" },
      { label: "Conditioner", filter: "conditioner" }
    ]
  },
  eyeLipMakeup: {
    label: "Eye Care, Lip Care & Makeup",
    filter: "other",
    subLabel: "View All Eye, Lip & Makeup →",
    items: [
      { label: "Eye Care", filter: "eye_care" },
      { label: "Under Eye Gel", filter: "eye_care" },
      { label: "Eye Cream", filter: "eye_care" },
      { label: "Lip Care", filter: "lip_balm" },
      { label: "Lip Balm", filter: "lip_balm" },
      { label: "Lip Tint", filter: "lip_balm" },
      { label: "Makeup", filter: "foundation" } // Defaulting to foundation for makeup till more items 
    ]
  },
  bath: {
    label: "Bath & Body (Soaps)",
    filter: "other",
    subLabel: "View All Bath & Body →",
    items: [
      { label: "Body Wash", filter: "cleanser" },
      { label: "Face & Body Wash", filter: "cleanser" },
      { label: "Herbal Soap", filter: "soap" },
      { label: "Bath Bars", filter: "soap" }
    ]
  }
};

const NAV_LINKS = [
  { label: 'Home', page: 'home' as const },
  { label: 'Shop', page: 'shop' as const, isMegaMenu: true },
  { label: 'Ritual Finder', page: 'ritual-finder' as const },
  { label: 'Our Story', page: 'about' as const },
];

export default function Navbar() {
  const { cartCount, wishlist, currentPage, authStatus, setShopFilter, products, navigateTo } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mega Menu State
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setMegaMenuOpen(false);
  }, [location.pathname]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return products.filter((p) => {
      const allIngredients = [
        ...(p.ingredients?.key_actives || []),
        ...(p.ingredients?.botanical_extracts || []),
        ...(p.ingredients?.others || [])
      ].join(' ').toLowerCase();

      return p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        allIngredients.includes(query);
    }).slice(0, 5);
  }, [searchQuery, products]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = useCallback((filter?: 'all' | 'skin' | 'hair' | 'other') => {
    if (filter) setShopFilter(filter);
    setMenuOpen(false);
    setSearchOpen(false);
    setMegaMenuOpen(false);
  }, [setShopFilter]);

  const handleMouseEnterMegaMenu = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setMegaMenuOpen(true);
  };

  const handleMouseLeaveMegaMenu = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 150);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShopFilter('all');
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
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
              <div
                key={link.label}
                className="relative h-full flex items-center"
                onMouseEnter={link.isMegaMenu ? handleMouseEnterMegaMenu : undefined}
                onMouseLeave={link.isMegaMenu ? handleMouseLeaveMegaMenu : undefined}
              >
                <Link
                  to={link.page === 'home' ? '/' : `/${link.page}`}
                  onClick={() => handleNav('filter' in link ? link.filter as any : undefined)}
                  className={`flex items-center gap-1 text-sm font-sans tracking-widest uppercase transition-colors duration-200 py-6 ${currentPage === link.page || (link.isMegaMenu && megaMenuOpen)
                    ? 'text-ruby-red'
                    : 'text-dark-red/70 hover:text-dark-red'
                    }`}
                >
                  {link.label}
                  {link.isMegaMenu && (
                    <ChevronDown size={14} className={`transition-transform duration-300 ${megaMenuOpen ? 'rotate-180' : ''}`} />
                  )}
                </Link>

                {/* Mega Menu Dropdown */}
                {link.isMegaMenu && (
                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 w-screen max-w-7xl bg-white border-b border-silk transition-all duration-300 ease-in-out shadow-sm origin-top overflow-hidden ${megaMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
                      }`}
                    style={{ maxHeight: '600px' }}
                  >
                    <div className="mx-auto px-8 py-10 grid grid-cols-4 gap-8">
                      {Object.entries(MEGA_MENU_DATA).map(([key, section]) => (
                        <div key={key} className="flex flex-col h-full border-r border-silk-light last:border-r-0 pr-6">
                          <h3 className="font-serif text-dark-red text-lg mb-4">{section.label}</h3>
                          <ul className="space-y-3 flex-1">
                            {section.items.map((item, idx) => (
                              <li key={idx}>
                                <Link
                                  to={`/shop?filter=${section.filter}&sub=${item.filter}`}
                                  onClick={() => handleNav(section.filter)}
                                  className="text-sm font-sans text-grey-beige hover:text-ruby-red transition-colors inline-block relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-ruby-red hover:after:w-full after:transition-all after:duration-300"
                                >
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>

                          {section.subLabel && (
                            <Link
                              to={`/shop?filter=${section.filter}`}
                              onClick={() => handleNav(section.filter)}
                              className="mt-6 text-xs font-sans font-medium tracking-widest uppercase text-ruby-red hover:text-dark-red transition-colors"
                            >
                              {section.subLabel}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
        className={`absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-silk transition-all duration-500 ease-in-out overflow-hidden shadow-sm ${searchOpen
          ? (searchQuery.trim() && searchResults.length > 0 ? 'max-h-[600px] py-4 opacity-100' : 'max-h-24 py-4 opacity-100')
          : 'max-h-0 py-0 opacity-0 border-transparent shadow-none'
          }`}
      >
        <div className="max-w-3xl mx-auto px-6">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-3 text-grey-beige" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, ingredients, treatments..."
              className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 backdrop-blur-sm border border-silk rounded focus:outline-none focus:border-dark-red/50 focus:ring-1 focus:ring-dark-red/30 transition-all font-sans text-sm text-dark-red placeholder:text-gray-400"
              autoFocus={searchOpen}
            />
            <button
              type="button"
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              className="absolute right-3 text-gray-400 hover:text-dark-red transition-colors"
            >
              <X size={18} />
            </button>
          </form>

          {/* Search Results Dropdown */}
          <div className={`transition-all duration-300 ease-in-out flex flex-col ${searchQuery.trim() && searchResults.length > 0 ? 'opacity-100 mt-4 translate-y-0' : 'opacity-0 h-0 overflow-hidden -translate-y-4'}`}>
            <div className="bg-white/80 backdrop-blur-md border flex flex-col border-silk rounded shadow-sm">
              {searchResults.map(p => (
                <button
                  key={p.pid}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                    navigateTo('product', p.pid);
                  }}
                  className="w-full flex items-center gap-4 p-3 hover:bg-neutral-50 transition-colors text-left border-b border-silk last:border-b-0"
                >
                  <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-serif text-dark-red text-base leading-tight">{p.name}</h4>
                    <p className="text-[10px] font-sans text-grey-beige uppercase tracking-wider mt-1">{p.category} care</p>
                  </div>
                  <span className="font-sans text-sm text-dark-red">${p.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setShopFilter('all');
                navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                setSearchOpen(false);
                setSearchQuery('');
              }}
              className="w-full text-center py-3 mt-2 text-xs font-sans tracking-widest uppercase text-ruby-red hover:text-dark-red transition-colors"
            >
              View all results for "{searchQuery}"
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-silk overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          <div className="px-6 py-4">
            {NAV_LINKS.map(link => (
              <div key={link.label} className="border-b border-silk-light last:border-b-0 py-1">
                {link.isMegaMenu ? (
                  // Mobile Accordion for Mega Menu items
                  <div className="space-y-1">
                    <button
                      onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                      className="w-full flex items-center justify-between text-left text-sm font-sans font-medium tracking-widest uppercase text-dark-red py-3"
                    >
                      {link.label}
                      <ChevronDown size={16} className={`transition-transform duration-300 text-ruby-red ${megaMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${megaMenuOpen ? 'max-h-[1000px] opacity-100 pb-3' : 'max-h-0 opacity-0'}`}>
                      <div className="pl-4 space-y-5 border-l-2 border-silk-light ml-2">
                        {Object.entries(MEGA_MENU_DATA).map(([key, section]) => (
                          <div key={key}>
                            <h4 className="font-serif text-dark-red text-base mb-2">{section.label}</h4>
                            <ul className="space-y-2">
                              {section.items.map((item, idx) => (
                                <li key={idx}>
                                  <Link
                                    to={`/shop?filter=${section.filter}&sub=${item.filter}`}
                                    onClick={() => handleNav(section.filter)}
                                    className="block text-sm font-sans text-grey-beige hover:text-ruby-red transition-colors py-1"
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <Link
                              to={`/shop?filter=${section.filter}`}
                              onClick={() => handleNav(section.filter)}
                              className="block mt-3 text-xs font-sans tracking-widest uppercase text-ruby-red"
                            >
                              {section.subLabel || `View All ${section.label} →`}
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={link.page === 'home' ? '/' : `/${link.page}`}
                    onClick={() => handleNav('filter' in link ? link.filter as any : undefined)}
                    className="block w-full text-left text-sm font-sans font-medium tracking-widest uppercase text-dark-red/80 hover:text-ruby-red py-3 transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
