"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Palette } from "lucide-react";
import TeamSelector from "./TeamSelector";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  recommendations?: Array<{ tip: string }>;
}

interface Team {
  name: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your NBA betting advisor. Choose your favorite team above to customize the theme, then ask me about games, odds, or betting strategies!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [showTeamSelector, setShowTeamSelector] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load saved team preference
  useEffect(() => {
    const savedTeam = localStorage.getItem("favoriteTeam");
    if (savedTeam) {
      try {
        const parsed = JSON.parse(savedTeam);
        setSelectedTeam(parsed.code);
        setTeamData(parsed.team);
        setShowTeamSelector(false);
      } catch (error) {
        console.error("Error loading saved team:", error);
      }
    }
  }, []);

  const handleTeamChange = (teamCode: string, team: Team) => {
    setSelectedTeam(teamCode);
    setTeamData(team);
    setShowTeamSelector(false);
    
    // Add a message about the theme change
    const themeMessage: Message = {
      id: Date.now().toString(),
      content: `🎨 Great choice! I've applied the ${team.name} theme. Now, what NBA betting advice can I help you with?`,
      sender: "bot",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev.slice(0, 1), themeMessage]);
  };

  const getThemeColors = () => {
    if (!teamData) {
      return {
        primary: "#3B82F6", // Default blue
        secondary: "#1E40AF",
        accent: "#EFF6FF"
      };
    }
    
    return {
      primary: teamData.colors.primary,
      secondary: teamData.colors.secondary,
      accent: `${teamData.colors.primary}15` // 15% opacity
    };
  };

  const theme = getThemeColors();

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          user_id: "user123",
          session_id: Date.now().toString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "bot",
        timestamp: new Date(),
        recommendations: data.recommendations,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Team Selector */}
      {showTeamSelector && (
        <div className="flex justify-center">
          <TeamSelector 
            onTeamChange={handleTeamChange}
            selectedTeam={selectedTeam}
          />
        </div>
      )}

      {/* Team Theme Header */}
      {teamData && (
        <div 
          className="flex items-center justify-between p-4 rounded-lg border"
          style={{ 
            backgroundColor: theme.accent,
            borderColor: theme.primary + "30"
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: theme.primary }}
            />
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: theme.secondary }}
            />
            <span className="font-semibold" style={{ color: theme.primary }}>
              {teamData.name} Theme Active
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTeamSelector(true)}
            className="gap-2"
          >
            <Palette className="h-4 w-4" />
            Change Theme
          </Button>
        </div>
      )}

      {/* Chat Interface */}
      <Card 
        className="w-full h-[600px] flex flex-col"
        style={{ borderColor: theme.primary + "30" }}
      >
        <CardHeader style={{ backgroundColor: theme.accent }}>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" style={{ color: theme.primary }} />
            <span style={{ color: theme.primary }}>
              NBA Betting Advisor
              {teamData && ` - ${teamData.name} Fan`}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${
                      message.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center`}
                      style={{
                        backgroundColor: message.sender === "user" 
                          ? theme.primary 
                          : theme.accent,
                        color: message.sender === "user" 
                          ? "white" 
                          : theme.primary
                      }}
                    >
                      {message.sender === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3`}
                      style={{
                        backgroundColor: message.sender === "user" 
                          ? theme.primary 
                          : theme.accent,
                        color: message.sender === "user" 
                          ? "white" 
                          : theme.primary
                      }}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.recommendations && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-semibold">Recommendations:</p>
                          {message.recommendations.map((rec, index) => (
                            <div
                              key={index}
                              className="text-xs rounded p-1"
                              style={{ 
                                backgroundColor: message.sender === "user" 
                                  ? "rgba(255,255,255,0.2)" 
                                  : theme.primary + "20"
                              }}
                            >
                              • {rec.tip}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.accent, color: theme.primary }}
                    >
                      <Bot className="h-4 w-4" />
                    </div>
                    <div 
                      className="rounded-lg p-3"
                      style={{ backgroundColor: theme.accent }}
                    >
                      <div className="flex space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{ backgroundColor: theme.primary }}
                        ></div>
                        <div 
                          className="w-2 h-2 rounded-full animate-bounce delay-100"
                          style={{ backgroundColor: theme.primary }}
                        ></div>
                        <div 
                          className="w-2 h-2 rounded-full animate-bounce delay-200"
                          style={{ backgroundColor: theme.primary }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div 
            className="p-4 border-t"
            style={{ borderColor: theme.primary + "30" }}
          >
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about NBA games, betting odds, or strategies..."
                disabled={isLoading}
                className="flex-1"
                style={{ borderColor: theme.primary + "30" }}
              />
              <Button 
                onClick={sendMessage} 
                disabled={isLoading || !input.trim()}
                style={{ backgroundColor: theme.primary }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
