// src/app/(app)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getSubscriptionTier } from '@/lib/supabase/subscriptions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { UserCircle, Edit3, BarChart3, Activity, CreditCard, ShieldCheck, Star } from 'lucide-react'; // Added more icons
import { cn } from '@/lib/utils'; // For conditional classes

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  const subscriptionTier = await getSubscriptionTier();
  
  // Define card classes for consistent styling
  const cardClasses = "bg-black/70 backdrop-blur-md border border-orange-500/30 shadow-xl hover:border-orange-500/60 transition-all duration-300";
  const cardHeaderClasses = "pb-4"; // Adjusted padding
  const cardTitleClasses = "text-2xl font-bold text-orange-400";
  const cardDescriptionClasses = "text-gray-400";

  return (
    // Main container with themed background
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-3">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">{profile?.full_name || 'Buddy'}</span>!
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Here's your command center for all things Betting Buddy.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Subscription Card */}
          <Card className={cn(cardClasses, "lg:col-span-1")}>
            <CardHeader className={cardHeaderClasses}>
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-8 h-8 text-orange-500" />
                <CardTitle className={cardTitleClasses}>Your Subscription</CardTitle>
              </div>
              <CardDescription className={cardDescriptionClasses}>
                Current plan and billing details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="text-sm text-gray-400 mb-1">Current Plan</div>
                <div className="text-3xl font-bold text-white flex items-center">
                  {subscriptionTier === 'free' ? 'Free Plan' : 
                   subscriptionTier === 'pro' ? 'Pro Plan' : 
                   subscriptionTier === 'business' ? 'Business Plan' : 'Legend Plan' // Assuming 'legend' is a possible tier
                  }
                  {subscriptionTier !== 'free' && <ShieldCheck className="w-6 h-6 text-green-500 ml-2" />}
                </div>
              </div>
              
              {subscriptionTier === 'free' ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    Upgrade to unlock premium AI insights, full game analysis, and advanced betting tools.
                  </p>
                  <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all py-3">
                    <Link href="/pricing">
                      <Star className="w-4 h-4 mr-2"/>
                      Upgrade to Premium
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">
                    You have access to all features of the {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Plan.
                  </p>
                  <Button asChild variant="outline" className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 font-semibold py-3">
                    <Link href="/account">
                      <Edit3 className="w-4 h-4 mr-2"/>
                      Manage Subscription
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Quick Links Card - now more prominent */}
          <Card className={cn(cardClasses, "lg:col-span-2")}>
            <CardHeader className={cardHeaderClasses}>
              <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                  <CardTitle className={cardTitleClasses}>Quick Actions</CardTitle>
              </div>
              <CardDescription className={cardDescriptionClasses}>
                Jump right into your most used features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <Button variant="outline" asChild className="justify-start p-6 border-orange-500/40 text-gray-200 hover:bg-orange-500/10 hover:text-orange-300 hover:border-orange-500/70 transition-all group">
                  <Link href="/account" className="flex items-center text-lg">
                    <UserCircle className="h-6 w-6 mr-3 text-orange-500 group-hover:text-orange-400 transition-colors" />
                    Account Settings
                  </Link>
                </Button>
                <Button variant="outline" asChild className="justify-start p-6 border-orange-500/40 text-gray-200 hover:bg-orange-500/10 hover:text-orange-300 hover:border-orange-500/70 transition-all group">
                  <Link href="/premium" className="flex items-center text-lg">
                    <Star className="h-6 w-6 mr-3 text-orange-500 group-hover:text-orange-400 transition-colors" />
                    Premium AI Chat
                  </Link>
                </Button>
                {/* Add more quick links as needed */}
                 <Button variant="outline" asChild className="justify-start p-6 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-gray-500 transition-all group sm:col-span-2">
                  <Link href="/#features" className="flex items-center text-lg"> {/* Example link */}
                    <Activity className="h-6 w-6 mr-3 text-blue-500 group-hover:text-blue-400 transition-colors" />
                    Explore All Features
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Activity Section */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-bold text-orange-400">Recent Activity</h2>
          </div>
          <Card className={cardClasses}>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-xl text-gray-500">No recent activity to display.</p>
                <p className="text-md text-gray-600 mt-2">Your interactions and key betting activities will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
