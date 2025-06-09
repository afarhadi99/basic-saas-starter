// src/app/(app)/premium/components/OddsDisplayCard.tsx
'use client';

import Image from 'next/image';
import React from 'react';
import { GameOddsUIData } from './PremiumPageClient';
import {
    TrendingUp, InfoIcon, BarChartBigIcon, ZapIcon, RadioTowerIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface OddsDisplayCardProps {
  gameOdds: GameOddsUIData;
}

const ConfidenceBar = ({ percentage, barColor = "bg-cyan-500" }: { percentage: number, barColor?: string }): React.ReactNode => {
  const widthPercentage = Math.max(0, Math.min(100, percentage));
  return (
    <div className="w-full bg-gray-700/50 rounded-full h-2.5 my-1 overflow-hidden shadow-inner">
      <div
        className={cn("h-2.5 rounded-full transition-all duration-500 ease-out", barColor, "shadow-md")}
        style={{ width: `${widthPercentage}%` }}
      ></div>
    </div>
  );
};

const EVIndicator = ({ value }: { value: number }): React.ReactNode => {
  if (value === undefined || value === null) return <span className="text-gray-500 text-xs">N/A</span>;
  const isPositive = value > 0;
  const barWidth = Math.min(30, Math.abs(value) * 2); 
  return (
    <div className="flex items-center w-full my-0.5" title={`EV: ${value.toFixed(2)}`}>
      <div className="w-1/2 h-2 bg-gray-700/20 rounded-l-full flex justify-end overflow-hidden">
        {!isPositive && <div className="h-2 bg-red-500/80 rounded-l-full shadow-sm" style={{ width: `${barWidth}%` }}></div>}
      </div>
      <div className="w-px h-3 bg-gray-600/70"></div>
      <div className="w-1/2 h-2 bg-gray-700/20 rounded-r-full flex justify-start overflow-hidden">
        {isPositive && <div className="h-2 bg-green-500/80 rounded-r-full shadow-sm" style={{ width: `${barWidth}%` }}></div>}
      </div>
      <span className={cn("ml-2 text-xs font-bold tracking-wider", isPositive ? "text-green-400" : "text-red-400")}>
        {value > 0 ? '+' : ''}{value.toFixed(1)}
      </span>
    </div>
  );
};

const SectionDivider = (): React.ReactNode => (
  <div className="my-4 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
);

export function OddsDisplayCard({ gameOdds }: OddsDisplayCardProps): React.ReactNode {
  const {
    home_team, away_team, sportsbook_name, sportsbook_raw_data,
    ai_prediction_details, game_start_time_utc, live_data,
    home_team_logo_url, away_team_logo_url,
  } = gameOdds;

  const formatTime = (isoString?: string): string => { 
    if (!isoString) return 'Time TBD';
    try { return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }); }
    catch (e) { console.error("Error formatting time:", isoString, e); return 'Invalid Time'; }
  };

  const formatDate = (isoString?: string): string => { 
    if (!isoString) return '';
    try { return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' }); }
    catch (e) { console.error("Error formatting date:", isoString, e); return 'Invalid Date'; }
  };

  const getStatusDisplay = (): React.ReactNode => { 
    if (live_data?.status === 'Live') {
      return (
        <div className="flex items-center justify-center gap-1 text-red-400 animate-pulse font-semibold text-sm">
          <RadioTowerIcon className="w-4 h-4" /> LIVE
        </div>
      );
    }
    if (live_data?.status === 'Halftime') return <span className="text-yellow-400 font-semibold text-sm">HALFTIME</span>;
    if (live_data?.status === 'Final') return <span className="text-green-400 font-semibold text-sm">FINAL</span>;
    if (live_data?.status === 'Postponed') return <span className="text-yellow-500 font-semibold text-sm">POSTPONED</span>;
    if (live_data?.status === 'Delayed') return <span className="text-yellow-500 font-semibold text-sm">DELAYED</span>;
    
    const dateStr = formatDate(game_start_time_utc);
    const timeStr = formatTime(game_start_time_utc);

    if (game_start_time_utc && (dateStr === 'Invalid Date' || timeStr === 'Invalid Time')) {
        return <span className="text-gray-400 flex items-center text-xs"><InfoIcon className="w-3 h-3 mr-1" />Time Error</span>;
    }
    if (timeStr === 'Time TBD' && (live_data?.status === 'Scheduled' || live_data?.status === 'Upcoming')) {
        return <span className="text-gray-400 flex items-center text-xs"><InfoIcon className="w-3 h-3 mr-1" />Scheduled (Time TBD)</span>;
    }
    if (live_data?.status === 'Upcoming' || (game_start_time_utc && new Date(game_start_time_utc) > new Date())) {
         return <span className="text-blue-300 font-medium">{dateStr} - {timeStr}</span>;
    }
    if (live_data?.status === 'Scheduled' && dateStr && timeStr !== 'Time TBD') {
        return <span className="text-gray-400 font-medium">{dateStr} - {timeStr}</span>;
    }
    return <span className="text-gray-400 flex items-center text-xs"><InfoIcon className="w-3 h-3 mr-1" />Status N/A</span>;
  };

  const renderKellyText = (value?: number | "No Bet"): React.ReactNode => { 
    if (value === undefined || value === null || value === "No Bet" || (typeof value === 'number' && value <= 0)) {
      return <span className="text-gray-400 text-xs">No Bet</span>;
    }
    if (typeof value === 'number') {
      return <span className="text-purple-300 font-semibold">{value.toFixed(1)}%</span>;
    }
    return <span className="text-gray-400 text-xs">N/A</span>;
  };

  const awayTeamAbbr = away_team ? away_team.substring(0, 3).toUpperCase() : "AWAY";
  const homeTeamAbbr = home_team ? home_team.substring(0, 3).toUpperCase() : "HOME";

  const TeamLogo = ({ logoUrl, teamName, teamAbbr }: { logoUrl?: string, teamName: string, teamAbbr: string }): React.ReactNode => {
    if (logoUrl && logoUrl !== '/logos/placeholder_away.png' && logoUrl !== '/logos/placeholder_home.png') {
      return (
        <Image
          src={logoUrl}
          alt={`${teamName} logo`}
          width={32}
          height={32}
          className="object-contain group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
        />
      );
    }
    return (
      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-inner flex-shrink-0">
        {teamAbbr}
      </div>
    );
  };

  return (
    <div className={cn(
        "relative bg-gradient-to-br from-gray-800/80 via-gray-900/90 to-black/90 backdrop-blur-sm",
        "border border-orange-600/40 rounded-xl shadow-2xl overflow-hidden group", 
        "transition-all duration-300 ease-out hover:shadow-orange-500/30 hover:border-orange-500/70 hover:scale-[1.02]"
    )}>
      <GlowingEffect 
        disabled={false} 
        proximity={120} 
        spread={40} 
        blur={3} 
        glow={true} 
        movementDuration={0.8} 
        borderWidth={1.5} 
        className="rounded-xl opacity-0 group-hover:opacity-75 transition-opacity duration-300"
      />
      
      <div className="p-4 sm:p-5 border-b border-orange-600/30 bg-black/60 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink min-w-0 pr-1">
            <TeamLogo logoUrl={away_team_logo_url} teamName={away_team || 'Away Team'} teamAbbr={awayTeamAbbr} />
            <h4 className="text-lg sm:text-xl font-bold text-white group-hover:text-orange-300 transition-colors" title={away_team || 'Away Team'}>
              {away_team || 'Away Team'}
            </h4>
          </div>
          <span className="text-orange-400 mx-1 sm:mx-2 text-lg sm:text-xl font-semibold group-hover:animate-pulse flex-shrink-0">vs</span>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink min-w-0 pl-1 justify-end text-right">
            <h4 className="text-lg sm:text-xl font-bold text-white group-hover:text-orange-300 transition-colors" title={home_team || 'Home Team'}>
              {home_team || 'Home Team'}
            </h4>
            <TeamLogo logoUrl={home_team_logo_url} teamName={home_team || 'Home Team'} teamAbbr={homeTeamAbbr} />
          </div>
        </div>
        <div className="text-xs sm:text-sm font-medium text-center text-gray-300 mt-1">{getStatusDisplay()}</div>
      </div>

      {/* Live Score Section - ENSURED THIS DIV IS CORRECTLY CLOSED */}
      {(live_data?.status === 'Live' || live_data?.status === 'Halftime' || (live_data?.status === 'Final' && typeof live_data.home_score === 'number')) && (
        <div className={cn(
            "px-3.5 py-3 border-b border-orange-600/20 relative z-10 text-center", 
            live_data.status === 'Live' ? "bg-red-600/50 text-red-100" : 
            live_data.status === 'Halftime' ? "bg-yellow-500/40 text-yellow-100" : 
            "bg-black/40"
        )}>
          <div className="flex justify-around items-center">
            <div className="flex-1 text-center">
              <div className="text-sm text-gray-200 group-hover:text-orange-300 transition-colors">{awayTeamAbbr}</div>
              <div className="text-2xl font-black text-white">{live_data.away_score ?? '-'}</div>
            </div>
            <div className="flex-shrink-0 w-24">
                {live_data.status === 'Live' && live_data.current_period && (
                    <>
                        <div className="text-md font-bold animate-pulse">{live_data.current_period}</div>
                        <div className="text-xs text-gray-200">{live_data.time_remaining}</div>
                    </>
                )}
                {live_data.status === 'Halftime' && <div className="text-md font-bold">HALFTIME</div>}
                {live_data.status === 'Final' && <div className="text-md font-bold text-green-300">FINAL</div>}
            </div>
            <div className="flex-1 text-center">
              <div className="text-sm text-gray-200 group-hover:text-orange-300 transition-colors">{homeTeamAbbr}</div>
              <div className="text-2xl font-black text-white">{live_data.home_score ?? '-'}</div>
            </div>
          </div>
           {live_data.last_updated && live_data.status === 'Live' && (<p className="text-center text-[0.7rem] text-gray-400 mt-2">Updated: {new Date(live_data.last_updated).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>)}
        </div>
      )} {/* <<< THIS CLOSES THE LIVE SCORE CONDITIONAL BLOCK */}

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-5 relative z-10 text-sm">
        {/* Sportsbook Odds Section - ENSURED THIS DIV IS CORRECTLY CLOSED */}
        {sportsbook_raw_data && (
            <div className="bg-black/30 p-3 rounded-lg shadow-md border border-gray-700/50">
              <p className="text-xs text-orange-400 mb-2 uppercase tracking-wider font-bold flex items-center">
                <BarChartBigIcon className="w-4 h-4 mr-1.5 text-orange-500" /> {sportsbook_name || 'Sportsbook'} Odds
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center"><span className="text-gray-300 w-2/5">Moneyline {awayTeamAbbr}:</span><span className="font-mono text-lg text-orange-300 text-right w-3/5">{sportsbook_raw_data.money_line?.away > 0 ? '+' : ''}{sportsbook_raw_data.money_line?.away ?? 'N/A'}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-300 w-2/5">Moneyline {homeTeamAbbr}:</span><span className="font-mono text-lg text-orange-300 text-right w-3/5">{sportsbook_raw_data.money_line?.home > 0 ? '+' : ''}{sportsbook_raw_data.money_line?.home ?? 'N/A'}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-300 w-2/5">Total Line:</span><span className="font-mono text-lg text-orange-300 text-right w-3/5">{sportsbook_raw_data.total_points_line ?? 'N/A'}</span></div>
              </div>
            </div>
        )}

        <SectionDivider />

        {/* AI Prediction Section - ENSURED THIS DIV IS CORRECTLY CLOSED */}
        {ai_prediction_details && (
             <div className="bg-black/30 p-3 rounded-lg shadow-md border border-gray-700/50">
                <p className="text-xs text-cyan-400 mb-2 uppercase tracking-wider font-bold flex items-center"><ZapIcon className="w-4 h-4 mr-1.5 text-cyan-500" />AI Prediction <span className="text-gray-500 ml-1.5 text-[0.65rem]">({ai_prediction_details.model_used || 'N/A'})</span></p>
                <div className="text-center mb-3">
                    <p className="text-gray-300 text-xs mb-0.5">Predicted Winner</p>
                    <p className="text-xl font-bold text-cyan-300 group-hover:text-white transition-colors">{ai_prediction_details.predicted_winner || 'N/A'}</p>
                    {typeof ai_prediction_details.winner_confidence_percent === 'number' &&  <div className="w-4/5 mx-auto mt-1"><ConfidenceBar percentage={ai_prediction_details.winner_confidence_percent} /></div> }
                    <p className="text-xs text-cyan-400/80">{ai_prediction_details.winner_confidence_percent?.toFixed(1) ?? 'N/A'}% Confidence</p>
                </div>
                <div className="text-center mt-3 pt-3 border-t border-gray-700/30">
                    <p className="text-gray-300 text-xs mb-0.5">Total Points Pick (Line: {sportsbook_raw_data?.total_points_line || 'N/A'})</p>
                    <p className="text-xl font-bold text-teal-300 group-hover:text-white transition-colors">{ai_prediction_details.total_points_pick || 'N/A'}</p>
                    {typeof ai_prediction_details.total_points_confidence_percent === 'number' && <div className="w-4/5 mx-auto mt-1"><ConfidenceBar percentage={ai_prediction_details.total_points_confidence_percent} barColor="bg-teal-500" /></div> }
                    <p className="text-xs text-teal-400/80">{ai_prediction_details.total_points_confidence_percent?.toFixed(1) ?? 'N/A'}% Confidence</p>
                </div>
            </div>
        )}
        
        {/* Strategic Insights Section - ENSURED THIS DIV IS CORRECTLY CLOSED */}
        {(ai_prediction_details?.expected_value || ai_prediction_details?.kelly_criterion_stake_percent) && (
          <>
            <SectionDivider />
            <div className="bg-black/30 p-3 rounded-lg shadow-md border border-gray-700/50">
              <p className="text-xs text-purple-400 mb-2 uppercase tracking-wider font-bold flex items-center"><TrendingUp className="w-4 h-4 mr-1.5 text-purple-500" />Strategic Insights</p>
              <div className="space-y-2.5 text-xs">
                {ai_prediction_details?.expected_value && (
                  <div className="p-2.5 bg-gray-800/40 rounded-md shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300 font-medium">EV ({awayTeamAbbr})</span> {EVIndicator({ value: ai_prediction_details.expected_value.away_team })}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">EV ({homeTeamAbbr})</span> {EVIndicator({ value: ai_prediction_details.expected_value.home_team })}
                    </div>
                  </div>
                )}
                {ai_prediction_details?.kelly_criterion_stake_percent && (
                   <div className="p-2.5 bg-gray-800/40 rounded-md shadow-sm mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300 font-medium">Kelly ({awayTeamAbbr})</span> {renderKellyText(ai_prediction_details.kelly_criterion_stake_percent.away_team)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">Kelly ({homeTeamAbbr})</span> {renderKellyText(ai_prediction_details.kelly_criterion_stake_percent.home_team)}
                    </div>
                   </div>
                )}
              </div>
            </div> {/* <<< THIS CLOSES THE STRATEGIC INSIGHTS INNER DIV */}
          </>
        )}
      </div> {/* <<< THIS CLOSES THE MAIN CONTENT AREA DIV */}
    </div> // <<< THIS CLOSES THE MAIN CARD CONTAINER DIV
  );
}
