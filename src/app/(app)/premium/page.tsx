// src/app/(app)/premium/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { isUserSubscribed, getSubscriptionTier } from '@/lib/supabase/subscriptions';
import { PremiumPageClient } from './components/PremiumPageClient';

// Determine the correct import path for NotSubscribedView based on your project structure
import { NotSubscribedView } from './components'; 
// Option 2: If NotSubscribedView is in a separate file src/app/(app)/premium/components/NotSubscribedView.tsx
// import { NotSubscribedView } from './components/NotSubscribedView';

export default async function PremiumPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // If user is not logged in, redirect to login page.
    // Pass redirectTo so they come back to /premium after logging in.
    redirect('/login?message=auth_required&redirectTo=/premium');
  }

  // --- Subscription Check Bypassed for Development ---
  // const subscribed = await isUserSubscribed(); 
  // if (!subscribed) {
  //   console.log("PremiumPage (page.tsx): User is not subscribed. Rendering NotSubscribedView. (NOTE: Check currently bypassed)");
  //   return <NotSubscribedView />;
  // }
  // --- End of Subscription Check Bypass ---
  
  const subscriptionTier = await getSubscriptionTier(); // Still useful to get the tier


  let initialOddsData = null;
  let initialOddsError = null;

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
        const errorMessage = "PremiumPage (page.tsx): NEXT_PUBLIC_SITE_URL is not defined. API calls for initial odds will fail.";
        console.error(errorMessage);
        initialOddsError = "Application URL is not configured, cannot fetch initial odds.";
    }

    if (!initialOddsError) { // Only proceed if siteUrl was found
        const initialOddsParams = new URLSearchParams({
          sportsbook: 'fanduel',      // Default sportsbook for initial load
          model: 'xgboost',          // Default model
          kelly_criterion: 'true',   // Default Kelly criterion setting
        });
        
        const oddsApiUrl = `${siteUrl}/api/get-nba-odds?${initialOddsParams.toString()}`;
        console.log(`PremiumPage (page.tsx): Fetching initial odds from: ${oddsApiUrl}`);

        const response = await fetch(oddsApiUrl, {
            cache: 'no-store', // Ensures fresh data is fetched on every page load for odds
        });

        if (!response.ok) {
          let errorResponseMessage = `Failed to fetch initial odds. Status: ${response.status} ${response.statusText} from ${oddsApiUrl}`;
          try {
            const errorBody = await response.json();
            errorResponseMessage = errorBody.error || errorBody.detail || errorResponseMessage;
            console.error(`PremiumPage (page.tsx): Error fetching initial odds. API Response:`, errorBody);
          } catch (parseError) {
            const errorText = await response.text().catch(() => "Could not read error response body.");
            console.error(`PremiumPage (page.tsx): Error fetching initial odds. Status: ${response.status}. Could not parse error JSON. Response text: ${errorText}`);
            errorResponseMessage = `Failed to fetch initial odds (Status: ${response.status}). Server response: ${errorText.substring(0,100)}`;
          }
          throw new Error(errorResponseMessage);
        }

        initialOddsData = await response.json();
        // =======================================================================
        // >> THE IMPORTANT CONSOLE.LOG LINE IS HERE <<
        // =======================================================================
        console.log("DEBUG PREMIUM_PAGE_TSX: Data from my backend API looks like this:", JSON.stringify(initialOddsData, null, 2));
        // =======================================================================
        
        console.log("PremiumPage (page.tsx): Successfully fetched initial odds data.");
    }

  } catch (error) {
    console.error("PremiumPage (page.tsx): Catch block - error during initial odds fetch process:", error);
    initialOddsError = error instanceof Error ? error.message : "Unknown error occurred while fetching initial odds.";
  }

  return (
    <PremiumPageClient
      userFullName={user.user_metadata?.full_name || user.email || 'Dev User'}
      subscriptionTier={subscriptionTier} // Pass the tier (even if 'free' or actual tier)
      initialOddsData={initialOddsData}
      initialOddsError={initialOddsError}
    />
  );
}
