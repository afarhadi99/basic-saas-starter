// src/components/nba-chatbot.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Loader2, TrendingUp, DollarSign } from 'lucide-react';
import { nbaApi, type NBAGamePrediction } from '@/lib/nba-api';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  predictions?: NBAGamePrediction[];
  timestamp: Date;
}

export function NBAChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: '🏀 Hey! I\'m your NBA AI assistant. Ask me about tonight\'s games, predictions, or betting recommendations!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatPredictionMessage = (predictions: NBAGamePrediction[], sportsbook: string): string => {
    if (!predictions || predictions.length === 0) {
      return "No games found for today. Check back later!";
    }

    let message = `🏀 **NBA Predictions** (${sportsbook})\n\n`;
    
    predictions.forEach((game, index) => {
      const homeTeam = game.home_team;
      const awayTeam = game.away_team;
      const winner = game.predicted_winner;
      const confidence = game.winner_confidence;
      const ouPrediction = game.under_over_prediction;
      const ouConfidence = game.under_over_confidence;
      const ouLine = game.under_over_line;

      message += `**${awayTeam} @ ${homeTeam}**\n`;
      message += `🎯 **Winner**: ${winner} (${confidence}% confidence)\n`;
      message += `📊 **O/U**: ${ouPrediction} ${ouLine} (${ouConfidence}% confidence)\n\n`;

      message += `💰 **Betting Info**:\n`;
      message += `• ${homeTeam}: ${game.home_odds > 0 ? '+' : ''}${game.home_odds} (EV: ${game.expected_value.home_team > 0 ? '+' : ''}${game.expected_value.home_team.toFixed(2)})\n`;
      message += `• ${awayTeam}: ${game.away_odds > 0 ? '+' : ''}${game.away_odds} (EV: ${game.expected_value.away_team > 0 ? '+' : ''}${game.expected_value.away_team.toFixed(2)})\n\n`;

      if (game.kelly_criterion) {
        message += `🎯 **Kelly Criterion**:\n`;
        if (game.kelly_criterion.home_team > 0) {
          message += `• Bet ${game.kelly_criterion.home_team.toFixed(1)}% of bankroll on ${homeTeam}\n`;
        }
        if (game.kelly_criterion.away_team > 0) {
          message += `• Bet ${game.kelly_criterion.away_team.toFixed(1)}% of bankroll on ${awayTeam}\n`;
        }
        if (game.kelly_criterion.home_team === 0 && game.kelly_criterion.away_team === 0) {
          message += `• No recommended bets (negative expected value)\n`;
        }
      }

      message += '\n---\n\n';
    });

    return message;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const input = inputValue.toLowerCase();
      
      if (input.includes('prediction') || input.includes('game') || input.includes('nba') || input.includes('tonight') || input.includes('today')) {
        // Determine sportsbook from input
        let sportsbook = 'fanduel';
        if (input.includes('draftkings')) sportsbook = 'draftkings';
        else if (input.includes('betmgm')) sportsbook = 'betmgm';
        else if (input.includes('caesars')) sportsbook = 'caesars';

        const response = await nbaApi.getPredictions(sportsbook, 'xgboost', true);
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: formatPredictionMessage(response.predictions, response.sportsbook),
          predictions: response.predictions,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else if (input.includes('help') || input.includes('what can you do')) {
        const helpMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `🤖 **I can help you with:**

🏀 **NBA Predictions** - "What are tonight's predictions?"
📊 **Betting Analysis** - Get Expected Value and Kelly Criterion
💰 **Sportsbook Odds** - FanDuel, DraftKings, BetMGM, and more
🎯 **Bankroll Management** - Optimal bet sizing recommendations

**Try asking:**
• "Give me predictions for tonight's games"
• "What's the best bet for FanDuel?"
• "Show me DraftKings odds"
• "Any profitable bets today?"`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, helpMessage]);
      } else {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `I'm focused on NBA predictions! Try asking:
• "What are tonight's NBA predictions?"
• "Give me betting recommendations"
• "Show me the best bets"
• "Help" - for more options`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `❌ Sorry, I couldn't fetch predictions right now. Make sure your NBA API is running on localhost:8000.

Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-orange-500/25"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-black/90 backdrop-blur-xl border border-orange-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-orange-500/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold">🏀</span>
              </div>
              <div>
                <h3 className="text-white font-bold">NBA AI Assistant</h3>
                <p className="text-gray-400 text-sm">69% Win Rate Predictions</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                      : 'bg-gray-800/50 border border-gray-700/50 text-gray-100'
                  }`}
                >
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {message.content.split('\n').map((line, index) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <div key={index} className="font-bold text-orange-400 mb-1">
                            {line.replace(/\*\*/g, '')}
                          </div>
                        );
                      }
                      if (line.includes('EV:') || line.includes('Kelly')) {
                        return (
                          <div key={index} className="text-green-400 text-xs mb-1">
                            {line}
                          </div>
                        );
                      }
                      if (line === '---') {
                        return <hr key={index} className="border-gray-600 my-2" />;
                      }
                      return (
                        <div key={index} className="mb-1">
                          {line}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Prediction Cards */}
                  {message.predictions && (
                    <div className="mt-3 space-y-2">
                      {message.predictions.map((prediction, index) => (
                        <div
                          key={index}
                          className="bg-black/30 border border-orange-500/20 rounded-xl p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-orange-400 font-bold text-sm">
                              {prediction.away_team} @ {prediction.home_team}
                            </span>
                            <span className="text-green-400 text-xs">
                              {prediction.model}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-blue-400" />
                              <span className="text-blue-400">
                                {prediction.predicted_winner} ({prediction.winner_confidence}%)
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-purple-400" />
                              <span className="text-purple-400">
                                {prediction.under_over_prediction} {prediction.under_over_line}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading Message */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/50 border border-gray-700/50 text-gray-100 p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                    <span className="text-sm">Getting predictions...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-700/50 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about NBA predictions..."
                className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 p-2 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
