import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Lightbulb, MessageSquare, X } from 'lucide-react';
import { ChatMessage, PartnerInfo } from '../types';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  partnerInfo: PartnerInfo | null;
  isPartnerTyping: boolean;
  onSendMessage: (text: string) => void;
  onSendReaction: (emoji: string) => void;
  onTyping: (isTyping: boolean) => void;
  isCallConnected: boolean;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🔥', '👏', '🎉', '⚡', '🚀'];

const ICEBREAKERS = [
  "What music do you listen to?",
  "If you could teleport anywhere right now, where?",
  "What's your favorite comfort food?",
  "Best movie or show you've seen recently?",
  "What's a weird skill or hobby you have?",
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  messages,
  partnerInfo,
  isPartnerTyping,
  onSendMessage,
  onSendReaction,
  onTyping,
  isCallConnected,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isPartnerTyping, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
    onTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handlePickIcebreaker = () => {
    const random = ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)];
    setInputText(random);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 top-16 z-40 bg-white/95 backdrop-blur-md rounded-t-3xl border-t border-purple-200 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200">
      
      {/* Bottom Sheet Header with Grab Handle */}
      <div className="p-3 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
          <h4 className="font-bold text-sm text-slate-900">
            Chat with {partnerInfo?.name || 'Stranger'}
          </h4>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-purple-100 text-purple-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 min-h-0 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-purple-400">
            <Smile className="w-8 h-8 mb-2 opacity-50 text-purple-400" />
            <p className="text-xs">Say hi! Keep conversations friendly and respectful.</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center my-1.5">
                  <span className="text-[10px] text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 inline-block">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMe = msg.sender === 'me';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl break-words leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-purple-600 text-white rounded-br-xs'
                      : 'bg-purple-50 text-slate-800 rounded-bl-xs border border-purple-200/80'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-purple-400 mt-0.5 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}

        {isPartnerTyping && (
          <div className="flex items-center gap-1.5 text-[11px] text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full w-fit">
            <span>Stranger is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Reactions */}
      <div className="px-3 py-1.5 border-t border-purple-100 bg-purple-50/50 flex items-center justify-between gap-1 overflow-x-auto">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSendReaction(emoji)}
            disabled={!isCallConnected}
            className="text-base p-1.5 rounded-lg hover:bg-purple-100 active:scale-125 transition-transform disabled:opacity-40"
          >
            {emoji}
          </button>
        ))}
        <button
          onClick={handlePickIcebreaker}
          className="text-[11px] text-purple-700 font-semibold px-2 py-1 rounded-lg hover:bg-purple-100 flex items-center gap-1 shrink-0"
        >
          <Lightbulb className="w-3 h-3 text-purple-600" />
          <span>Icebreaker</span>
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-purple-100 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={isCallConnected ? "Type a message..." : "Waiting for match..."}
          disabled={!isCallConnected}
          className="flex-1 bg-purple-50/60 text-slate-900 placeholder-purple-300 text-xs px-3.5 py-2.5 rounded-2xl border border-purple-200 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || !isCallConnected}
          className="p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
