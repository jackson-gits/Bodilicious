import { User, Package, Heart, MapPin, LogIn, LogOut, ChevronRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import Footer from '../components/Footer';

export default function AccountPage() {
  const { navigateTo, wishlist, orders, recentlyBought, user, authStatus, logout, updateUserProfile } = useApp();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.displayName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        displayName: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
        city: profileForm.city,
        state: profileForm.state,
        pincode: profileForm.pincode
      });
      setShowProfileForm(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 pt-28 pb-16">
        <h1 className="font-serif text-dark-red text-4xl mb-10">My Account</h1>

        <div className="bg-silk-light p-6 mb-8 flex items-center gap-5 border border-silk/30">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border border-silk shadow-sm">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-dark-red/40" />
            )}
          </div>
          <div>
            <h2 className="font-serif text-dark-red text-xl">
              {authStatus === 'authenticated' && user ? `Welcome, ${user.displayName || 'Beautiful'}` : 'Welcome Back'}
            </h2>
            <p className="font-sans text-grey-beige text-sm mt-1">
              {authStatus === 'authenticated' && user
                ? user.email
                : 'Sign in to view your orders, wishlist, and profile'}
            </p>
          </div>

          {authStatus === 'authenticated' ? (
            <button
              onClick={logout}
              className="ml-auto flex items-center gap-2 border border-silk text-dark-red px-6 py-3 font-sans text-xs tracking-widest uppercase hover:border-dark-red transition-colors bg-white hover:bg-silk-light"
            >
              <LogOut size={14} /> Sign Out
            </button>
          ) : (
            <button
              onClick={() => navigateTo('signin')}
              className="ml-auto flex items-center gap-2 bg-dark-red text-silk px-6 py-3 font-sans text-xs tracking-widest uppercase hover:bg-ruby-red transition-colors"
            >
              <LogIn size={14} /> Sign In
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              Icon: Package,
              title: 'My Orders',
              desc: authStatus === 'authenticated' ? `${orders.length} order${orders.length !== 1 ? 's' : ''}` : 'Track and manage your orders',
              count: authStatus === 'authenticated' ? orders.length : null,
              action: () => navigateTo('tracking'),
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
              action: () => {
                if (authStatus === 'authenticated') {
                  // Pre-fill form if opening
                  setProfileForm({
                    name: user?.displayName || '',
                    phone: user?.phone || '',
                    address: user?.address || '',
                    city: user?.city || '',
                    state: user?.state || '',
                    pincode: user?.pincode || '',
                  });
                  setShowProfileForm(true);
                } else {
                  navigateTo('signin');
                }
              },
            },
            {
              Icon: MapPin,
              title: 'Addresses',
              desc: 'Manage delivery addresses',
              count: null,
              action: () => { },
            },
          ].map(({ Icon, title, desc, count, action }) => (
            <button
              key={title}
              onClick={action}
              className="group bg-white border border-silk hover:border-dark-red p-6 text-left transition-colors relative overflow-hidden"
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

              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-dark-red">
                <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="font-serif text-dark-red text-2xl mb-6">Recently Bought</h2>

          {authStatus === 'authenticated' ? (
            recentlyBought.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentlyBought.map((product) => (
                  <button
                    key={product.pid}
                    onClick={() => navigateTo('shop')}
                    className="bg-silk-light p-4 flex flex-col items-center group cursor-pointer border border-transparent hover:border-dark-red/20 transition-all text-left"
                  >
                    <div className="w-full aspect-[4/5] overflow-hidden mb-4 bg-white">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="w-full">
                      <h3 className="font-serif text-dark-red text-sm mb-1 line-clamp-1">{product.name}</h3>
                      <p className="font-sans text-xs text-grey-beige uppercase tracking-wider">{product.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-silk-light p-8 text-center border border-silk/30">
                <p className="font-sans text-grey-beige text-sm">
                  You haven't purchased any products recently. <button onClick={() => navigateTo('shop')} className="text-dark-red hover:text-ruby-red underline decoration-silk underline-offset-4">Explore our collection</button>
                </p>
              </div>
            )
          ) : (
            <div className="bg-silk-light p-8 text-center border border-silk/30">
              <p className="font-sans text-grey-beige text-sm">
                Sign in to see your recently bought products
              </p>
            </div>
          )}
        </div>

        {/* PROFILE MODAL / FORM */}
        {showProfileForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white max-w-lg w-full p-8 relative shadow-xl">
              <button
                onClick={() => setShowProfileForm(false)}
                className="absolute top-4 right-4 text-grey-beige hover:text-dark-red"
              >
                <X size={20} />
              </button>

              <h2 className="font-serif text-dark-red text-2xl mb-6">Edit Profile</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block font-sans text-xs text-dark-red mb-1">Full Name</label>
                  <input required type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full p-2 border border-silk bg-white font-sans text-sm outline-none focus:border-dark-red" />
                </div>
                <div>
                  <label className="block font-sans text-xs text-dark-red mb-1">Phone Number</label>
                  <input required type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full p-2 border border-silk bg-white font-sans text-sm outline-none focus:border-dark-red" />
                </div>
                <div>
                  <label className="block font-sans text-xs text-dark-red mb-1">Street Address</label>
                  <input required type="text" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} className="w-full p-2 border border-silk bg-white font-sans text-sm outline-none focus:border-dark-red" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans text-xs text-dark-red mb-1">City</label>
                    <input required type="text" value={profileForm.city} onChange={e => setProfileForm({ ...profileForm, city: e.target.value })} className="w-full p-2 border border-silk bg-white font-sans text-sm outline-none focus:border-dark-red" />
                  </div>
                  <div>
                    <label className="block font-sans text-xs text-dark-red mb-1">State</label>
                    <input required type="text" value={profileForm.state} onChange={e => setProfileForm({ ...profileForm, state: e.target.value })} className="w-full p-2 border border-silk bg-white font-sans text-sm outline-none focus:border-dark-red" />
                  </div>
                </div>
                <div>
                  <label className="block font-sans text-xs text-dark-red mb-1">Pincode</label>
                  <input required type="text" value={profileForm.pincode} onChange={e => setProfileForm({ ...profileForm, pincode: e.target.value })} className="w-full p-2 border border-silk bg-white font-sans text-sm outline-none focus:border-dark-red" />
                </div>

                <button type="submit" className="w-full mt-6 bg-dark-red text-silk py-3 font-sans text-xs tracking-widest uppercase hover:bg-ruby-red transition-colors">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
