"use client";
import { useRef, useState } from "react";
import { api } from "@/lib/api";

interface Message { who: "you" | "bot"; text: string; sources?: string[] }

const SUGGESTIONS = [
  "Which products will run out next week?",
  "Compare this month with last month",
  "Which supplier delivers the fastest?",
  "What is my inventory value?",
];

/** Copilot answers are grounded in tenant data and show their figures (FR-AI-COP-02). */
export function Copilot() {
  const [messages, setMessages] = useState<Message[]>([{
    who: "bot",
    text: "Ask me anything about stock, sales, suppliers, or margins. I'll show the figures behind every answer so you can check them.",
  }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setMessages((m) => [...m, { who: "you", text: question }]);
    setInput("");
    setBusy(true);

    try {
      const res = await api.askCopilot(question);
      const facts = res.grounded_in as Record<string, unknown>;
      const sources = Object.entries(facts)
        .filter(([, v]) => typeof v === "number")
        .slice(0, 4)
        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);
      setMessages((m) => [...m, { who: "bot", text: res.answer, sources }]);
    } catch (e) {
      setMessages((m) => [...m, {
        who: "bot",
        text: e instanceof Error ? e.message : "I could not reach the server. Try again in a moment.",
      }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
      });
    }
  }

  return (
    <section className="rounded-lg border border-line bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-line px-4.5 py-3.5">
        <div>
          <h2 className="font-display text-sm font-semibold">Ask about your business</h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            Answers are built only from this store&apos;s records
          </p>
        </div>
        <span className="rounded border border-dashed border-ai bg-[#F2F5FC] px-1.5 py-0.5
                         text-[10px] font-bold uppercase tracking-wider text-ai">
          Copilot
        </span>
      </div>

      <div ref={scroller} className="flex min-h-[220px] flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[92%] text-[13px] leading-relaxed ${
            m.who === "you"
              ? "self-end rounded-xl rounded-br-sm bg-ink px-3 py-2 text-white"
              : "self-start rounded-xl rounded-bl-sm border border-line bg-[#F4F6FA] px-3 py-2.5"
          }`}>
            {m.text}
            {m.sources && m.sources.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 border-t border-dashed border-[#D6DEE9] pt-2
                              text-[11px] text-ink-soft">
                <span>Based on</span>
                {m.sources.map((s) => (
                  <b key={s} className="rounded border border-line bg-white px-1.5 font-mono font-semibold text-ink">
                    {s}
                  </b>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && <p className="self-start text-[13px] text-ink-soft">Checking your records…</p>}
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => ask(s)}
                  className="rounded-full border border-line px-2.5 py-1 text-[11.5px] text-ink-soft
                             hover:border-ai hover:text-ai">
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2 border-t border-line bg-[#FAFBFD] p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(input)}
          placeholder="Type a question…"
          aria-label="Ask the Copilot a question"
          className="flex-1 rounded-lg border border-line px-3 py-2 text-[13px] focus:outline-2 focus:outline-ai"
        />
        <button onClick={() => ask(input)} disabled={busy}
                className="rounded-lg bg-ink px-4 py-2 text-[13px] font-medium text-white
                           hover:bg-ink-2 disabled:opacity-50">
          Ask
        </button>
      </div>
    </section>
  );
}
