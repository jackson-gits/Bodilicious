import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Check, ChevronRight, Truck } from 'lucide-react';
import Footer from '../components/Footer';

export default function ShippingPage() {
    const { cartItems, cartTotal, user } = useApp();
    const navigate = useNavigate();

    const [shippingDetails, setShippingDetails] = useState({
        name: user?.displayName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        pincode: user?.pincode || ''
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        if (user) {
            setShippingDetails(prev => ({
                name: prev.name || user.displayName || '',
                email: prev.email || user.email || '',
                phone: prev.phone || user.phone || '',
                address: prev.address || user.address || '',
                city: prev.city || user.city || '',
                state: prev.state || user.state || '',
                pincode: prev.pincode || user.pincode || ''
            }));
        }
    }, [user]);

    const validCartItems = cartItems.filter(item => item && item.product);

    // Check if cart is empty
    useEffect(() => {
        if (validCartItems.length === 0) {
            navigate('/cart');
        }
    }, [validCartItems.length, navigate]);

    if (validCartItems.length === 0) return null;

    const shippingCost = cartTotal >= 999 ? 0 : 99;
    const total = cartTotal + shippingCost;

    const isFormValid = Object.values(shippingDetails).every(val => val.trim().length > 0);

    const handleContinueToPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        navigate('/payment', { state: { shippingDetails } });
    };

    const StepIndicator = ({ step, title, active, complete }: { step: number, title: string, active: boolean, complete: boolean }) => (
        <div className={`flex items-center gap-2 ${active ? 'text-dark-red' : complete ? 'text-green-700' : 'text-gray-300'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${active ? 'border-dark-red text-dark-red' :
                    complete ? 'bg-green-700 border-green-700 text-white' :
                        'border-gray-300 text-gray-300'
                }`}>
                {complete ? <Check size={12} strokeWidth={3} /> : step}
            </div>
            <span className={`font-sans text-xs tracking-widest uppercase hidden sm:block ${active ? 'font-bold' : ''}`}>
                {title}
            </span>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col pt-24">
            <div className="flex-1 max-w-6xl mx-auto w-full px-6 pb-16">

                {/* 1. Step Indicator */}
                <div className="flex items-center justify-center mb-12 sm:mb-16">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <StepIndicator step={1} title="Bag" active={false} complete={true} />
                        <div className="w-8 sm:w-16 h-[1px] bg-gray-300"></div>
                        <StepIndicator step={2} title="Shipping" active={true} complete={false} />
                        <div className="w-8 sm:w-16 h-[1px] bg-gray-300"></div>
                        <StepIndicator step={3} title="Payment" active={false} complete={false} />
                        <div className="w-8 sm:w-16 h-[1px] bg-gray-300"></div>
                        <StepIndicator step={4} title="Confirmation" active={false} complete={false} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* 2. Left Section - Shipping Form */}
                    <div className="lg:col-span-7">
                        <h1 className="font-serif text-3xl text-dark-red mb-8">Shipping Address</h1>

                        <form onSubmit={handleContinueToPayment} className="space-y-6">
                            <div className="bg-white border border-silk p-6 sm:p-8 shadow-sm">
                                <div className="space-y-4">
                                    <h3 className="font-serif text-dark-red text-lg mb-4 hidden">Shipping Details</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input
                                            required
                                            type="text"
                                            placeholder="Full Name"
                                            value={shippingDetails.name}
                                            onChange={e => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                                            className="w-full p-3 border border-silk bg-neutral-50 font-sans text-sm focus:outline-none focus:border-dark-red focus:ring-1 focus:ring-dark-red/20 transition-all rounded-sm"
                                        />
                                        <input
                                            required
                                            type="email"
                                            placeholder="Email"
                                            value={shippingDetails.email}
                                            onChange={e => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                                            className="w-full p-3 border border-silk bg-neutral-50 font-sans text-sm focus:outline-none focus:border-dark-red focus:ring-1 focus:ring-dark-red/20 transition-all rounded-sm"
                                        />
                                    </div>

                                    <input
                                        required
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={shippingDetails.phone}
                                        onChange={e => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                                        className="w-full p-3 border border-silk bg-neutral-50 font-sans text-sm focus:outline-none focus:border-dark-red focus:ring-1 focus:ring-dark-red/20 transition-all rounded-sm"
                                    />

                                    <input
                                        required
                                        type="text"
                                        placeholder="Street Address, Apartment, Suite, etc."
                                        value={shippingDetails.address}
                                        onChange={e => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                                        className="w-full p-3 border border-silk bg-neutral-50 font-sans text-sm focus:outline-none focus:border-dark-red focus:ring-1 focus:ring-dark-red/20 transition-all rounded-sm"
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <input
                                            required
                                            type="text"
                                            placeholder="City"
                                            value={shippingDetails.city}
                                            onChange={e => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                                            className="w-full p-3 border border-silk bg-neutral-50 font-sans text-sm focus:outline-none focus:border-dark-red focus:ring-1 focus:ring-dark-red/20 transition-all rounded-sm"
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="State"
                                            value={shippingDetails.state}
                                            onChange={e => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                                            className="w-full p-3 border border-silk bg-neutral-50 font-sans text-sm focus:outline-none focus:border-dark-red focus:ring-1 focus:ring-dark-red/20 transition-all rounded-sm"
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Pincode"
                                            value={shippingDetails.pincode}
                                            onChange={e => setShippingDetails({ ...shippingDetails, pincode: e.target.value })}
                                            className="w-full p-3 border border-silk bg-neutral-50 font-sans text-sm focus:outline-none focus:border-dark-red focus:ring-1 focus:ring-dark-red/20 transition-all rounded-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/cart')}
                                    className="w-1/3 py-4 border border-silk text-dark-red font-sans text-sm tracking-widest uppercase hover:bg-silk-light transition-all flex items-center justify-center rounded-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isFormValid}
                                    className={`w-2/3 py-4 text-silk font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all rounded-sm \${
                                        !isFormValid 
                                            ? 'bg-gray-300 cursor-not-allowed' 
                                            : 'bg-dark-red hover:bg-ruby-red shadow-md hover:shadow-lg'
                                    }`}
                                >
                                    Continue to Payment <ChevronRight size={16} />
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* 3. Right Section - Order Summary */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-28 bg-white border border-silk p-6 shadow-sm rounded-sm">
                            <h2 className="font-serif text-xl text-dark-red mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                {validCartItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-16 h-20 bg-silk-light shrink-0">
                                            <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h3 className="font-serif text-sm text-dark-red truncate">{item.product.name}</h3>
                                            <p className="font-sans text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="shrink-0 flex items-center font-sans text-sm font-semibold text-gray-900">
                                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-silk pt-4 space-y-3 font-sans text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className={shippingCost === 0 ? 'text-green-700 font-medium' : 'text-gray-900'}>
                                        {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-silk mt-4 pt-4 flex justify-between font-serif text-xl text-dark-red">
                                <span>Total</span>
                                <span>₹{total.toLocaleString('en-IN')}</span>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-2 text-dark-red bg-red-50/50 p-3 rounded-sm border border-red-100">
                                <Truck size={18} />
                                <span className="font-sans text-xs font-medium tracking-wide">Free standard shipping on orders over ₹999.</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}
