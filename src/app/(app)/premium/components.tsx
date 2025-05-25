// src/app/(app)/premium/components.tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Brain, TrendingUp, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🏀 Hey there! I'm your NBA AI assistant. I can help you with predictions, betting strategies, statistical analysis, and more. What would you like to know?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    const messageToSend = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageToSend,
          context: 'nba_premium_assistant'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I encountered an error processing your request.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to get response from AI. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment. In the meantime, I can help with NBA predictions, betting strategies, Kelly Criterion calculations, and statistical analysis.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="relative bg-black/50 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
      <GlowingEffect
        disabled={false}
        proximity={200}
        spread={30}
        blur={2}
        glow={true}
        movementDuration={1.5}
        borderWidth={2}
        className="rounded-3xl"
      />
      
      {/* Chat Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">NBA AI Assistant</h3>
            <p className="text-gray-400 text-sm">Powered by 16 seasons of data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${error ? 'bg-red-400' : 'bg-green-400'}`}></div>
          <span className={`text-sm font-medium ${error ? 'text-red-400' : 'text-green-400'}`}>
            {error ? 'Connection Issue' : 'Online'}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-3 relative z-10">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto p-6 space-y-4 relative z-10">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'ai' && (
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-800/50 border border-gray-700/50 text-gray-100'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {message.sender === 'user' && (
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-800/50 border border-gray-700/50 px-4 py-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/10 relative z-10">
        <div className="flex gap-3">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about NBA predictions, betting strategies, or analytics..."
            className="flex-1 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Suggestion Pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            'What games should I bet on tonight?',
            'Explain Kelly Criterion for NBA betting',
            'Show me Lakers vs Warriors analysis',
            'Best under/over strategies',
            'How do you calculate expected value?'
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isTyping}
              className="px-3 py-1 text-xs bg-gray-800/50 border border-gray-700/50 rounded-full text-gray-300 hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Quick Stats Display */}
        <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
            69% Moneyline Accuracy
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            16 Seasons Training Data
          </span>
          <span className="flex items-center gap-1">
            <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            Real-time Analysis
          </span>
        </div>
      </div>
    </div>
  );
}

export function PremiumContent({ tier }: { tier: string }) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-green-400 via-cyan-500 to-blue-500 rounded-full opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 pt-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full px-6 py-3 mb-8">
            <span className="text-green-400">👑</span>
            <span className="text-green-400 font-medium">Premium Member - {tier.toUpperCase()}</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-white mb-6">
            Welcome to
            <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              PREMIUM ACCESS
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            You now have full access to our 69% accurate AI predictions, advanced analytics, and exclusive tools.
          </p>
        </div>

        <div className="space-y-8">
          {/* AI Chat Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-3 mb-6">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium">Premium AI Assistant</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
                Ask Our
                <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  NBA AI ANYTHING
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Get instant answers about predictions, betting strategies, statistical analysis, and more from our AI trained on 16 seasons of NBA data.
              </p>
            </div>
            
            <AIChat />
          </div>

          {/* Premium Features Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Advanced Analytics */}
            <div className="group relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-500 hover:transform hover:scale-105">
              <GlowingEffect
                disabled={false}
                proximity={150}
                spread={25}
                blur={1}
                glow={true}
                movementDuration={1}
                borderWidth={1}
                className="rounded-3xl"
              />
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Advanced Analytics</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Deep dive into team performance metrics, player efficiency ratings, and advanced statistical models that power our predictions.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 font-semibold">Real-time data processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-400 font-semibold">Custom performance metrics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-cyan-400 font-semibold">Predictive modeling</span>
                </div>
              </div>
            </div>

            {/* Priority Support */}
            <div className="group relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-500 hover:transform hover:scale-105">
              <GlowingEffect
                disabled={false}
                proximity={150}
                spread={25}
                blur={1}
                glow={true}
                movementDuration={1}
                borderWidth={1}
                className="rounded-3xl"
              />
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">AI-Powered Support</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Get instant help from our AI assistant and priority access to our expert team for strategy discussions and custom analysis.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-400 font-semibold">24/7 AI assistance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-cyan-400 font-semibold">Expert strategy calls</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-purple-400 font-semibold">Custom analysis requests</span>
                </div>
              </div>
            </div>

            {/* Exclusive Features */}
            <div className="group relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 hover:transform hover:scale-105">
              <GlowingEffect
                disabled={false}
                proximity={150}
                spread={25}
                blur={1}
                glow={true}
                movementDuration={1}
                borderWidth={1}
                className="rounded-3xl"
              />
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4">Exclusive Tools</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Access premium features including advanced Kelly Criterion calculators, custom bankroll management, and exclusive market insights.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-purple-400 font-semibold">Custom Kelly calculator</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-pink-400 font-semibold">Bankroll optimization</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-orange-400 font-semibold">Market inefficiency alerts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tier-specific content */}
          {tier === 'legend' && (
            <div className="mt-12">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/50 relative">
                <GlowingEffect
                  disabled={false}
                  proximity={200}
                  spread={30}
                  blur={2}
                  glow={true}
                  movementDuration={1.5}
                  borderWidth={2}
                  className="rounded-3xl"
                />
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-full text-sm font-black shadow-lg">
                    👑 LEGEND EXCLUSIVE
                  </div>
                </div>
                <div className="pt-4 text-center">
                  <h3 className="text-3xl font-black text-white mb-4">Neural Network Insights</h3>
                  <p className="text-gray-300 text-lg mb-6">
                    Get direct access to our neural network's decision-making process, see confidence intervals, and understand the mathematical reasoning behind each prediction.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-black/30 rounded-2xl p-6">
                      <h4 className="text-purple-400 font-bold text-lg mb-3">Model Transparency</h4>
                      <p className="text-gray-300 text-sm">
                        See exactly how our AI weighs different factors when making predictions, from team form to historical matchups.
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-2xl p-6">
                      <h4 className="text-pink-400 font-bold text-lg mb-3">Custom Strategies</h4>
                      <p className="text-gray-300 text-sm">
                        Work directly with our team to develop personalized betting strategies based on your risk tolerance and goals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotSubscribedView() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen relative z-10">
        <div className="w-full max-w-lg">
          <div className="relative bg-black/80 backdrop-blur-xl rounded-3xl p-8 border border-red-500/30">
            <GlowingEffect
              disabled={false}
              proximity={200}
              spread={30}
              blur={2}
              glow={true}
              movementDuration={1.5}
              borderWidth={2}
              className="rounded-3xl"
            />
            
            <div className="text-center relative z-10">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-black text-white mb-4">Premium Access Required</h1>
              <p className="text-gray-300 text-lg mb-8">
                Unlock the power of our 69% accurate NBA AI predictions and advanced analytics tools.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 font-semibold">69% Moneyline Accuracy</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-400 font-semibold">AI-Powered Chat Assistant</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-purple-400 font-semibold">Kelly Criterion Optimization</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-orange-400 font-semibold">Expected Value Calculations</span>
                </div>
              </div>

              <Link href="/pricing">
                <Button className="w-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-600 hover:from-red-600 hover:via-purple-600 hover:to-blue-700 text-white py-4 text-lg font-black rounded-2xl transition-all duration-300 transform hover:scale-105">
                  🚀 UPGRADE TO PREMIUM
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
