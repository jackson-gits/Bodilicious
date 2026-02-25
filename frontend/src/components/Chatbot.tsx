import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Message = {
    id: string;
    sender: "user" | "bot";
    text: string;
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
                {isBullet && <span className="mr-2 text-primary text-sm mt-1">•</span>}
                <span className={isBullet ? 'flex-1' : ''}>{elements.length > 0 ? elements : content}</span>
            </div>
        );
    });
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
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

        try {
            const response = await fetch("http://localhost:5000/api/v1/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: newMsg.text }),
            });

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    sender: "bot",
                    text: data.reply || "I'm having trouble connecting right now. Please try again later.",
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
        <div className="fixed bottom-6 right-6 z-[9999]">
            {isOpen ? (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col overflow-hidden border border-gray-200 transition-all transform scale-100 opacity-100 duration-300 ease-out origin-bottom-right" style={{ height: "500px", maxHeight: "80vh" }}>
                    {/* Header */}
                    <div className="bg-[#A12A29] text-white p-4 flex justify-between items-center shadow-md z-10 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                <MessageCircle size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-[15px] tracking-wide">Bodilicious Assistant</h3>
                                <p className="text-xs text-white/80 font-medium">Online • Responds instantly</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages block */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFAFA]">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[85%] p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.sender === "user"
                                            ? "bg-[#A12A29] text-white rounded-tr-sm"
                                            : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm"
                                        }`}
                                >
                                    {msg.sender === "user" ? (
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {renderMarkdown(msg.text)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-800 border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-4 w-16 flex items-center justify-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input block */}
                    <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                        <input
                            type="text"
                            className="flex-1 border border-gray-200 bg-gray-50 rounded-full px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A12A29]/30 focus:border-[#A12A29]/50 transition-all placeholder:text-gray-400"
                            placeholder="Type your message..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="bg-[#A12A29] text-white p-3 rounded-full hover:bg-[#8A2423] disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <Send size={18} className="translate-x-[1px]" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-[#A12A29] hover:bg-[#8A2423] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 duration-200 relative group flex items-center justify-center"
                >
                    <MessageCircle size={28} />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </span>

                    {/* Tooltip */}
                    <span className="absolute right-full mr-4 bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
                        Chat with our Beauty Advisor ✨
                    </span>
                </button>
            )}
        </div>
    );
}
