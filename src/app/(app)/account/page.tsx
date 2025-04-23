// src/app/(app)/account/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getUserSubscription } from '@/lib/supabase/subscriptions';
import { formatPrice } from '@/lib/utils';
import { redirect } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UpdateProfileForm } from '@/components/account/update-profile-form';
import { SuccessToastWrapper } from '@/components/account/success-toast';
import { ManageSubscriptionButton } from '@/components/account/manage-subscription-button';
import { getUserCredits } from '@/lib/credits';
import { CREDIT_PACKS } from '@/lib/config/pricing';
import { CreditPackCard } from '@/components/account/credit-pack-card';

export default async function AccountPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  const subscription = await getUserSubscription();
  
  // Get user credits
  const userCredits = await getUserCredits();
  
  // Get credit usage history
  const { data: creditUsage } = await supabase
    .from('credit_usage')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Client component to handle URL parameters and show toast */}
      <SuccessToastWrapper />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account details and subscription.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpdateProfileForm profile={profile} />
            </CardContent>
          </Card>
          
          {/* NEW: Credits Card */}
          <Card>
            <CardHeader>
              <CardTitle>Credits</CardTitle>
              <CardDescription>
                Manage your credits for using premium features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Total Credits</h3>
                  <p className="text-2xl font-bold">{userCredits.total.toLocaleString()}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Subscription Credits</h3>
                  <p className="text-lg">{userCredits.subscriptionCredits.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Refreshes monthly based on your plan</p>
                </div>
                <div>
                  <h3 className="font-medium">Purchased Credits</h3>
                  <p className="text-lg">{userCredits.purchasedCredits.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Never expires</p>
                </div>
              </div>
              
              {creditUsage && creditUsage.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2">Recent Usage</h3>
                    <div className="space-y-2">
                      {creditUsage.map((usage) => (
                        <div key={usage.id} className="flex justify-between items-center text-sm">
                          <span>{usage.description || 'Credit usage'}</span>
                          <span className="font-medium text-destructive">-{usage.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* NEW: Purchase Credits Card */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Credits</CardTitle>
              <CardDescription>
                Need more credits? Purchase additional credit packs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {CREDIT_PACKS.map((pack) => (
                  <CreditPackCard key={pack.id} creditPack={pack} />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Account Security Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Manage your password and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Email Address</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline" disabled>
                  Change Email
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">Last updated: Not available</p>
                </div>
                <Button variant="outline" disabled>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Subscription Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div>
                    <h3 className="font-medium">Current Plan</h3>
                    <p className="text-xl">{subscription.prices?.products?.name || 'Unknown Plan'}</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.prices?.unit_amount ? formatPrice(subscription.prices.unit_amount) : '$0.00'} 
                      / {subscription.prices?.interval || 'month'}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-3 h-3 rounded-full ${
                        subscription.status === 'active' ? 'bg-green-500' : 
                        subscription.status === 'trialing' ? 'bg-blue-500' : 'bg-red-500'
                      }`}></div>
                      <p className="capitalize">{subscription.status}</p>
                    </div>
                  </div>
                  
                  {/* Client component for handling subscription management */}
                  <ManageSubscriptionButton />
                </>
              ) : (
                <>
                  <div className="text-center py-4">
                    <h3 className="font-medium mb-2">Free Plan</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You are currently on our free plan with limited features.
                    </p>
                    <Button asChild className="w-full">
                      <Link href="/pricing">Upgrade Plan</Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
