import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, Search, ChevronRight, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

interface TrackingData {
    awb: string;
    status: string;
    expectedDelivery: string;
    timeline: {
        status: string;
        location: string;
        date: string;
        completed: boolean;
    }[];
}

export default function TrackingPage() {
    const { navigateTo, getAuthHeaders } = useApp();
    const [awb, setAwb] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!awb.trim()) return;

        setIsLoading(true);
        setError('');
        setTrackingData(null);

        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`http://localhost:5000/api/v1/orders/shiprocket/${awb}`, {
                headers
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch tracking details');
            }

            // Map shiprocket response to our UI format
            // In a real implementation this would parse the specific Shiprocket JSON structure
            setTrackingData(data.data);
        } catch (err: any) {
            setError(err.message || 'An error occurred while tracking your order');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="flex-1 max-w-3xl mx-auto w-full px-6 pt-28 pb-16">

                <button
                    onClick={() => navigateTo('account')}
                    className="flex items-center gap-2 text-sm text-grey-beige hover:text-dark-red transition-colors mb-8 font-sans"
                >
                    <ArrowLeft size={16} /> Back to Account
                </button>

                <h1 className="font-serif text-dark-red text-4xl mb-2">Track Your Order</h1>
                <p className="font-sans text-grey-beige text-sm mb-10">
                    Enter your AWB (Airway Bill) number or Order ID below to see the latest updates on your shipment.
                </p>

                <div className="bg-silk-light p-6 border border-silk/30 mb-10">
                    <form onSubmit={handleTrack} className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Enter AWB or Order ID"
                                value={awb}
                                onChange={(e) => setAwb(e.target.value)}
                                className="w-full bg-white border border-silk px-4 py-3 pl-12 font-sans text-sm focus:outline-none focus:border-dark-red transition-colors"
                                required
                            />
                            <Package size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-beige" />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !awb.trim()}
                            className="bg-dark-red text-silk px-8 py-3 font-sans text-sm tracking-widest uppercase hover:bg-ruby-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? 'Tracking...' : (
                                <>Track <Search size={16} /></>
                            )}
                        </button>
                    </form>
                    {error && (
                        <p className="mt-4 text-sm text-red-500 font-sans">{error}</p>
                    )}
                </div>

                {trackingData && (
                    <div className="border border-silk p-8 bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-silk-light rounded-bl-full -z-10 opacity-50"></div>

                        <div className="mb-8 pb-8 border-b border-silk/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="font-serif text-dark-red text-2xl mb-1">
                                    Status: <span className="text-ruby-red">{trackingData.status}</span>
                                </h2>
                                <p className="font-sans text-grey-beige text-sm">AWB: {trackingData.awb}</p>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="font-sans text-xs text-grey-beige uppercase tracking-wider mb-1">Expected Delivery</p>
                                <p className="font-serif text-dark-red text-lg">{trackingData.expectedDelivery}</p>
                            </div>
                        </div>

                        <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-dark-red before:via-dark-red/50 before:to-transparent">
                            {trackingData.timeline.map((event, idx) => (
                                <div key={idx} className="relative flex items-start gap-6 before:absolute before:left-0 md:before:left-1/2 md:before:-ml-px before:-z-10">
                                    <div className="absolute left-[-24px] bg-white mt-0.5">
                                        {event.completed ? (
                                            <CheckCircle2 className="w-6 h-6 text-dark-red bg-white rounded-full" />
                                        ) : (
                                            <div className="w-6 h-6 flex items-center justify-center bg-white">
                                                <Circle className="w-4 h-4 text-silk fill-silk-light" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`font-serif text-lg ${event.completed ? 'text-dark-red' : 'text-grey-beige'}`}>
                                            {event.status}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="font-sans text-sm text-grey-beige">{event.location}</p>
                                            <span className="w-1 h-1 rounded-full bg-silk"></span>
                                            <p className="font-sans text-xs text-grey-beige">{event.date}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                )}

            </div>
            <Footer />
        </div>
    );
}
