import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, User, Bot } from "lucide-react";
import { useChat } from "ai/react";
import type { Message } from "ai/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ToolInvocation {
    toolCallId: string;
    toolName: string;
    result?: unknown;
}

const MessageSkeleton = () => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3"
    >
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="bg-white/5 rounded-2xl p-4 max-w-[80%] space-y-2 min-w-[150px]">
            <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
        </div>
    </motion.div>
);

export const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const token = localStorage.getItem("token");
    const scrollRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: `${import.meta.env.VITE_API_URL}/ai/chat`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        onError: (error: Error) => {
            console.error("Chat error:", error);
        },
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-linear-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50 group"
            >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.9 }}
                            className="relative w-full max-w-lg m-4 bg-[#1a1b26] border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[80vh]"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 shrink-0">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                    <h3 className="font-bold text-white">FinanceYu AI</h3>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-muted-foreground hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                                {messages.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Como posso ajudar a organizar suas finanças hoje?</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((m: Message) => {
                                            // Logic to hide empty assistant messages (e.g. completed tool calls with no text)
                                            const isUser = m.role === "user";
                                            const hasContent =
                                                m.content && m.content.trim().length > 0;
                                            const hasPendingTools = (
                                                m.toolInvocations as ToolInvocation[] | undefined
                                            )?.some((t) => !("result" in t));

                                            if (!isUser && !hasContent && !hasPendingTools) {
                                                return null;
                                            }

                                            return (
                                                <motion.div
                                                    key={m.id}
                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                    className={`flex gap-3 ${
                                                        isUser ? "flex-row-reverse" : ""
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                            isUser
                                                                ? "bg-purple-500/20 text-purple-400"
                                                                : "bg-indigo-500/20 text-indigo-400"
                                                        }`}
                                                    >
                                                        {isUser ? (
                                                            <User className="w-4 h-4" />
                                                        ) : (
                                                            <Bot className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div
                                                        className={`rounded-2xl p-3 max-w-[85%] ${
                                                            isUser
                                                                ? "bg-purple-500/10 text-purple-100"
                                                                : "bg-white/5 text-gray-200"
                                                        }`}
                                                    >
                                                        <div className="text-sm prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:p-2 prose-pre:rounded-lg prose-a:text-purple-400 hover:prose-a:text-purple-300">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                components={{
                                                                    table: ({ ...props }) => (
                                                                        <div className="overflow-x-auto my-4 rounded-lg border border-white/10 bg-black/20">
                                                                            <table
                                                                                className="w-full text-left border-collapse"
                                                                                {...props}
                                                                            />
                                                                        </div>
                                                                    ),
                                                                    thead: ({ ...props }) => (
                                                                        <thead
                                                                            className="bg-white/5"
                                                                            {...props}
                                                                        />
                                                                    ),
                                                                    th: ({ ...props }) => (
                                                                        <th
                                                                            className="px-4 py-3 text-xs font-medium text-purple-300 uppercase tracking-wider border-b border-white/10 whitespace-nowrap"
                                                                            {...props}
                                                                        />
                                                                    ),
                                                                    td: ({ ...props }) => (
                                                                        <td
                                                                            className="px-4 py-3 text-gray-300 border-b border-white/5"
                                                                            {...props}
                                                                        />
                                                                    ),
                                                                }}
                                                            >
                                                                {m.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                        {(
                                                            m.toolInvocations as
                                                                | ToolInvocation[]
                                                                | undefined
                                                        )?.map((toolInvocation: ToolInvocation) => {
                                                            const toolCallId =
                                                                toolInvocation.toolCallId;

                                                            // Don't show anything if result exists (action completed)
                                                            if ("result" in toolInvocation) {
                                                                return null;
                                                            }

                                                            // Show friendly loading state
                                                            let friendlyName = "Processando...";
                                                            if (
                                                                toolInvocation.toolName ===
                                                                "addDebt"
                                                            )
                                                                friendlyName =
                                                                    "Adicionando dívida...";
                                                            if (
                                                                toolInvocation.toolName ===
                                                                "getDebts"
                                                            )
                                                                friendlyName =
                                                                    "Buscando dívidas...";
                                                            if (
                                                                toolInvocation.toolName ===
                                                                "markDebtAsPaid"
                                                            )
                                                                friendlyName =
                                                                    "Atualizando pagamento...";

                                                            return (
                                                                <div
                                                                    key={toolCallId}
                                                                    className="mt-2 text-xs text-purple-300/70 italic border-t border-white/5 pt-2 flex items-center gap-2"
                                                                >
                                                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                                                                    {friendlyName}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                        {isLoading &&
                                            messages[messages.length - 1]?.role === "user" && (
                                                <MessageSkeleton />
                                            )}
                                    </>
                                )}
                            </div>

                            <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
                                <form onSubmit={handleSubmit} className="relative">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Adicionar conta de luz R$ 150..."
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !input.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
