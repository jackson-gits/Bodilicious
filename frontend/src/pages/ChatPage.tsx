import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, Sparkles, Droplets, ShieldCheck } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useApp } from "../context/AppContext";

type Message = {
    id: string;
    sender: "user" | "bot";
    text: string;
    products?: any[];
};

const SUGGESTIONS = [
    "Build my routine",
    "I have acne",
    "Dry skin",
    "Dark spots"
];

const renderMarkdown = (text: string) => {
    const parts = text.split('\n');
    return parts.map((part, index) => {
        let content = part;
        const isBullet = content.trim().startsWith('•') || content.trim().startsWith('-');
        if (isBullet) {
            content = content.replace(/^[•-]\s*/, '');
        }

        const elements = [];
        let lastIndex = 0;
        const boldRegex = /\*\*(.*?)\*\*/g;
        let match;

        while ((match = boldRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                elements.push(<span key={`${index}-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
            }
            elements.push(<strong key={`${index}-bold-${match.index}`} className="font-semibold text-dark-red">{match[1]}</strong>);
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < content.length) {
            elements.push(<span key={`${index}-${lastIndex}`}>{content.substring(lastIndex)}</span>);
        }

        return (
            <div key={index} className={`mb-1.5 ${isBullet ? 'flex items-start ml-2' : ''}`}>
                {isBullet && <span className="mr-2 text-ruby-red text-sm mt-1">•</span>}
                <span className={isBullet ? 'flex-1' : ''}>{elements.length > 0 ? elements : content}</span>
            </div>
        );
    });
};

export default function ChatPage() {
    const { products: allProducts } = useApp();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            sender: "bot",
            text: "Welcome to Bodilicious. I'm your personal Beauty Advisor. Tell me about your skin, and we'll craft a ritual perfectly suited to you.",
        },
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (textOveride?: string) => {
        const textToSend = textOveride || inputMessage;
        if (!textToSend.trim()) return;

        const newMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: textToSend,
        };

        setMessages((prev) => [...prev, newMsg]);
        setInputMessage("");
        setIsLoading(true);

        const history = messages
            .filter((m) => m.sender === "user")
            .map((m) => m.text);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: newMsg.text, history }),
            });

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    sender: "bot",
                    text: data.reply || "I'm having trouble connecting right now. Please try again later.",
                    products: data.products,
                },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    sender: "bot",
                    text: "Oops! Something went wrong while connecting to the server.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col pt-24 pb-16">
            <div className="max-w-6xl mx-auto w-full px-6 flex-1 flex flex-col lg:flex-row gap-12 lg:gap-16">

                {/* Left Column: Hero & Value Props */}
                <div className="w-full lg:w-5/12 flex flex-col justify-center">
                    <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-4">
                        AI Beauty Advisor
                    </p>

                    <h1 className="font-serif text-4xl lg:text-5xl text-dark-red leading-tight mb-6">
                        Discover Your <br />
                        <span className="italic text-ruby-red">Perfect Glow.</span>
                    </h1>

                    <p className="font-sans text-gray-600 text-base leading-relaxed mb-10">
                        Experience a personalized consultation. Our luxury beauty advisor analyzes your unique skin profile to curate the ultimate Bodilicious ritual.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-silk-light flex items-center justify-center shrink-0">
                                <Droplets size={20} className="text-dark-red" />
                            </div>
                            <div>
                                <h3 className="font-sans font-medium text-dark-red text-base mb-1 tracking-wide">Tailored Routines</h3>
                                <p className="font-sans text-sm text-gray-500 leading-relaxed">Step-by-step skincare regimens designed exclusively for your skin type.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-silk-light flex items-center justify-center shrink-0">
                                <ShieldCheck size={20} className="text-dark-red" />
                            </div>
                            <div>
                                <h3 className="font-sans font-medium text-dark-red text-base mb-1 tracking-wide">Expert Recommendations</h3>
                                <p className="font-sans text-sm text-gray-500 leading-relaxed">Curated selections from our premium herbal collections.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Interactive Chat Interface */}
                <div className="w-full lg:w-7/12 flex flex-col h-[650px] bg-white border border-silk shadow-sm rounded-sm overflow-hidden relative">

                    {/* Chat Header */}
                    <div className="px-6 py-5 bg-white border-b border-silk flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-silk-light flex items-center justify-center rounded-sm">
                                    <MessageCircle size={22} className="text-dark-red" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-600 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <h2 className="font-serif text-dark-red text-xl">Bodilicious Advisor</h2>
                                <p className="font-sans text-xs text-gray-500 mt-0.5">
                                    Online • Replies instantly
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-neutral-50/50">
                        {messages.map((msg) => {
                            const isUser = msg.sender === "user";

                            return (
                                <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                    {/* Bot Avatar */}
                                    {!isUser && (
                                        <div className="w-8 h-8 bg-silk-light flex items-center justify-center shrink-0 mr-3 mt-auto mb-1 rounded-sm border border-silk">
                                            <Sparkles size={14} className="text-dark-red" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[85%] sm:max-w-[75%] p-5 text-[15px] leading-relaxed shadow-sm transition-all duration-300 ${isUser
                                            ? "bg-dark-red text-silk ml-auto rounded-sm rounded-tr-none"
                                            : "bg-white text-gray-800 border border-silk rounded-sm rounded-tl-none"
                                            }`}
                                    >
                                        {isUser ? (
                                            <p className="whitespace-pre-wrap font-sans font-light tracking-wide">{msg.text}</p>
                                        ) : (
                                            <div className="space-y-4 font-sans w-full tracking-wide font-light">
                                                {renderMarkdown(msg.text)}
                                                {msg.products && msg.products.length > 0 && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-silk/30">
                                                        {msg.products.map((p: any, idx: number) => {
                                                            const productFromApp = allProducts.find(ap => ap.pid === (p.id || p.pid));
                                                            if (!productFromApp) return null;
                                                            return (
                                                                <div key={idx} className="bg-white rounded-sm overflow-hidden border border-silk hover:border-ruby-red/50 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                                                    <ProductCard product={productFromApp} />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Typing Indicator */}
                        {isLoading && (
                            <div className="flex justify-start items-end">
                                <div className="w-8 h-8 bg-silk-light flex items-center justify-center shrink-0 mr-3 mb-1 rounded-sm border border-silk">
                                    <Sparkles size={14} className="text-dark-red" />
                                </div>
                                <div className="bg-white border border-silk shadow-sm rounded-sm rounded-tl-none p-5 w-auto flex items-center justify-center gap-1.5">
                                    <div className="w-2 h-2 bg-ruby-red/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                    <div className="w-2 h-2 bg-ruby-red/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                    <div className="w-2 h-2 bg-ruby-red/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies & Input */}
                    <div className="bg-white border-t border-silk pt-3 pb-5 px-6 mt-auto">

                        {/* Suggestions */}
                        {!isLoading && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x">
                                {SUGGESTIONS.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => handleSendMessage(suggestion)}
                                        className="snap-start whitespace-nowrap px-4 py-2 rounded-sm border border-silk text-dark-red font-sans text-xs hover:bg-silk-light transition-all duration-300"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Box */}
                        <div className="relative flex items-center bg-neutral-50 border border-silk rounded-sm focus-within:border-dark-red transition-all duration-300">
                            <input
                                type="text"
                                className="flex-1 bg-transparent px-5 py-4 text-[15px] focus:outline-none font-sans text-gray-800 placeholder:text-gray-400 font-light tracking-wide w-full rounded-sm"
                                placeholder="Type your skin concern..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!inputMessage.trim() || isLoading}
                                className="bg-dark-red text-silk px-6 py-4 flex items-center justify-center hover:bg-ruby-red disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 rounded-r-sm focus:outline-none"
                                aria-label="Send message"
                            >
                                Send <Send size={16} className="ml-2 hidden sm:block" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
