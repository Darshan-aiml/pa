'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Wrench,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { ChatMessage } from '@/types';

interface AiConciergeChatProps {
  currentPackageState: {
    package_id?: string;
    destination_id: string;
    hotel_id: string;
    transport_id: string;
    activity_ids: string[];
    nights: number;
    travelers: number;
  };
  onApplyPackageUpdate: (update: {
    hotel_id?: string;
    transport_id?: string;
    activity_ids?: string[];
    nights?: number;
    travelers?: number;
  }) => void;
  destinationName: string;
}

export const AiConciergeChat: React.FC<AiConciergeChatProps> = ({
  currentPackageState,
  onApplyPackageUpdate,
  destinationName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Namaste! I am your AI concierge for **${destinationName}**. I can upgrade your accommodation to heritage suites, add excursions, or switch transit modes in real time. How may I customize your journey?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    'Upgrade stay to 5-star heritage villa',
    'Switch transit to Toyota Innova Crysta',
    'Add adventure water sports or treks',
    'Include traditional culinary thali experiences',
    'Ensure pure vegetarian meal preferences',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          currentPackageState,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          toolCalls: data.toolCalls,
          pricing: data.pricing,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (data.updatedPackageState) {
          onApplyPackageUpdate(data.updatedPackageState);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `Unable to complete request: ${data.error || 'Server error'}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Network connection error. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="concierge" className="bg-white rounded-2xl border border-[#eaeae7] overflow-hidden shadow-2xs">
      {/* Header */}
      <div className="p-4 bg-[#111212] text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#155e42] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-white">AI Travel Concierge</h3>
            <p className="text-[11px] text-white/70">
              Personalize itinerary with real-time tool execution & deterministic pricing
            </p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="h-80 overflow-y-auto p-5 space-y-3.5 bg-[#fafaf9]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role !== 'user' && (
              <div className="w-7 h-7 rounded-full bg-[#111212] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-2xs ${
                msg.role === 'user'
                  ? 'bg-[#111212] text-white'
                  : 'bg-white text-[#111212] border border-[#eaeae7]'
              }`}
            >
              <div className="whitespace-pre-line font-normal">
                {msg.content}
              </div>

              {/* Tool Execution Pills */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="pt-2 border-t border-black/10 flex flex-col gap-1.5 text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#8c8c85]">
                    Executed Function Calls:
                  </span>
                  {msg.toolCalls.map((tc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#fafaf9] text-[#111212] border border-[#eaeae7]"
                    >
                      <Wrench className="w-3 h-3 text-[#155e42]" />
                      <span className="font-mono text-[10px]">{tc.name}</span>
                      <CheckCircle2 className="w-3 h-3 text-[#155e42] ml-auto" />
                    </div>
                  ))}
                </div>
              )}

              <span className={`text-[10px] block text-right pt-0.5 ${
                msg.role === 'user' ? 'text-white/60' : 'text-[#8c8c85]'
              }`}>
                {msg.timestamp}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-[#595954] text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-[#595954] bg-white p-3 rounded-full border border-[#eaeae7] w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#111212]" />
            <span>Consulting Gemini function declarations & inventory...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts (Hitchd pill suggestions) */}
      <div className="p-3 bg-white border-t border-[#eaeae7] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-[#8c8c85] uppercase tracking-wider shrink-0 px-1">
          Suggestions:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p)}
            disabled={isLoading}
            className="text-[11px] font-medium px-3 py-1 rounded-full bg-[#fafaf9] hover:bg-[#111212] hover:text-white border border-[#eaeae7] text-[#595954] transition-all whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-40"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-[#eaeae7] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask anything about ${destinationName} (e.g. "upgrade to Taj resort")...`}
          disabled={isLoading}
          className="flex-1 text-xs px-4 py-2.5 rounded-full border border-[#eaeae7] bg-[#fafaf9] focus:outline-none focus:border-[#111212] text-[#111212]"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          aria-label="Send message to AI Concierge"
          className="btn-hitchd-primary p-2.5 rounded-full flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
};
