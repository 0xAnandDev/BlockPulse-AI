import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Send, Sparkles, User } from 'lucide-react'
import AppShell from '../components/dashboard/AppShell'
import { CHAT_SUGGESTIONS, DEFAULT_CHAT_REPLY } from '../lib/mock/chat'

export const Route = createFileRoute('/ai-insights')({ component: AiInsightsRoute })

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const INITIAL_MESSAGES: Array<ChatMessage> = [
  {
    id: 'welcome',
    role: 'assistant',
    text: "Hi, I'm your AI security analyst. Ask me about any wallet, transaction, or risk level and I'll explain it in plain English.",
  },
]

function findAnswer(question: string): string {
  const match = CHAT_SUGGESTIONS.find((s) => s.question.toLowerCase() === question.trim().toLowerCase())
  return match?.answer ?? DEFAULT_CHAT_REPLY
}

function AiInsightsRoute() {
  const [messages, setMessages] = useState<Array<ChatMessage>>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const sendMessage = (text: string) => {
    if (!text.trim() || isThinking) return
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: text.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    setTimeout(() => {
      const reply: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', text: findAnswer(text) }
      setMessages((prev) => [...prev, reply])
      setIsThinking(false)
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
      })
    }, 900)
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <p className="kicker mb-1">AI insights</p>
          <h1 className="display-title text-2xl font-bold text-[var(--ink)]">Ask your security analyst</h1>
        </div>

        <div className="panel flex h-[65vh] flex-col rounded-2xl">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
            <div className="flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        message.role === 'assistant'
                          ? 'border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--cyan)]'
                          : 'bg-[linear-gradient(135deg,var(--indigo),var(--cyan))] text-white'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <User className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        message.role === 'assistant'
                          ? 'rounded-tl-sm border border-[var(--line)] bg-[rgba(10,14,24,0.5)] text-[var(--ink-soft)]'
                          : 'rounded-tr-sm bg-[linear-gradient(135deg,rgba(99,102,241,0.25),rgba(34,211,238,0.2))] text-[var(--ink)]'
                      }`}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isThinking && (
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--cyan)]">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="flex gap-1 rounded-2xl rounded-tl-sm border border-[var(--line)] bg-[rgba(10,14,24,0.5)] px-4 py-3.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--ink-faint)]"
                        style={{ animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 border-t border-[var(--line)] px-5 py-3.5">
              {CHAT_SUGGESTIONS.map((s) => (
                <button
                  key={s.question}
                  type="button"
                  onClick={() => sendMessage(s.question)}
                  className="rounded-full border border-[var(--line-strong)] bg-white/5 px-3.5 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition hover:border-[var(--cyan)] hover:text-[var(--ink)]"
                >
                  {s.question}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex items-center gap-2 border-t border-[var(--line)] p-3"
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage(input)
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a wallet, transaction, or risk..."
              className="flex-1 rounded-full border border-[var(--line)] bg-[rgba(10,14,24,0.6)] px-4 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)] focus:border-[var(--cyan)] focus:ring-2 focus:ring-[rgba(34,211,238,0.18)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              aria-label="Send message"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(90deg,var(--indigo),var(--cyan))] text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
