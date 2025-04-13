// src/app/(app)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getSubscriptionTier } from '@/lib/supabase/subscriptions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Add check for user authentication
  if (!user) {
    redirect('/login');
  }
  
  // Now TypeScript knows user.id is a string, not undefined
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  const subscriptionTier = await getSubscriptionTier();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.full_name || 'Friend'}!
        </h1>
        <p className="text-muted-foreground">
          This is your personal dashboard. Here&apos;overview of your account.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Subscription Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>
              Current subscription status and details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">Current Plan</div>
              <div className="text-2xl font-medium">
                {subscriptionTier === 'free' ? 'Free Plan' : 
                 subscriptionTier === 'pro' ? 'Pro Plan' : 'Business Plan'}
              </div>
            </div>
            
            {subscriptionTier === 'free' ? (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Upgrade to access premium features and unlock the full potential.
                </p>
                <Button asChild>
                  <Link href="/pricing">Upgrade Plan</Link>
                </Button>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Manage your subscription details and billing information.
                </p>
                <Button asChild variant="outline">
                  <Link href="/account">Manage Subscription</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Links Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used tools and pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" asChild className="justify-start">
                <Link href="/account">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Account Settings
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href="/premium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Premium Content
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        
        {/* Activity items would go here, for now showing a placeholder */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-muted-foreground">No recent activity to display</p>
              <p className="text-sm text-muted-foreground mt-1">Your activity will appear here as you use the application</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
