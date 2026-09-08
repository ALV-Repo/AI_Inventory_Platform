"use client";

import { useEffect, useRef, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api } from "../../lib/api";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  source?: string;
};

type Chat = {
  id: number;
  title: string;
  time: string;
  messages: Message[];
};

const suggestedQuestions = [
  "Which products will run out next week?",
  "What is my current inventory value?",
  "Which products are not moving?",
  "Which supplier delivers the fastest?",
  "What is my revenue this month?",
  "Show me low stock items",
];

function createNewChat(): Chat {
  return {
    id: Date.now(),
    title: "New Conversation",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    messages: [],
  };
}

export default function CopilotPage() {
  const [chats, setChats] = useState<Chat[]>([createNewChat()]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chats.length > 0 && activeChatId === null) {
      setActiveChatId(chats[0].id);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, loading]);

  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages ?? [];

  const createChat = () => {
    const newChat = createNewChat();
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setQuestion("");
  };

  const updateChat = (chatId: number, newMessages: Message[], newTitle?: string) => {
    setChats(prev => prev.map(c => {
      if (c.id !== chatId) return c;
      return {
        ...c,
        messages: newMessages,
        title: newTitle ?? c.title,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    }));
  };

  const askCopilot = async (selectedQuestion?: string) => {
    const query = (selectedQuestion ?? question).trim();
    if (!query || loading || !activeChat) return;

    const currentChatId = activeChat.id;

    const userMessage: Message = { id: Date.now(), role: "user", text: query };
    const updatedMessages = [...activeChat.messages, userMessage];

    let newTitle = activeChat.title;
    if (activeChat.messages.length === 0 && activeChat.title === "New Conversation") {
      newTitle = query.length > 40 ? `${query.substring(0, 40)}...` : query;
    }

    updateChat(currentChatId, updatedMessages, newTitle);
    setQuestion("");
    setLoading(true);

    try {
      // ── REAL API CALL ─────────────────────────────────────────
      const response = await api.askCopilot(query);

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: response.answer,
        source: response.source,
      };

      updateChat(currentChatId, [...updatedMessages, assistantMessage], newTitle);
    } catch (e: unknown) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: e instanceof Error ? `Error: ${e.message}` : "Sorry, I could not get an answer. Please try again.",
      };
      updateChat(currentChatId, [...updatedMessages, errorMessage], newTitle);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">✦ AI Copilot</h1>
              <p className="mt-1 text-sm text-gray-500">Ask questions about your inventory, sales, suppliers and business performance.</p>
            </div>
            <button onClick={createChat} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              + New Chat
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">

            {/* Chat history sidebar */}
            <div className="flex flex-col rounded-xl border bg-white shadow-sm" style={{ minHeight: 650 }}>
              <div className="border-b px-5 py-4">
                <h2 className="font-semibold text-gray-900">Chat History</h2>
                <p className="mt-1 text-xs text-gray-500">{chats.length} conversation{chats.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {chats.map(chat => {
                  const isActive = chat.id === activeChatId;
                  return (
                    <button
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={`mb-2 w-full rounded-lg border p-3 text-left transition ${isActive ? "border-blue-200 bg-blue-50" : "border-transparent hover:bg-gray-50"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                          💬
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800">{chat.title}</p>
                          <p className="mt-0.5 text-xs text-gray-400">{chat.time}</p>
                          <p className="text-[10px] text-gray-400">{chat.messages.length} messages</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="border-t p-4">
                <button onClick={createChat} className="w-full rounded-lg border border-blue-500 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                  + New Chat
                </button>
              </div>
            </div>

            {/* Chat window */}
            <div className="flex flex-col rounded-xl border bg-white shadow-sm">
              {/* Chat header */}
              <div className="border-b px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">AI</div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">AI Copilot</h2>
                      <p className="text-xs text-gray-500">Powered by real business data</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">● Live</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6" style={{ minHeight: 390, maxHeight: 450 }}>
                {messages.length === 0 && !loading && (
                  <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                    <div className="mb-4 text-5xl">💬</div>
                    <h3 className="text-xl font-semibold text-gray-900">Ask anything about your business</h3>
                    <p className="mt-2 max-w-md text-sm text-gray-500">
                      Your questions are answered using real data from your inventory, sales and supplier records.
                    </p>
                  </div>
                )}

                <div className="space-y-5">
                  {messages.map(message => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-blue-600 text-white" : "border border-blue-100 bg-blue-50 text-gray-700"}`}>
                        {message.role === "assistant" && (
                          <p className="mb-1 text-xs font-semibold text-blue-600">
                            AI Copilot {message.source === "rules" ? "· Rules Engine" : "· LLM"}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-xl border bg-gray-50 px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600" />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:150ms]" />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-600 [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Suggested questions */}
              <div className="border-t px-6 py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Suggested</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map(s => (
                    <button
                      key={s}
                      onClick={() => askCopilot(s)}
                      disabled={loading}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="border-t bg-gray-50 px-6 py-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); askCopilot(); } }}
                    placeholder="Ask a question about your business..."
                    disabled={loading}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />
                  <button
                    onClick={() => askCopilot()}
                    disabled={loading || !question.trim()}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "..." : "➤ Send"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
