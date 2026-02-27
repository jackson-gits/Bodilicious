import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useApp } from "../context/AppContext";

type Message = {
    id: string;
    sender: "user" | "bot";
    text: string;
    products?: any[];
};

// Simple utility to convert basic markdown (bold and bullets) to React elements
const renderMarkdown = (text: string) => {
    const parts = text.split('\n');
    return parts.map((part, index) => {
        // Check if bullet point
        let content = part;
        const isBullet = content.trim().startsWith('•') || content.trim().startsWith('-');
        if (isBullet) {
            content = content.replace(/^[•-]\s*/, '');
        }

        // Replace bold syntax **text** with <strong>text</strong>
        const elements = [];
        let lastIndex = 0;
        const boldRegex = /\*\*(.*?)\*\*/g;
        let match;

        while ((match = boldRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                elements.push(<span key={`${index}-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
            }
            elements.push(<strong key={`${index}-bold-${match.index}`}>{match[1]}</strong>);
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < content.length) {
            elements.push(<span key={`${index}-${lastIndex}`}>{content.substring(lastIndex)}</span>);
        }

        return (
            <div key={index} className={`mb-1 ${isBullet ? 'flex items-start ml-2' : ''}`}>
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
            text: "Hi! I'm the Bodilicious Product Assistant. How can I help you find the right products for your skin today?",
        },
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const newMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: inputMessage,
        };

        setMessages((prev) => [...prev, newMsg]);
        setInputMessage("");
        setIsLoading(true);

        const history = messages
            .filter((m) => m.sender === "user")
            .map((m) => m.text);

        try {
            const response = await fetch("http://localhost:5000/api/v1/chat", {
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
        <div className="min-h-screen bg-white flex flex-col pt-16 md:pt-20">
            {/* Header */}
            <div className="bg-silk-light pt-12 pb-10 px-6 border-b border-silk">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center gap-5">
                    <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm text-dark-red flex-shrink-0">
                        <MessageCircle size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-sans tracking-[0.3em] uppercase text-ruby-red mb-2">
                            Online &bull; Instant Expert Guidance
                        </p>
                        <h1 className="font-serif text-dark-red text-3xl md:text-4xl">
                            Beauty Advisor
                        </h1>
                    </div>
                </div>
            </div>

            {/* Messages Panel */}
            <div className="flex-1 w-full max-w-4xl mx-auto px-6 overflow-y-auto py-10 space-y-8 flex flex-col" style={{ maxHeight: "calc(100vh - 300px)" }}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                            className={`max-w-[90%] md:max-w-[80%] p-6 text-[15px] leading-relaxed shadow-sm ${msg.sender === "user"
                                ? "bg-dark-red text-silk rounded-2xl rounded-tr-sm"
                                : "bg-silk-light text-dark-red border border-silk rounded-2xl rounded-tl-sm"
                                }`}
                        >
                            {msg.sender === "user" ? (
                                <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                            ) : (
                                <div className="space-y-3 font-sans w-full">
                                    {renderMarkdown(msg.text)}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                                            {msg.products.map((p: any, idx: number) => {
                                                const productFromApp = allProducts.find(ap => ap.pid === (p.id || p.pid));
                                                if (!productFromApp) return null;
                                                return <ProductCard key={idx} product={productFromApp} />;
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-silk-light border border-silk shadow-sm rounded-2xl rounded-tl-sm p-5 w-24 flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-ruby-red rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-2 h-2 bg-ruby-red rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="w-2 h-2 bg-ruby-red rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-silk py-6 px-6 w-full mt-auto">
                <div className="max-w-4xl mx-auto flex items-stretch gap-3">
                    <input
                        type="text"
                        className="flex-1 bg-silk-light/50 border border-silk px-6 py-4 text-[15px] focus:outline-none focus:ring-1 focus:ring-dark-red focus:border-dark-red transition-all placeholder:text-grey-beige font-sans text-dark-red"
                        placeholder="Ask about routines, ingredients, or find your perfect product..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="bg-dark-red text-silk px-6 md:px-10 py-4 font-sans text-xs tracking-widest uppercase hover:bg-ruby-red disabled:opacity-50 disabled:bg-grey-beige disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
                    >
                        Send <Send size={16} className="hidden md:inline-block" />
                    </button>
                </div>
            </div>
        </div>
    );
}
