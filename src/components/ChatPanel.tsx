import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Lightbulb, X } from 'lucide-react';
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

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🔥', '👏', '🎉', '⚡', '✨'];

const ICEBREAKERS = [
  "What music do you listen to?",
  "If you could teleport anywhere right now, where?",
  "What's your favorite comfort food?",
  "Best movie or anime you've seen recently?",
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
    onSendMessage(inputText.trim());
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
    <div className="absolute inset-x-0 bottom-0 top-12 z-40 bg-[#120E28] text-white rounded-t-[28px] border-t border-white/15 shadow-[0_-12px_40px_rgba(0,0,0,0.6)] flex flex-col animate-in slide-in-from-bottom duration-250 select-none overflow-hidden">
      
      {/* Top Handle bar */}
      <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

      {/* Sheet Header */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#171233]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <h4 className="font-bold text-sm text-white truncate">
            {partnerInfo ? partnerInfo.name : 'Stranger'}
          </h4>
          {partnerInfo?.country && (
            <span className="text-[11px] text-[#A89CD6] truncate shrink-0">
              ({partnerInfo.country})
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-white/10 active:scale-95 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Close chat"
        >
          <X className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-2.5 min-h-0 text-xs sm:text-sm">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#A89CD6]">
            <Smile className="w-10 h-10 mb-2 opacity-50 text-[#6538F6]" />
            <p className="text-xs max-w-xs font-medium">Say hi! Keep conversations friendly and respectful.</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center my-1.5 px-2">
                  <span className="text-[10px] text-[#CBBEE8] bg-[#1B153D] border border-white/10 px-3 py-1 rounded-full font-medium inline-block break-words max-w-[90%]">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMe = msg.sender === 'me';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
              >
                <div
                  className={`px-3.5 py-2 text-xs sm:text-sm shadow-md break-words max-w-[85%] sm:max-w-[80%] [overflow-wrap:anywhere] ${
                    isMe
                      ? 'bg-[#6538F6] text-white rounded-[18px] rounded-br-[4px]'
                      : 'bg-[#1B153D] text-white border border-white/10 rounded-[18px] rounded-bl-[4px]'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[9px] text-[#A89CD6] px-1 mt-0.5">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}

        {isPartnerTyping && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#CBBEE8] bg-[#1B153D] border border-white/10 px-3 py-1 rounded-full w-fit font-medium animate-pulse">
            <span>Stranger is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Reactions Row */}
      <div className="px-3 py-1.5 border-t border-white/10 bg-[#171233] flex items-center justify-between gap-1 overflow-x-auto shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendReaction(emoji)}
              disabled={!isCallConnected}
              className="text-base p-1.5 rounded-full hover:bg-white/10 active:scale-125 transition-transform disabled:opacity-30 cursor-pointer shrink-0"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <button
          onClick={handlePickIcebreaker}
          className="text-[11px] text-[#CBBEE8] bg-[#1B153D] hover:bg-[#251D52] border border-white/10 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 transition-colors cursor-pointer ml-1"
          title="Pick random icebreaker"
        >
          <Lightbulb className="w-3 h-3 text-amber-300" />
          <span>Icebreaker</span>
        </button>
      </div>

      {/* Input Field Form */}
      <form onSubmit={handleSubmit} className="p-2.5 sm:p-3 border-t border-white/10 bg-[#120E28] flex items-center gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={isCallConnected ? "Type a message..." : "Waiting for match..."}
          disabled={!isCallConnected}
          className="flex-1 h-11 sm:h-12 bg-[#1B153D] text-white placeholder-white/40 text-xs sm:text-sm px-4 rounded-full border border-white/15 focus:border-[#7F57FF] focus:outline-none transition-all disabled:opacity-50"
        />
        
        <button
          type="submit"
          disabled={!inputText.trim() || !isCallConnected}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#6538F6] hover:bg-[#5527E6] text-white disabled:opacity-40 transition-all active:scale-95 cursor-pointer shadow-md shadow-[#6538F6]/30 flex items-center justify-center shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
