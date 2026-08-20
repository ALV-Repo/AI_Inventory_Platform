"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

type Chat = {
  id: number;
  title: string;
  time: string;
  messages: Message[];
};

const STORAGE_KEY = "aistockflow_copilot_chats";
const ACTIVE_CHAT_KEY = "aistockflow_copilot_active_chat";

const suggestedQuestions = [
  "Which products will run out next week?",
  "What is my current inventory value?",
  "Which products are not moving?",
  "Which supplier delivers the fastest?",
];

function createNewChat(): Chat {
  return {
    id: Date.now(),
    title: "New Conversation",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    messages: [],
  };
}

export default function CopilotPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ============================================================
  // LOAD PREVIOUS CHATS
  // ============================================================

  useEffect(() => {
    try {
      const savedChats = localStorage.getItem(STORAGE_KEY);
      const savedActiveChat = localStorage.getItem(ACTIVE_CHAT_KEY);

      if (savedChats) {
        const parsedChats: Chat[] = JSON.parse(savedChats);

        if (parsedChats.length > 0) {
          setChats(parsedChats);

          if (savedActiveChat) {
            const activeId = Number(savedActiveChat);

            const exists = parsedChats.some(
              (chat) => chat.id === activeId
            );

            if (exists) {
              setActiveChatId(activeId);
            } else {
              setActiveChatId(parsedChats[0].id);
            }
          } else {
            setActiveChatId(parsedChats[0].id);
          }
        } else {
          const newChat = createNewChat();

          setChats([newChat]);
          setActiveChatId(newChat.id);
        }
      } else {
        const newChat = createNewChat();

        setChats([newChat]);
        setActiveChatId(newChat.id);
      }
    } catch (error) {
      console.error("Failed to load Copilot chat history:", error);

      const newChat = createNewChat();

      setChats([newChat]);
      setActiveChatId(newChat.id);
    }

    setLoaded(true);
  }, []);

  // ============================================================
  // SAVE CHATS
  // ============================================================

  useEffect(() => {
    if (!loaded) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error("Failed to save Copilot chat history:", error);
    }
  }, [chats, loaded]);

  // ============================================================
  // SAVE ACTIVE CHAT
  // ============================================================

  useEffect(() => {
    if (!loaded || activeChatId === null) {
      return;
    }

    try {
      localStorage.setItem(
        ACTIVE_CHAT_KEY,
        String(activeChatId)
      );
    } catch (error) {
      console.error("Failed to save active chat:", error);
    }
  }, [activeChatId, loaded]);

  // ============================================================
  // CURRENT CHAT
  // ============================================================

  const activeChat = chats.find(
    (chat) => chat.id === activeChatId
  );

  const messages = activeChat?.messages ?? [];

  // ============================================================
  // CREATE NEW CHAT
  // ============================================================

  const createChat = () => {
    const newChat = createNewChat();

    setChats((previousChats) => [
      newChat,
      ...previousChats,
    ]);

    setActiveChatId(newChat.id);
    setQuestion("");
    setLoading(false);
  };

  // ============================================================
  // SELECT CHAT
  // ============================================================

  const selectChat = (chatId: number) => {
    setActiveChatId(chatId);
    setQuestion("");
    setLoading(false);
  };

  // ============================================================
  // DELETE CHAT
  // ============================================================

  const deleteChat = () => {
    if (!activeChat) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) {
      return;
    }

    const remainingChats = chats.filter(
      (chat) => chat.id !== activeChatId
    );

    if (remainingChats.length === 0) {
      const newChat = createNewChat();

      setChats([newChat]);
      setActiveChatId(newChat.id);
    } else {
      setChats(remainingChats);
      setActiveChatId(remainingChats[0].id);
    }

    setQuestion("");
    setLoading(false);
  };

  // ============================================================
  // UPDATE CHAT
  // ============================================================

  const updateChat = (
    chatId: number,
    newMessages: Message[],
    newTitle?: string
  ) => {
    setChats((previousChats) =>
      previousChats.map((chat) => {
        if (chat.id !== chatId) {
          return chat;
        }

        return {
          ...chat,
          messages: newMessages,
          title: newTitle ?? chat.title,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      })
    );
  };

  // ============================================================
  // DEMO AI RESPONSE
  // ============================================================

  const generateAnswer = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes("run out") ||
      lowerQuery.includes("next week") ||
      lowerQuery.includes("stock risk")
    ) {
      return "The products with the highest stock risk are Hot Wheels Track Set, Bluetooth Speaker, and Football Size 5. These products currently have low available stock and should be monitored closely.";
    }

    if (
      lowerQuery.includes("inventory value") ||
      lowerQuery.includes("stock value")
    ) {
      return "The current inventory value is approximately ₹5,09,853 based on the available StockFlow records.";
    }

    if (
      lowerQuery.includes("not moving") ||
      lowerQuery.includes("dead stock")
    ) {
      return "The currently identified non-moving products include Christmas Tree 4ft, Fashion Doll Set, and Ceramic Planter. Consider discounts, bundles, or promotional campaigns to clear this stock.";
    }

    if (
      lowerQuery.includes("supplier") ||
      lowerQuery.includes("fastest")
    ) {
      return "Supplier performance should be compared using delivery time, reliability, and order history. The fastest supplier can be identified once supplier delivery records are connected.";
    }

    if (
      lowerQuery.includes("sales") ||
      lowerQuery.includes("revenue")
    ) {
      return "The dashboard currently shows ₹9,69,006 in revenue for the last 30 days. Gross margin is approximately 35.7%.";
    }

    if (
      lowerQuery.includes("hello") ||
      lowerQuery.includes("hi") ||
      lowerQuery.includes("hey")
    ) {
      return "Hello! I'm your AI StockFlow Copilot. You can ask me about inventory, sales, suppliers, stock levels, and business performance.";
    }

    return "Based on the available StockFlow records, I recommend reviewing inventory levels, sales performance, supplier information, and reorder requirements before making a business decision.";
  };

  // ============================================================
  // ASK COPILOT
  // ============================================================

  const askCopilot = (selectedQuestion?: string) => {
    const query = (
      selectedQuestion ?? question
    ).trim();

    if (!query || loading || !activeChat) {
      return;
    }

    const currentChatId = activeChat.id;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: query,
    };

    const updatedMessages = [
      ...activeChat.messages,
      userMessage,
    ];

    let newTitle = activeChat.title;

    if (
      activeChat.messages.length === 0 &&
      activeChat.title === "New Conversation"
    ) {
      newTitle =
        query.length > 32
          ? `${query.substring(0, 32)}...`
          : query;
    }

    updateChat(
      currentChatId,
      updatedMessages,
      newTitle
    );

    setQuestion("");
    setLoading(true);

    setTimeout(() => {
      const answer = generateAnswer(query);

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: answer,
      };

      const finalMessages = [
        ...updatedMessages,
        assistantMessage,
      ];

      updateChat(
        currentChatId,
        finalMessages,
        newTitle
      );

      setLoading(false);
    }, 700);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (!loaded) {
    return (
      <PageLayout>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-sm text-gray-500">
            Loading Copilot...
          </div>
        </div>
      </PageLayout>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">

          {/* PAGE HEADER */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ✦ AI Copilot
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Ask questions about your inventory, sales,
                suppliers, and business performance.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={deleteChat}
                disabled={!activeChat}
                className="rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🗑 Delete Chat
              </button>

              <button
                type="button"
                onClick={createChat}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                + New Chat
              </button>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">

            {/* CHAT HISTORY */}
            <div className="flex min-h-[650px] flex-col rounded-xl border bg-white shadow-sm">

              <div className="border-b px-5 py-4">
                <h2 className="font-semibold text-gray-900">
                  Chat History
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Your conversations
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {chats.map((chat) => {
                  const isActive =
                    chat.id === activeChatId;

                  return (
                    <button
                      type="button"
                      key={chat.id}
                      onClick={() =>
                        selectChat(chat.id)
                      }
                      className={`mb-2 w-full rounded-lg border p-3 text-left transition ${
                        isActive
                          ? "border-blue-200 bg-blue-50"
                          : "border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">

                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          💬
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {chat.title}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {chat.time}
                          </p>
                        </div>

                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="border-t p-4">
                <button
                  type="button"
                  onClick={createChat}
                  className="w-full rounded-lg border border-blue-500 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  + New Chat
                </button>
              </div>

            </div>

            {/* COPILOT CHAT */}
            <div className="rounded-xl border bg-white shadow-sm">

              {/* HEADER */}
              <div className="border-b px-6 py-5">
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      AI
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        AI Copilot
                      </h2>

                      <p className="text-xs text-gray-500">
                        StockFlow Business Assistant
                      </p>
                    </div>

                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                    ● Active
                  </span>

                </div>
              </div>

              {/* MESSAGES */}
              <div className="max-h-[450px] min-h-[390px] overflow-y-auto p-6">

                {messages.length === 0 && !loading && (
                  <div className="flex min-h-[330px] flex-col items-center justify-center text-center">

                    <div className="mb-5 text-5xl">
                      💬
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900">
                      Start a conversation
                    </h3>

                    <p className="mt-2 max-w-md text-sm text-gray-500">
                      Ask a question or choose one of
                      the suggested questions below.
                    </p>

                  </div>
                )}

                <div className="space-y-5">

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-6 ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "border border-blue-100 bg-blue-50 text-gray-700"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <p className="mb-1 text-xs font-semibold text-blue-600">
                            AI Copilot
                          </p>
                        )}

                        {message.text}
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

                </div>
              </div>

              {/* SUGGESTED QUESTIONS */}
              <div className="border-t px-6 py-5">

                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Suggested Questions
                </p>

                <div className="flex flex-wrap gap-2">

                  {suggestedQuestions.map(
                    (suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        onClick={() =>
                          askCopilot(suggestion)
                        }
                        disabled={loading}
                        className="rounded-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    )
                  )}

                </div>
              </div>

              {/* INPUT */}
              <div className="border-t bg-gray-50 p-6">

                <div className="flex gap-3">

                  <input
                    type="text"
                    value={question}
                    onChange={(event) =>
                      setQuestion(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        askCopilot();
                      }
                    }}
                    placeholder="Type a question about your business..."
                    maxLength={500}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => askCopilot()}
                    disabled={
                      loading ||
                      !question.trim()
                    }
                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Sending..."
                      : "➤ Send"}
                  </button>

                </div>

                <div className="mt-2 flex justify-between">

                  <p className="text-xs text-gray-400">
                    Frontend demo mode — chat history is
                    saved in this browser.
                  </p>

                  <p className="text-xs text-gray-400">
                    {question.length}/500
                  </p>

                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}