import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import {
    ArrowLeft,
    Package,
    CheckCircle2,
    Clock,
    RefreshCw,
    AlertCircle,
    FileText,
    Printer
} from 'lucide-react';
import { TimelineEvent } from '../types';

export default function OrderDetailsPage() {
    const { orders, selectedOrderId, navigateTo, getAuthHeaders, updateOrderAddress } = useApp();
    const [order, setOrder] = useState<Order | null>(null);

    // Tracking state
    const [trackingData, setTrackingData] = useState<{
        status: string;
        expectedDelivery: string;
        timeline: TimelineEvent[];
    } | null>(null);
    const [isTrackingLoading, setIsTrackingLoading] = useState(false);
    const [trackingError, setTrackingError] = useState('');

    // Editing Address state
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [editForm, setEditForm] = useState<{
        name: string;
        phone: string;
        email: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
    }>({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    const fetchTracking = async (currentOrder: Order) => {
        setIsTrackingLoading(true);
        setTrackingError('');
        setTrackingData(null);

        try {
            if (!currentOrder.awb) {
                if (currentOrder.orderStatus === 'cancelled') {
                    setTrackingData({
                        status: 'Cancelled',
                        expectedDelivery: 'N/A',
                        timeline: [
                            { status: 'Order Confirmed', location: 'System', date: new Date(currentOrder.createdAt).toLocaleDateString(), completed: true },
                            { status: 'Cancelled', location: 'System', date: '', completed: true }
                        ]
                    });
                    return;
                }

                setTrackingData({
                    status: currentOrder.orderStatus.charAt(0).toUpperCase() + currentOrder.orderStatus.slice(1),
                    expectedDelivery: 'Soon',
                    timeline: [
                        { status: 'Order Confirmed', location: 'System', date: new Date(currentOrder.createdAt).toLocaleDateString(), completed: true },
                        { status: 'Processing', location: 'Warehouse', date: '', completed: false },
                        { status: 'Shipped', location: '', date: '', completed: false },
                        { status: 'Out for Delivery', location: '', date: '', completed: false },
                        { status: 'Delivered', location: '', date: '', completed: false }
                    ]
                });
                return;
            }

            const headers = await getAuthHeaders();
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/orders/shiprocket/${currentOrder.awb}`, { headers });
            const data = await res.json();

            if (!res.ok) {
                if (currentOrder.orderStatus === 'cancelled') {
                    setTrackingData({
                        status: 'Cancelled', expectedDelivery: 'N/A',
                        timeline: [
                            { status: 'Order Confirmed', location: 'System', date: new Date(currentOrder.createdAt).toLocaleDateString(), completed: true },
                            { status: 'Cancelled', location: 'System', date: '', completed: true }
                        ]
                    });
                    return;
                }
                throw new Error(data.message || 'Failed to fetch tracking details');
            }

            setTrackingData(data.data);
        } catch (err: any) {
            setTrackingError(err.message || 'An error occurred while tracking your order');
            setTrackingData({
                status: currentOrder.orderStatus, expectedDelivery: 'Pending',
                timeline: [
                    { status: 'Order Confirmed', location: 'System', date: new Date(currentOrder.createdAt).toLocaleDateString(), completed: true },
                    { status: 'Pending Tracking Update', location: '', date: '', completed: false }
                ]
            });
        } finally {
            setIsTrackingLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedOrderId) {
            navigateTo('tracking');
            return;
        }

        const foundOrder = orders.find(o => o._id === selectedOrderId);
        if (foundOrder) {
            setOrder(foundOrder);
            setEditForm({
                name: foundOrder.shippingDetails?.name || '',
                phone: foundOrder.shippingDetails?.phone || '',
                email: foundOrder.shippingDetails?.email || '',
                address: foundOrder.shippingDetails?.address || '',
                city: foundOrder.shippingDetails?.city || '',
                state: foundOrder.shippingDetails?.state || '',
                pincode: foundOrder.shippingDetails?.pincode || ''
            });

            fetchTracking(foundOrder);
        } else {
            navigateTo('tracking');
        }
    }, [selectedOrderId, orders, navigateTo]);

    const handleSaveAddress = async () => {
        if (!order) return;
        setIsSavingAddress(true);
        try {
            const updatedOrder = await updateOrderAddress(order._id, editForm);
            setOrder(updatedOrder);
            setIsEditingAddress(false);
        } catch (err: any) {
            alert(err.message || "Failed to save address");
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    if (!order) return null;

    // Badge styling helpers
    const getPaymentBadge = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'paid') return 'bg-green-100 text-green-800 border-green-200';
        if (s === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getFulfillmentBadge = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'delivered' || s === 'shipped') return 'bg-green-100 text-green-800 border-green-200';
        if (s === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    };

    const subtotal = order.totalAmount;
    const taxes = Math.round(subtotal * 0.18); // Example GST
    const basePrice = subtotal - taxes;
    const shipping = 0;
    const total = subtotal + shipping;

    const HorizontalTimeline = ({ timeline, status }: { timeline: TimelineEvent[], status: string }) => {
        const isErrorState = status.toLowerCase() === 'cancelled' || status.toLowerCase().includes('fail');
        const activeColor = isErrorState ? 'bg-red-500' : 'bg-[#e77600]';

        return (
            <div className="w-full mt-4 mb-8 hidden sm:block print:hidden">
                <div className="relative flex justify-between items-center mb-8 px-8">
                    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-200 -z-10"></div>
                    {timeline.length > 0 && (
                        <div
                            className={`absolute left-8 top-1/2 -translate-y-1/2 h-1 ${activeColor} -z-10 transition-all duration-500`}
                            style={{ width: `calc(${(timeline.filter(t => t.completed).length - 1) / (timeline.length - 1) * 100}% - 4rem)` }}
                        ></div>
                    )}
                    {timeline.map((event, idx) => (
                        <div key={idx} className="relative flex flex-col items-center z-10">
                            <div className={`w-5 h-5 rounded-full border-4 ${event.completed ? activeColor + ' border-' + activeColor : 'bg-gray-200 border-gray-200'} transition-colors duration-500`}></div>
                            <div className="absolute top-8 w-24 text-center">
                                <p className={`text-xs font-semibold ${event.completed ? 'text-gray-900' : 'text-gray-400'}`}>{event.status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-[#202223]">
            {/* SaaS App Header (Minimal) */}
            <div className="bg-white border-b border-gray-200 h-14 flex items-center px-4 shrink-0 mt-16 md:mt-20 print:hidden">
                <div className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900" onClick={() => navigateTo('tracking')}>
                    <ArrowLeft size={16} />
                    <span className="text-sm font-medium">Orders</span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto">

                        {/* Print Invoice Header (Visible only when printing) */}
                        <div className="hidden print:block border-b border-gray-200 pb-6 mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-serif text-[#700000]">Bodilicious</h1>
                                    <p className="text-sm text-gray-500 mt-1">Official Tax Invoice</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">Invoice / Order #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                                    <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                    {order.razorpayOrderId && <p className="text-xs text-gray-400 mt-1">Ref: {order.razorpayOrderId}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Top Header Section */}
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 print:hidden">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-semibold text-gray-900">#{order._id.substring(order._id.length - 6).toUpperCase()}</h1>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPaymentBadge(order.paymentStatus)}`}>
                                        {order.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getFulfillmentBadge(order.orderStatus)}`}>
                                        {order.orderStatus === 'shipped' || order.orderStatus === 'delivered' ? 'Fulfilled' : (order.orderStatus === 'cancelled' ? 'Cancelled' : 'Unfulfilled')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleString()} from Online Store
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handlePrintInvoice} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm transition-colors">
                                    <Printer size={16} /> Print Invoice
                                </button>
                            </div>
                        </div>

                        {/* Shiprocket Tracker Map */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:hidden">
                            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <Package size={16} className="text-gray-500" />
                                    Live Tracking
                                    {trackingData && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${trackingData.status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-[#e77600]/10 text-[#e77600]'}`}>{trackingData.status}</span>}
                                </h3>
                                {order.awb && <p className="text-xs text-gray-500 font-mono">AWB: {order.awb}</p>}
                            </div>
                            <div className="p-6">
                                {isTrackingLoading ? (
                                    <div className="flex items-center justify-center py-8 text-gray-400">
                                        <RefreshCw className="animate-spin w-5 h-5 mr-3" /> Fetching live carrier updates...
                                    </div>
                                ) : trackingError ? (
                                    <div className="flex items-start gap-3 p-4 rounded bg-red-50 text-red-700 text-sm">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <p>{trackingError}</p>
                                    </div>
                                ) : trackingData?.timeline ? (
                                    <HorizontalTimeline timeline={trackingData.timeline} status={trackingData.status} />
                                ) : (
                                    <p className="text-sm text-gray-500 italic text-center py-4">Timeline information is not yet available for this order.</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Main Column */}
                            <div className="lg:col-span-2 flex flex-col gap-6">

                                {/* Order Items Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white pointer-events-none">
                                        <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
                                            <Package size={18} className="text-gray-500" /> Unfulfilled ({order.items.length})
                                        </div>
                                    </div>
                                    <div className="p-0">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded flex-shrink-0 overflow-hidden">
                                                    {item.product?.images?.[0] ? (
                                                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <a href="#" className="text-sm font-medium text-[#005bd3] hover:underline truncate block">
                                                        {item.product?.name || 'Unknown Product'}
                                                    </a>
                                                    <p className="text-xs text-gray-500 mt-0.5">{item.product?.type || 'Standard'}</p>
                                                </div>
                                                <div className="text-right text-sm text-gray-900">
                                                    ₹{item.priceAtPurchase.toLocaleString('en-IN')} × {item.quantity}
                                                </div>
                                                <div className="text-right text-sm font-semibold text-gray-900 min-w-[80px]">
                                                    ₹{(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment / Summary Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                                        {order.paymentStatus === 'paid' ? (
                                            <CheckCircle2 size={18} className="text-green-600" />
                                        ) : (
                                            <Clock size={18} className="text-yellow-600" />
                                        )}
                                        <h3 className="text-sm font-semibold text-gray-800">
                                            {order.paymentStatus === 'paid' ? 'Paid' : 'Payment pending'}
                                        </h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                                            <span>Subtotal ({order.items.length} item{order.items.length > 1 ? 's' : ''})</span>
                                            <span className="text-gray-900">₹{basePrice.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                                            <span>CGST / SGST (18% approx)</span>
                                            <span className="text-gray-900">₹{taxes.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                                            <span>Discount</span>
                                            <span className="text-gray-900">₹0</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                                            <span>Shipping</span>
                                            <span className="text-gray-900">Free</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 mt-2 border-t border-gray-200 text-sm font-semibold text-gray-900">
                                            <span>Total</span>
                                            <div className="text-right">
                                                <span className="text-gray-500 font-normal mr-2">INR</span>
                                                <span className="text-lg">₹{total.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {order.paymentStatus === 'paid' && (
                                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                                            <div className="text-sm text-gray-600 flex justify-between items-center">
                                                <span>{order.paymentMethod} transaction</span>
                                                <span className="font-mono text-xs">{order.razorpayPaymentId || 'Completed'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Timeline Card */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 print:hidden">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-4">Timeline</h3>
                                    <div className="relative border-l border-gray-200 ml-3 space-y-6 pb-4">

                                        <div className="relative pl-6">
                                            <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white"></div>
                                            <p className="text-sm font-medium text-gray-900">Order placed by {order.shippingDetails?.name || 'Customer'}</p>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                        </div>

                                        {order.paymentStatus === 'paid' && (
                                            <div className="relative pl-6">
                                                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white"></div>
                                                <p className="text-sm font-medium text-gray-900">Payment of ₹{total.toLocaleString('en-IN')} was processed</p>
                                                <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                                            </div>
                                        )}

                                        {order.awb && (
                                            <div className="relative pl-6">
                                                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white"></div>
                                                <p className="text-sm font-medium text-gray-900">Shipping label created (AWB: {order.awb})</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>

                            {/* Right Sidebar */}
                            <div className="flex flex-col gap-6">

                                {/* Customer Details */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-gray-800">Contact & Address</h3>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-900 block">{order.shippingDetails?.name}</p>
                                    </div>

                                    <div className="border-t border-gray-100 pt-2">
                                        <h4 className="text-xs uppercase font-semibold text-gray-500 mb-2">Contact Information</h4>
                                        <a href={`mailto:${order.shippingDetails?.email || 'customer@example.com'}`} className="text-sm text-[#005bd3] hover:underline flex flex-col mb-1.5 break-all">
                                            {order.shippingDetails?.email || 'customer@example.com'}
                                        </a>
                                        <a href={`tel:${order.shippingDetails?.phone}`} className="text-sm text-gray-700 hover:text-[#005bd3] flex flex-col">
                                            {order.shippingDetails?.phone}
                                        </a>
                                    </div>

                                    <div className="border-t border-gray-100 pt-3 relative">
                                        {isEditingAddress ? (
                                            <div className="space-y-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                                <h4 className="text-xs uppercase font-semibold text-gray-900">Edit Address</h4>
                                                <input type="text" placeholder="Full Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                                                <input type="text" placeholder="Street Address" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                                                <div className="flex gap-2">
                                                    <input type="text" placeholder="City" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className="w-1/2 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                                                    <input type="text" placeholder="State" value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} className="w-1/2 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                                                </div>
                                                <input type="text" placeholder="Pincode" value={editForm.pincode} onChange={e => setEditForm({ ...editForm, pincode: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                                                <input type="email" placeholder="Email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />
                                                <input type="tel" placeholder="Phone" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" />

                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button onClick={() => setIsEditingAddress(false)} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50">Cancel</button>
                                                    <button onClick={handleSaveAddress} disabled={isSavingAddress} className="px-3 py-1.5 text-xs font-medium text-white bg-[#008060] rounded shadow-sm hover:bg-[#006e52]">
                                                        {isSavingAddress ? 'Saving...' : 'Save'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-xs uppercase font-semibold text-gray-500">Shipping Address</h4>
                                                    {(order.orderStatus !== 'shipped' && order.orderStatus !== 'delivered') && (
                                                        <button onClick={() => setIsEditingAddress(true)} className="text-[#005bd3] text-xs font-medium hover:underline print:hidden">Edit</button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {order.shippingDetails?.name}<br />
                                                    {order.shippingDetails?.address}<br />
                                                    {order.shippingDetails?.city} {order.shippingDetails?.pincode}<br />
                                                    {order.shippingDetails?.state}<br />
                                                    India
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-100 pt-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-xs uppercase font-semibold text-gray-500">Billing Address</h4>
                                        </div>
                                        <p className="text-sm text-gray-500 italic">Same as shipping address</p>
                                    </div>
                                </div>

                                {/* Conversion Summary */}

                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
