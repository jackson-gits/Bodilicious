import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Check, CreditCard, ShieldCheck, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';

// Load Razorpay Script dynamically
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function PaymentPage() {
    const { cartItems, cartTotal, checkout, verifyPayment, user, navigateTo } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);

    // Card details state
    const [cardDetails, setCardDetails] = useState({
        name: '',
        number: '',
        expiry: '',
        cvv: ''
    });
    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

    // Retrieve shipping details from navigation state
    const shippingDetails = location.state?.shippingDetails;

    useEffect(() => {
        window.scrollTo(0, 0);
        // Force redirect if accessed without shipping details
        if (!shippingDetails) {
            navigate('/cart');
        }
        loadRazorpayScript();
    }, [shippingDetails, navigate]);

    if (!shippingDetails) return null;

    const validCartItems = cartItems.filter(item => item && item.product);
    const shippingCost = cartTotal >= 999 ? 0 : 99;
    const total = cartTotal + shippingCost;

    const isCardValid = () => {
        return cardDetails.name.trim().length > 0 &&
            cardDetails.number.replace(/\s/g, '').length === 16 &&
            cardDetails.expiry.length === 5 &&
            cardDetails.cvv.length >= 3;
    };

    const isFormValid = paymentMethod !== 'card' || isCardValid();

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        if (formatted.length <= 19) {
            setCardDetails(prev => ({ ...prev, number: formatted }));
        }
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        if (val.length <= 5) {
            setCardDetails(prev => ({ ...prev, expiry: val }));
        }
    };

    const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length <= 4) {
            setCardDetails(prev => ({ ...prev, cvv: val }));
        }
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsProcessing(true);

        try {
            const backendPaymentMethod = paymentMethod === 'cod' ? 'cod' : 'razorpay';
            const { razorpayOrder } = await checkout(shippingDetails, backendPaymentMethod);

            if (backendPaymentMethod === 'cod') {
                navigateTo('account');
            } else {
                if (!razorpayOrder) {
                    throw new Error("Razorpay order details not received");
                }

                // Initialize Razorpay
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummy",
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    name: "Bodilicious",
                    description: "Premium Herbal Beauty",
                    order_id: razorpayOrder.id,
                    handler: async function (response: any) {
                        try {
                            await verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
                            navigateTo('account');
                        } catch (err: any) {
                            alert(err.message || 'Payment verification failed');
                            setIsProcessing(false);
                            navigateTo('account'); // Navigate anyway so they can see "failed" order
                        }
                    },
                    prefill: {
                        name: shippingDetails.name,
                        email: shippingDetails.email || user?.email || "",
                        contact: shippingDetails.phone,
                    },
                    theme: {
                        color: "#8B0000",
                    },
                    modal: {
                        ondismiss: async function () {
                            setIsProcessing(false);
                            try {
                                await cancelOrder(razorpayOrder.receipt.replace('rcpt_', ''));
                            } catch (e) {
                                console.error("Failed to quickly cancel order", e);
                            }
                            alert("Payment cancelled. The pending order has been cancelled.");
                            navigateTo('account');
                        }
                    }
                };

                const paymentObject = new (window as any).Razorpay(options);
                paymentObject.open();
            }
        } catch (err: any) {
            alert(err.message || 'Payment processing failed');
            setIsProcessing(false);
        }
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
                        <StepIndicator step={2} title="Shipping" active={false} complete={true} />
                        <div className="w-8 sm:w-16 h-[1px] bg-gray-300"></div>
                        <StepIndicator step={3} title="Payment" active={true} complete={false} />
                        <div className="w-8 sm:w-16 h-[1px] bg-gray-300"></div>
                        <StepIndicator step={4} title="Confirmation" active={false} complete={false} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* 2. Left Section - Payment Form */}
                    <div className="lg:col-span-7">
                        <h1 className="font-serif text-3xl text-dark-red mb-8">Payment Method</h1>

                        <form onSubmit={handlePlaceOrder} className="space-y-6">

                            {/* Payment Options Accordion */}
                            <div className="border border-silk rounded-sm overflow-hidden bg-white shadow-sm">

                                {/* Credit/Debit Card */}
                                <div className="border-b border-silk">
                                    <label className="flex items-center p-5 cursor-pointer hover:bg-neutral-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                            className="w-4 h-4 text-dark-red focus:ring-dark-red"
                                        />
                                        <div className="ml-4 flex items-center justify-between w-full">
                                            <span className="font-sans text-sm tracking-wide text-gray-800">Credit / Debit Card</span>
                                            <div className="flex gap-1 opacity-60">
                                                {/* Card icons mock */}
                                                <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                                <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </label>

                                    {/* Card Details Form */}
                                    <div className={`px-5 pb-5 transition-all duration-300 overflow-hidden \${paymentMethod === 'card' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 p-0 hidden'}`}>
                                        <div className="space-y-4 pt-4 border-t border-silk">
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Cardholder Name"
                                                    value={cardDetails.name}
                                                    onChange={e => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full p-3 border border-silk rounded-sm font-sans text-sm focus:outline-none focus:border-dark-red focus:ring-1 focus:ring-dark-red/20 transition-all bg-neutral-50"
                                                />
                                            </div>
                                            <div>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Card Number"
                                                        value={cardDetails.number}
                                                        onChange={handleCardNumberChange}
                                                        className="w-full p-3 pl-10 border border-silk rounded-sm font-sans text-sm focus:outline-none focus:border-dark-red focus:ring-1 focus:ring-dark-red/20 transition-all bg-neutral-50"
                                                    />
                                                    <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    value={cardDetails.expiry}
                                                    onChange={handleExpiryChange}
                                                    className="w-full p-3 border border-silk rounded-sm font-sans text-sm focus:outline-none focus:border-dark-red focus:ring-1 focus:ring-dark-red/20 transition-all bg-neutral-50"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="CVV"
                                                    value={cardDetails.cvv}
                                                    onChange={handleCVVChange}
                                                    className="w-full p-3 border border-silk rounded-sm font-sans text-sm focus:outline-none focus:border-dark-red focus:ring-1 focus:ring-dark-red/20 transition-all bg-neutral-50"
                                                />
                                            </div>
                                            <div className="pt-2">
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <div className="w-4 h-4 border border-silk rounded-sm flex items-center justify-center group-hover:border-dark-red transition-colors">
                                                        <Check size={12} className="text-dark-red opacity-0 group-hover:opacity-100" />
                                                    </div>
                                                    <span className="font-sans text-xs text-gray-500">Save card for future purchases securely</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* UPI */}
                                <div className="border-b border-silk">
                                    <label className="flex items-center p-5 cursor-pointer hover:bg-neutral-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="upi"
                                            checked={paymentMethod === 'upi'}
                                            onChange={() => setPaymentMethod('upi')}
                                            className="w-4 h-4 text-dark-red focus:ring-dark-red"
                                        />
                                        <div className="ml-4 flex items-center w-full">
                                            <span className="font-sans text-sm tracking-wide text-gray-800">UPI (GPay, PhonePe, Paytm)</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Net Banking */}
                                <div className="border-b border-silk">
                                    <label className="flex items-center p-5 cursor-pointer hover:bg-neutral-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="netbanking"
                                            checked={paymentMethod === 'netbanking'}
                                            onChange={() => setPaymentMethod('netbanking')}
                                            className="w-4 h-4 text-dark-red focus:ring-dark-red"
                                        />
                                        <div className="ml-4 flex items-center w-full">
                                            <span className="font-sans text-sm tracking-wide text-gray-800">Net Banking</span>
                                        </div>
                                    </label>
                                </div>

                                {/* COD */}
                                <div>
                                    <label className="flex items-center p-5 cursor-pointer hover:bg-neutral-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                            className="w-4 h-4 text-dark-red focus:ring-dark-red"
                                        />
                                        <div className="ml-4 flex items-center w-full">
                                            <span className="font-sans text-sm tracking-wide text-gray-800">Cash on Delivery</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Billing Address Option */}
                            <div className="pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={billingSameAsShipping}
                                        onChange={() => setBillingSameAsShipping(!billingSameAsShipping)}
                                        className="w-4 h-4 text-dark-red rounded-sm border-silk focus:ring-dark-red"
                                    />
                                    <span className="font-sans text-sm text-gray-700">Billing address same as shipping</span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={!isFormValid || isProcessing}
                                    className={`w-full py-4 text-silk font-sans text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all \${
                                        !isFormValid || isProcessing 
                                            ? 'bg-gray-300 cursor-not-allowed' 
                                            : 'bg-dark-red hover:bg-ruby-red shadow-md hover:shadow-lg'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-silk/30 border-t-silk rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>Place Order (₹{total.toLocaleString('en-IN')}) <ChevronRight size={16} /></>
                                    )}
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

                            <div className="mt-8 flex items-center justify-center gap-2 text-green-700 bg-green-50/50 p-3 rounded-sm border border-green-100">
                                <ShieldCheck size={18} />
                                <span className="font-sans text-xs font-medium tracking-wide">100% Secure Payment. 256-bit SSL Encryption.</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}
