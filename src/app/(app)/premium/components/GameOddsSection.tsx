// src/app/(app)/premium/components/GameOddsSection.tsx
'use client';

import { AlertTriangle, BarChartBigIcon, InfoIcon, Loader2 } from 'lucide-react';
import { GameOddsUIData } from './PremiumPageClient'; 
import { OddsDisplayCard } from './OddsDisplayCard';
import { cn } from '@/lib/utils'; // Assuming you have cn utility

interface GameOddsSectionProps {
  odds: GameOddsUIData[];
  initialError: string | null;
  isLoading?: boolean;
}

export function GameOddsSection({ odds, initialError, isLoading }: GameOddsSectionProps) {
  const hasOdds = odds && odds.length > 0;

  return (
    // Main container for the section.
    // It's a flex column. Crucially, its height will be determined by its parent in PremiumPageClient.
    // We add overflow-hidden here to ensure that the sticky header/footer within this container
    // behave correctly with respect to the scrollable middle part.
    <div className={cn(
        "hidden md:flex md:flex-col",
        "w-80 lg:w-96 max-w-sm", // Width constraints
        "bg-black/70 backdrop-blur-lg border-l border-gray-700/50", // Background and border
        "h-full" // Make it try to take full height of its parent flex item in PremiumPageClient
    )}>
      
      {/* Header: It will not scroll. */}
      <div className="p-5 border-b border-gray-700/60 bg-black/50 backdrop-blur-sm shadow-lg z-10 flex-shrink-0">
        <h3 className="text-xl font-bold text-orange-400 flex items-center">
          <BarChartBigIcon className="w-5 h-5 mr-2 text-orange-500" />
          Today's Games
        </h3>
        <p className="text-xs text-gray-400">Odds & AI Insights</p>
      </div>

      {/* Scrollable Content Area: This div will scroll if content overflows. */}
      {/* `flex-grow` allows it to take up available space. `overflow-y-auto` enables scrolling. */}
      {/* `min-h-0` is important in flex children to allow them to shrink properly and scroll. */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800/70 scrollbar-thumb-rounded-full min-h-0">
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-full text-center p-4"> 
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-300 text-sm">Loading Latest Odds...</p>
          </div>
        )}

        {!isLoading && initialError && (
          <div className="p-4 bg-red-900/50 border border-red-700/70 rounded-lg text-red-200 text-sm flex flex-col items-center text-center gap-2">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <div>
                <p className="font-semibold text-md">Error Loading Odds</p>
                <p className="text-xs mt-1">{initialError}</p>
            </div>
          </div>
        )}

        {!isLoading && !initialError && !hasOdds && (
          <div className="p-4 bg-gray-800/60 border border-gray-700/50 rounded-lg text-gray-400 text-sm flex flex-col items-center text-center gap-2">
             <InfoIcon className="h-8 w-8 text-blue-400"/>
            <p className="text-md font-medium">No Games Available</p>
            <p className="text-xs">Check back later or ask the AI for updates!</p>
          </div>
        )}

        {!isLoading && !initialError && hasOdds &&
          odds.map((gameOdds) => (
            <OddsDisplayCard key={gameOdds.game_identifier} gameOdds={gameOdds} />
          ))
        }
      </div>
      
      {/* Footer: It will not scroll. */}
      <div className="p-3 border-t border-gray-700/60 bg-black/50 text-center backdrop-blur-sm shadow-top-lg z-10 flex-shrink-0">
        <p className="text-xs text-gray-500">Odds are for informational purposes. Gamble responsibly.</p>
      </div>
    </div>
  );
}
