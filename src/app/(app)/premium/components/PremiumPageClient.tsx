// src/app/(app)/premium/components/PremiumPageClient.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Menu, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

import { ChatSidebar } from './ChatSidebar';
import { ChatInterface } from './ChatInterface';
import { GameOddsSection } from './GameOddsSection'; // This will need to be the version that scrolls internally

// --- SHARED TYPE DEFINITIONS --- (Ensure these are your complete and correct definitions)
export interface GroundingSourceDetail { uri?: string; title?: string; renderedContent?: string; }
export type LiveDataStatus = 'Scheduled' | 'Live' | 'Final' | 'Postponed' | 'Halftime' | 'Delayed' | 'Upcoming';
export interface ChatMessage { id: string; text: string; sender: 'user' | 'ai'; timestamp: Date; isLoading?: boolean; isError?: boolean; groundingSources?: GroundingSourceDetail[]; gamePredictionData?: GameOddsUIData | GameOddsUIData[]; }
export interface GameOddsUIData { game_identifier: string; gameTitle?: string; away_team: string; home_team: string; away_team_logo_url?: string; home_team_logo_url?: string; sportsbook_name: string; sportsbook_raw_data: { money_line: { home: number; away: number }; total_points_line: number; }; ai_prediction_details: { predicted_winner: string; winner_confidence_percent: number; total_points_pick: "OVER" | "UNDER" | "N/A"; total_points_confidence_percent: number; expected_value?: { home_team: number; away_team: number }; model_used: string; kelly_criterion_stake_percent?: { home_team: number | "No Bet"; away_team: number | "No Bet" }; }; game_start_time_utc?: string; keyBettingAdvice?: string; live_data?: { status: LiveDataStatus; home_score?: number; away_score?: number; current_period?: string; time_remaining?: string; last_updated?: string; }; }
export interface ChatSession { id: string; title: string; messages: ChatMessage[]; createdAt: Date; updatedAt: Date; }
// --- END ---

interface PremiumPageClientProps {
  userFullName: string;
  subscriptionTier: string;
  initialOddsData: any | null;
  initialOddsError: string | null;
}

export function PremiumPageClient({
  userFullName,
  subscriptionTier,
  initialOddsData,
  initialOddsError,
}: PremiumPageClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [displayedOdds, setDisplayedOdds] = useState<GameOddsUIData[]>([]);
  const [isLoadingInitialOdds, setIsLoadingInitialOdds] = useState(true);
  const [hasUserInteractedForInitialOdds, setHasUserInteractedForInitialOdds] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const activeChat = chatSessions.find(session => session.id === activeChatId);

  useEffect(() => {
    const checkScreenSize = () => { setIsSidebarOpen(window.innerWidth >= 768); };
    checkScreenSize(); window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getSafeStatus = useCallback((apiStatus: any): LiveDataStatus => {
      const validStatuses: LiveDataStatus[] = ['Scheduled', 'Live', 'Final', 'Postponed', 'Halftime', 'Delayed', 'Upcoming'];
      if (typeof apiStatus === 'string' && validStatuses.includes(apiStatus as LiveDataStatus)) {
          return apiStatus as LiveDataStatus;
      }
      return 'Scheduled';
  }, []);

  const mapRawApiPredictionToUIGameOdds = useCallback((predFromApi: any, sourceOddsData: any): GameOddsUIData => {
    const gameKey = `${predFromApi.home_team}:${predFromApi.away_team}`;
    const sportsbookGameData = sourceOddsData?.odds_data?.[gameKey] || {};
    const mappedData: GameOddsUIData = {
      game_identifier: gameKey, gameTitle: `${predFromApi.away_team} @ ${predFromApi.home_team}`, away_team: predFromApi.away_team, home_team: predFromApi.home_team,
      away_team_logo_url: predFromApi.away_team_logo_url || '/logos/placeholder_away.png',
      home_team_logo_url: predFromApi.home_team_logo_url || '/logos/placeholder_home.png',
      sportsbook_name: sourceOddsData?.sportsbook || "N/A",
      sportsbook_raw_data: { money_line: { home: sportsbookGameData.home_money_line ?? predFromApi.home_odds, away: sportsbookGameData.away_money_line ?? predFromApi.away_odds }, total_points_line: sportsbookGameData.under_over ?? predFromApi.under_over_line ?? 0, },
      ai_prediction_details: { predicted_winner: predFromApi.predicted_winner, winner_confidence_percent: predFromApi.winner_confidence ?? 0, total_points_pick: predFromApi.under_over_prediction || "N/A", total_points_confidence_percent: predFromApi.under_over_confidence ?? 0, expected_value: predFromApi.expected_value, model_used: predFromApi.model, kelly_criterion_stake_percent: predFromApi.kelly_criterion ? { home_team: (typeof predFromApi.kelly_criterion.home_team === 'number' && predFromApi.kelly_criterion.home_team > 0) ? predFromApi.kelly_criterion.home_team : "No Bet", away_team: (typeof predFromApi.kelly_criterion.away_team === 'number' && predFromApi.kelly_criterion.away_team > 0) ? predFromApi.kelly_criterion.away_team : "No Bet",} : undefined, },
      game_start_time_utc: predFromApi.game_start_time_utc,
      live_data: { status: getSafeStatus(predFromApi.live_data?.status || predFromApi.status), home_score: predFromApi.live_data?.home_score ?? predFromApi.home_score, away_score: predFromApi.live_data?.away_score ?? predFromApi.away_score, current_period: predFromApi.live_data?.current_period ?? predFromApi.current_period, time_remaining: predFromApi.live_data?.time_remaining ?? predFromApi.time_remaining, last_updated: predFromApi.live_data?.last_updated ?? predFromApi.last_updated_time, },
      keyBettingAdvice: predFromApi.keyBettingAdvice || "AI analysis will provide advice."
    };
    return mappedData;
  }, [getSafeStatus]);

  useEffect(() => { 
    const defaultChatId = `chat-default-${Date.now()}`;
    const initialAiGreeting: ChatMessage = { id: `ai-greeting-${Date.now()}`, sender: 'ai', text: "Hello! How can I assist with your NBA betting today?", timestamp: new Date(), };
    let initialMessages: ChatMessage[] = [initialAiGreeting];
    if (initialOddsError) { toast.error(`Could not pre-load initial odds: ${initialOddsError}`); console.error("PPC: Err initialOdds:", initialOddsError);
    } else if (initialOddsData && initialOddsData.predictions && initialOddsData.predictions.length > 0) {
      const formattedInitialOdds = initialOddsData.predictions.map((p: any) => mapRawApiPredictionToUIGameOdds(p, initialOddsData));
      setDisplayedOdds(formattedInitialOdds);
    } else { console.log("PPC: No initial odds/malformed.", initialOddsData); }
    setIsLoadingInitialOdds(false);
    const defaultSession: ChatSession = { id: defaultChatId, title: 'NBA Insights Chat', messages: initialMessages, createdAt: new Date(), updatedAt: new Date() };
    setChatSessions([defaultSession]); setActiveChatId(defaultChatId);
  }, [initialOddsData, initialOddsError, mapRawApiPredictionToUIGameOdds]);
  
  const handleSendMessage = async () => { /* ... Your last working version of handleSendMessage ... */ };
  const addMessageToChat = (chatId: string, message: ChatMessage) => { /* ... same ... */ };
  const updateAIMessageInChat = ( chatId: string, messageId: string, newText: string, isLoading: boolean, isError: boolean, groundingSources?: GroundingSourceDetail[], gamePredictionData?: GameOddsUIData | GameOddsUIData[] ) => { /* ... same ... */ };
  useEffect(() => { if (activeChat?.messages.length) { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } }, [activeChat?.messages]);
  const handleNewChat = () => { /* ... same ... */ };
  const handleSelectChat = (id: string) => { /* ... same ... */ };
  const handleRenameChat = (id: string, title: string) => { /* ... same ... */ };
  const displaySearchSuggestions = (html: string) => { /* ... same ... */ };

  return (
    // REVERTED to: flex h-screen max-h-screen ... overflow-hidden
    <div className="flex h-screen max-h-screen bg-black text-white overflow-hidden pt-16 md:pt-20">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden fixed top-20 left-2 z-[60] text-white bg-black/50 hover:bg-orange-500/80" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {/* The div containing sidebar and main content area. flex-1 allows it to take full height within the h-screen parent */}
      <div className={cn("flex flex-1", isSidebarOpen ? "md:pl-72" : "md:pl-0", "transition-all duration-300 ease-in-out")}>
        <ChatSidebar 
            sessions={chatSessions.map(s => ({ id: s.id, title: s.title }))} 
            activeChatId={activeChatId} 
            onNewChat={handleNewChat} 
            onSelectChat={handleSelectChat} 
            onRenameChat={handleRenameChat} 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen} 
        />
        {/* REVERTED: main tag has overflow-hidden to ensure its children (ChatInterface and GameOddsSection) are constrained by its flex layout */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <ChatInterface 
              activeChat={activeChat} 
              inputValue={inputValue} 
              setInputValue={setInputValue} 
              handleSendMessage={handleSendMessage} 
              isSending={isSending} 
              messagesEndRef={messagesEndRef} 
              inputRef={inputRef} 
              userFullName={userFullName} 
              displaySearchSuggestions={displaySearchSuggestions} 
            />
            {/* GameOddsSection will need its internal scrolling enabled again */}
            <GameOddsSection 
              odds={displayedOdds} 
              initialError={initialOddsError} 
              isLoading={isLoadingInitialOdds} 
            />
        </main>
      </div>
    </div>
  );
}
