// src/app/(app)/premium/components/ChatInterface.tsx
'use client';

import React, { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, User, Bot, AlertTriangle, Brain } from 'lucide-react';
// import { ScrollArea } from '@/components/ui/scroll-area'; // Using div fallback
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
// Import the shared types from PremiumPageClient
import { ChatMessage, GameOddsUIData } from './PremiumPageClient'; 
import { AIChatGameCard } from './AIChatGameCard'; // Import the new card component

interface ActiveChatDisplayInfo {
  id: string | null;
  title: string;
  messages: ChatMessage[];
}

interface ChatInterfaceProps {
  activeChat: ActiveChatDisplayInfo | undefined;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => Promise<void>;
  isSending: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  userFullName: string;
  displaySearchSuggestions: (htmlContent: string) => void; // Kept for grounding suggestions
}

export function ChatInterface({
  activeChat,
  inputValue,
  setInputValue,
  handleSendMessage,
  isSending,
  messagesEndRef,
  inputRef,
  userFullName,
  // displaySearchSuggestions, // Not directly used for rendering here, but passed for other logic
}: ChatInterfaceProps) {
  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black/60 p-8 text-center">
        <Brain className="w-16 h-16 text-orange-500 mb-6" />
        <h2 className="text-2xl font-semibold text-white mb-2">Welcome to Betting Buddy AI!</h2>
        <p className="text-gray-400">Select a chat from the sidebar or start a new one to begin.</p>
      </div>
    );
  }
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-black via-gray-900/95 to-black overflow-hidden shadow-xl">
      <div className="p-5 border-b border-gray-700/50 bg-black/50 backdrop-blur-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white truncate">{activeChat.title}</h2>
          <p className="text-xs text-orange-400">
            Powered by Gemini 2.5 Flash
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-transparent scrollbar-thin scrollbar-thumb-gray-700/80 scrollbar-track-gray-800/50 scrollbar-thumb-rounded-full">
        {activeChat.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex w-full items-start gap-3",
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.sender === 'ai' && (
              <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-orange-500/70 self-start mt-1">
                <AvatarImage src="/logo.png" alt="AI" />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">AI</AvatarFallback>
              </Avatar>
            )}

            <div
              className={cn(
                "max-w-[85%] md:max-w-[75%] p-3.5 rounded-2xl shadow-md text-sm leading-relaxed",
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-br-none'
                  : 'bg-gray-800/70 border border-gray-700/60 text-gray-100 rounded-bl-none',
                msg.isLoading && 'animate-pulse',
                msg.isError && 'border-red-500/50 bg-red-900/30'
              )}
            >
              {msg.isLoading && !msg.text && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
              
              {/* Render AI's conversational text (potentially without the JSON block) */}
              {msg.text && (
                <div 
                  className="whitespace-pre-wrap" 
                  dangerouslySetInnerHTML={{ __html: msg.sender === 'ai' ? msg.text.replace(/```json[\s\S]*?```/g, '').trim() : msg.text }} 
                />
              )}
              
              {/* Render structured game data using AIChatGameCard if present */}
              {msg.sender === 'ai' && msg.gamePredictionData && (
                Array.isArray(msg.gamePredictionData) 
                  ? msg.gamePredictionData.map((gameData, index) => (
                      <AIChatGameCard key={`${msg.id}-game-${index}`} gameData={gameData} />
                    ))
                  : <AIChatGameCard gameData={msg.gamePredictionData as GameOddsUIData} />
              )}
              
              {msg.isError && !msg.isLoading && (
                <span className="text-red-400 text-xs block mt-1">
                  <AlertTriangle className="inline h-3 w-3 mr-1" />
                  Failed to get response.
                </span>
              )}
              {msg.sender === 'ai' && msg.groundingSources?.map((source, idx) => (
                source.renderedContent && (
                  <div 
                    key={`${msg.id}-grounding-${idx}`} 
                    className="mt-2 text-xs border-t border-gray-600/50 pt-2 rendered-html-content"
                    dangerouslySetInnerHTML={{ __html: source.renderedContent }}
                    onClick={(e) => { /* ... link handling ... */ }}
                  />
                )
              ))}
            </div>

            {msg.sender === 'user' && (
              <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-blue-500/70 self-end mb-1">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {userFullName?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-5 border-t border-gray-700/50 bg-black/70 backdrop-blur-sm">
        {/* ... Input Area as before ... */}
        <div className="flex items-center gap-3 bg-gray-800/50 border border-gray-700/50 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-orange-500/70 transition-shadow">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about NBA odds, predictions, or betting strategies..."
            className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 text-base px-3 py-2.5"
            disabled={isSending || !activeChat}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !inputValue.trim() || !activeChat}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-orange-500/30 transition-all active:scale-95"
            size="lg"
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
