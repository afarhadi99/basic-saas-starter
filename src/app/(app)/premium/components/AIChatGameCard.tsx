// src/app/(app)/premium/components/AIChatGameCard.tsx
'use client';

import { GameOddsUIData } from './PremiumPageClient';
import { TrendingUp, ShieldCheck, ZapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIChatGameCardProps {
  gameData: GameOddsUIData;
}

const ChatConfidenceBar = ({ percentage, barColor = "bg-cyan-600", label }: { percentage: number, barColor?: string, label?: string }) => {
  const widthPercentage = Math.max(0, Math.min(100, percentage));
  return (
    <div className="my-1 flex items-center">
      {label && <span className="text-xs text-gray-300 mr-2 w-12 flex-shrink-0">{label}:</span>}
      <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden inline-flex flex-1 items-center">
        <div
          className={cn("h-2 rounded-full", barColor)}
          style={{ width: `${widthPercentage}%` }}
        ></div>
      </div>
      <span className="text-xs text-gray-300 ml-2 font-mono w-8 text-right">{percentage.toFixed(0)}%</span>
    </div>
  );
};

export function AIChatGameCard({ gameData }: AIChatGameCardProps) {
  const {
    gameTitle,
    away_team, // This might be undefined
    home_team, // This might be undefined
    sportsbook_name,
    sportsbook_raw_data,
    ai_prediction_details,
    keyBettingAdvice,
  } = gameData;

  // Defensive coding: Provide fallbacks if team names are missing
  const safeAwayTeam = away_team || "Away Team";
  const safeHomeTeam = home_team || "Home Team";

  const title = gameTitle || `${safeAwayTeam} @ ${safeHomeTeam}`;
  const awayTeamAbbr = safeAwayTeam.substring(0, 3).toUpperCase();
  const homeTeamAbbr = safeHomeTeam.substring(0, 3).toUpperCase();

  return (
    <div className="mt-2.5 border border-gray-600/70 rounded-lg p-3 bg-gray-700/40 shadow-md w-full max-w-md">
      <h5 className="font-bold text-sm text-orange-300 mb-1.5">🏀 {title}</h5>
      <p className="text-xs text-gray-400 mb-2">Odds from {sportsbook_name || "N/A"}</p>

      <div className="space-y-2 text-xs">
        {ai_prediction_details && ( // Check if ai_prediction_details exists
          <div className="border-t border-gray-600/50 pt-2">
            <p className="text-[0.7rem] text-gray-300 mb-1 uppercase font-semibold flex items-center">
              <ZapIcon className="w-3 h-3 mr-1.5 text-cyan-400" /> AI Prediction
              {ai_prediction_details.model_used && <span className="text-gray-500 ml-1 text-[0.6rem]">({ai_prediction_details.model_used})</span>}
            </p>
            {ai_prediction_details.predicted_winner && (
                <p className="text-gray-100">
                    Pick: <span className="font-semibold text-cyan-300">{ai_prediction_details.predicted_winner}</span>
                </p>
            )}
            {typeof ai_prediction_details.winner_confidence_percent === 'number' && (
                <ChatConfidenceBar percentage={ai_prediction_details.winner_confidence_percent} barColor="bg-cyan-500" />
            )}
            
            {sportsbook_raw_data && ai_prediction_details.total_points_pick && typeof ai_prediction_details.total_points_confidence_percent === 'number' && (
                <>
                <p className="text-gray-100 mt-1.5">
                    Total ({sportsbook_raw_data.total_points_line || 'N/A'}): <span className="font-semibold text-cyan-300">{ai_prediction_details.total_points_pick}</span>
                </p>
                <ChatConfidenceBar percentage={ai_prediction_details.total_points_confidence_percent} barColor="bg-teal-500" />
                </>
            )}
          </div>
        )}

        {(ai_prediction_details?.expected_value || ai_prediction_details?.kelly_criterion_stake_percent) && (
            <div className="border-t border-gray-600/50 pt-2">
            <p className="text-[0.7rem] text-gray-300 mb-1 uppercase font-semibold flex items-center">
                <TrendingUp className="w-3 h-3 mr-1.5 text-purple-400" /> Betting Insights
            </p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {ai_prediction_details?.expected_value && (
                <>
                    <p className="text-gray-300">EV {awayTeamAbbr}: <span className={cn(ai_prediction_details.expected_value.away_team > 0 ? "text-green-400" : "text-red-400", "font-semibold")}>{ai_prediction_details.expected_value.away_team > 0 ? '+' : ''}{ai_prediction_details.expected_value.away_team?.toFixed(2) ?? 'N/A'}</span></p>
                    <p className="text-gray-300">EV {homeTeamAbbr}: <span className={cn(ai_prediction_details.expected_value.home_team > 0 ? "text-green-400" : "text-red-400", "font-semibold")}>{ai_prediction_details.expected_value.home_team > 0 ? '+' : ''}{ai_prediction_details.expected_value.home_team?.toFixed(2) ?? 'N/A'}</span></p>
                </>
                )}
                {ai_prediction_details?.kelly_criterion_stake_percent && (
                <>
                    <p className="text-gray-300">Kelly {awayTeamAbbr}: <span className="text-purple-300 font-semibold">{typeof ai_prediction_details.kelly_criterion_stake_percent.away_team === 'number' ? `${ai_prediction_details.kelly_criterion_stake_percent.away_team.toFixed(1)}%` : ai_prediction_details.kelly_criterion_stake_percent.away_team}</span></p>
                    <p className="text-gray-300">Kelly {homeTeamAbbr}: <span className="text-purple-300 font-semibold">{typeof ai_prediction_details.kelly_criterion_stake_percent.home_team === 'number' ? `${ai_prediction_details.kelly_criterion_stake_percent.home_team.toFixed(1)}%` : ai_prediction_details.kelly_criterion_stake_percent.home_team}</span></p>
                </>
                )}
            </div>
            </div>
        )}
        {keyBettingAdvice && <p className="mt-2.5 text-xs text-yellow-300 italic border-t border-gray-600/50 pt-2">💡 {keyBettingAdvice}</p>}
      </div>
    </div>
  );
}
