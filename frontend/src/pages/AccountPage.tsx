import { User, Package, Heart, MapPin, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Footer from '../components/Footer';

export default function AccountPage() {
  const { navigateTo, wishlist, cartItems } = useApp();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 pt-28 pb-16">
        <h1 className="font-serif text-dark-red text-4xl mb-10">My Account</h1>

        <div className="bg-silk-light p-6 mb-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-dark-red/10 flex items-center justify-center">
            <User size={28} className="text-dark-red/40" />
          </div>
          <div>
            <h2 className="font-serif text-dark-red text-xl">Welcome Back</h2>
            <p className="font-sans text-grey-beige text-sm mt-1">
              Sign in to view your orders, wishlist, and profile
            </p>
          </div>
          <button className="ml-auto flex items-center gap-2 bg-dark-red text-silk px-6 py-3 font-sans text-xs tracking-widest uppercase hover:bg-ruby-red transition-colors">
            <LogIn size={14} /> Sign In
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              Icon: Package,
              title: 'My Orders',
              desc: 'Track and manage your orders',
              count: null,
              action: () => {},
            },
            {
              Icon: Heart,
              title: 'Wishlist',
              desc: `${wishlist.length} saved item${wishlist.length !== 1 ? 's' : ''}`,
              count: wishlist.length,
              action: () => navigateTo('wishlist'),
            },
            {
              Icon: User,
              title: 'Profile',
              desc: 'Manage your personal info',
              count: null,
              action: () => {},
            },
            {
              Icon: MapPin,
              title: 'Addresses',
              desc: 'Manage delivery addresses',
              count: null,
              action: () => {},
            },
          ].map(({ Icon, title, desc, count, action }) => (
            <button
              key={title}
              onClick={action}
              className="group bg-white border border-silk hover:border-dark-red p-6 text-left transition-colors"
            >
              <div className="w-10 h-10 bg-silk-light flex items-center justify-center mb-4 group-hover:bg-dark-red/10 transition-colors">
                <Icon size={18} className="text-dark-red/60 group-hover:text-dark-red transition-colors" />
              </div>
              <div className="flex items-start justify-between">
                <h3 className="font-serif text-dark-red text-base">{title}</h3>
                {count !== null && count > 0 && (
                  <span className="bg-ruby-red text-white text-[10px] font-sans w-5 h-5 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </div>
              <p className="font-sans text-grey-beige text-xs mt-1">{desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="font-serif text-dark-red text-2xl mb-6">Recently Viewed</h2>
          <div className="bg-silk-light p-8 text-center">
            <p className="font-sans text-grey-beige text-sm">
              Sign in to see your recently viewed products
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
