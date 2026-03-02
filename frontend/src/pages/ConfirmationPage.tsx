import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, PackageX, ChevronRight, FileText, Check } from 'lucide-react';
import Footer from '../components/Footer';

export default function ConfirmationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { orders } = useApp();

    // We expect state from PaymentPage router navigation
    const state = location.state as { orderId: string, status: 'success' | 'failed' | 'cancelled' } | undefined;

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!state?.orderId) {
            navigate('/account');
        }
    }, [state, navigate]);

    if (!state?.orderId) {
        return null;
    }

    const order = orders.find(o => o._id === state.orderId);

    if (!order) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col pt-24 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-red"></div>
            </div>
        );
    }

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
        <div className="min-h-screen bg-neutral-50 flex flex-col pt-28">
            <div className="flex-1 max-w-4xl mx-auto w-full px-6 pb-16">

                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-12 sm:mb-16">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <StepIndicator step={1} title="Bag" active={false} complete={true} />
                        <div className="w-8 sm:w-16 h-[1px] bg-gray-300"></div>
                        <StepIndicator step={2} title="Shipping" active={false} complete={true} />
                        <div className="w-8 sm:w-16 h-[1px] bg-gray-300"></div>
                        <StepIndicator step={3} title="Payment" active={false} complete={true} />
                        <div className="w-8 sm:w-16 h-[1px] bg-gray-300"></div>
                        <StepIndicator step={4} title="Confirmation" active={true} complete={false} />
                    </div>
                </div>

                {/* Status Hero */}
                <div className="bg-white p-8 sm:p-12 mb-8 border border-silk shadow-sm text-center">
                    {state.status === 'success' || order.paymentStatus === 'paid' || order.paymentMethod === 'cod' ? (
                        <>
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} className="text-green-600" />
                            </div>
                            <h1 className="font-serif text-3xl sm:text-4xl text-dark-red mb-3">Order Confirmed!</h1>
                            <p className="font-sans text-gray-600 max-w-md mx-auto">
                                Thank you for your purchase. We have received your order and will begin processing it shortly.
                            </p>
                        </>
                    ) : state.status === 'failed' || order.paymentStatus === 'failed' ? (
                        <>
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle size={40} className="text-red-600" />
                            </div>
                            <h1 className="font-serif text-3xl sm:text-4xl text-dark-red mb-3">Payment Failed</h1>
                            <p className="font-sans text-gray-600 max-w-md mx-auto">
                                Unfortunately, we could not process your payment. Your order has been marked as failed.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <PackageX size={40} className="text-gray-600" />
                            </div>
                            <h1 className="font-serif text-3xl sm:text-4xl text-dark-red mb-3">Order Cancelled</h1>
                            <p className="font-sans text-gray-600 max-w-md mx-auto">
                                You cancelled the payment process. This pending order has been cancelled in our system.
                            </p>
                        </>
                    )}
                </div>

                {/* Details Section */}
                <div className="bg-white p-6 sm:p-10 border border-silk shadow-sm">
                    <div className="flex items-center gap-3 mb-8 border-b border-silk pb-6">
                        <FileText size={24} className="text-dark-red" />
                        <h2 className="font-serif text-2xl text-dark-red">Invoice Summary</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                        {/* Left Info */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-sans text-xs tracking-widest uppercase text-gray-400 mb-2">Order Information</h3>
                                <p className="font-sans text-sm text-gray-800"><span className="font-semibold">Order ID:</span> {order._id}</p>
                                <p className="font-sans text-sm text-gray-800"><span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p className="font-sans text-sm text-gray-800"><span className="font-semibold">Payment Method:</span> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                                {order.razorpayPaymentId && (
                                    <p className="font-sans text-sm text-gray-800"><span className="font-semibold">Transaction ID:</span> {order.razorpayPaymentId}</p>
                                )}
                            </div>

                            <div>
                                <h3 className="font-sans text-xs tracking-widest uppercase text-gray-400 mb-2">Shipping Details</h3>
                                <p className="font-sans text-sm text-gray-800 font-semibold">{order.shippingDetails.name}</p>
                                <p className="font-sans text-sm text-gray-800 max-w-[250px] leading-relaxed mt-1">
                                    {order.shippingDetails.address}<br />
                                    {order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.pincode}
                                </p>
                                <p className="font-sans text-sm text-gray-800 mt-2">Phone: +91 {order.shippingDetails.phone}</p>
                            </div>
                        </div>

                        {/* Right Summary */}
                        <div className="bg-neutral-50 p-6 border border-silk/50 rounded-sm">
                            <h3 className="font-sans text-xs tracking-widest uppercase text-gray-400 mb-4">Items Ordered</h3>

                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-3 border border-silk/30 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-silk-light shrink-0">
                                                <img src={item.product?.images?.[0] || 'https://via.placeholder.com/40'} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-serif text-sm text-dark-red line-clamp-1">{item.product?.name || 'Product'}</p>
                                                <p className="font-sans text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-sans text-sm font-semibold">₹{(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-silk pt-4 space-y-2">
                                <div className="flex justify-between font-sans text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{(order.totalAmount - (order.totalAmount < 999 ? 99 : 0)).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between font-sans text-sm text-gray-600">
                                    <span>Shipping</span>
                                    <span>{order.totalAmount < 999 ? '₹99' : 'Free'}</span>
                                </div>
                                <div className="flex justify-between font-serif text-xl text-dark-red mt-4 pt-4 border-t border-silk">
                                    <span>Total Amount</span>
                                    <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                        <button
                            onClick={() => navigate('/account')}
                            className="px-8 py-3 border border-silk text-dark-red font-sans text-xs tracking-widest uppercase hover:bg-neutral-50 transition-colors"
                        >
                            Back to Account
                        </button>
                        <button
                            onClick={() => navigate('/shop')}
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-dark-red text-silk font-sans text-xs tracking-widest uppercase hover:bg-ruby-red transition-colors shadow-md hover:shadow-lg"
                        >
                            Continue Shopping <ChevronRight size={16} />
                        </button>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}
