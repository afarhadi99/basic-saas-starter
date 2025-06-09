// src/app/(app)/account/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getUserSubscription } from '@/lib/supabase/subscriptions';
import { formatPrice } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Image from 'next/image'; // For Avatar
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UpdateProfileForm } from '@/components/account/update-profile-form';
import { SuccessToastWrapper } from '@/components/account/success-toast';
import { ManageSubscriptionButton } from '@/components/account/manage-subscription-button';
import { UserCircle, ShieldCheck, CreditCard, Edit3, Star, KeyRound, Mail } from 'lucide-react'; // Added icons
import { cn } from '@/lib/utils';

export default async function AccountPage() {
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
  
  const subscription = await getUserSubscription();

  // Define card classes for consistent styling
  const cardClasses = "bg-black/70 backdrop-blur-md border border-orange-500/30 shadow-xl hover:border-orange-500/60 transition-all duration-300";
  const cardHeaderClasses = "pb-4";
  const cardTitleClasses = "text-2xl font-bold text-orange-400 flex items-center gap-3"; // Added flex for icon
  const cardDescriptionClasses = "text-gray-400 ml-11"; // Indent description if title has icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <SuccessToastWrapper /> {/* Keep toast at the top level */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-3">
            Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Settings</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Manage your profile, security, and subscription details.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Profile and Security */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card - Enhanced */}
            <Card className={cardClasses}>
              <CardHeader className={cardHeaderClasses}>
                <CardTitle className={cardTitleClasses}>
                  <UserCircle className="w-7 h-7 text-orange-500" />
                  Profile Information
                </CardTitle>
                <CardDescription className={cardDescriptionClasses}>
                  Keep your personal details up to date.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  {profile?.avatar_url ? (
                    <Image 
                      src={profile.avatar_url} 
                      alt={profile.full_name || 'User Avatar'} 
                      width={100} 
                      height={100} 
                      className="rounded-full border-2 border-orange-500/50 object-cover shadow-lg" 
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center border-2 border-orange-500/50 shadow-lg">
                      <UserCircle className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-grow w-full">
                  <UpdateProfileForm profile={profile} />
                </div>
              </CardContent>
            </Card>
            
            {/* Account Security Card */}
            <Card className={cardClasses}>
              <CardHeader className={cardHeaderClasses}>
                <CardTitle className={cardTitleClasses}>
                  <KeyRound className="w-7 h-7 text-orange-500" />
                  Account Security
                </CardTitle>
                <CardDescription className={cardDescriptionClasses}>
                  Manage your login credentials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-black/30 rounded-lg border border-gray-700/50">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-100 flex items-center gap-2"><Mail className="w-5 h-5 text-gray-400"/>Email Address</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white w-full sm:w-auto" disabled>
                    Change Email
                  </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-black/30 rounded-lg border border-gray-700/50">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-100">Password</h3>
                    <p className="text-sm text-gray-400">Last updated: Not available</p> {/* Consider fetching this if possible */}
                  </div>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white w-full sm:w-auto" disabled>
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column: Subscription */}
          <div className="lg:col-span-1">
            <Card className={cardClasses}>
              <CardHeader className={cardHeaderClasses}>
                <CardTitle className={cardTitleClasses}>
                  <CreditCard className="w-7 h-7 text-orange-500" />
                  Subscription
                </CardTitle>
                <CardDescription className={cardDescriptionClasses}>
                  Manage your plan and billing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscription ? (
                  <>
                    <div>
                      <h3 className="font-semibold text-gray-300 mb-1">Current Plan</h3>
                      <p className="text-2xl font-bold text-white">{subscription.prices?.products?.name || 'Unknown Plan'}</p>
                      <p className="text-sm text-gray-400">
                        {subscription.prices?.unit_amount ? formatPrice(subscription.prices.unit_amount) : '$0.00'} 
                        / {subscription.prices?.interval || 'month'}
                      </p>
                    </div>
                    
                    <Separator className="bg-gray-700/50" />
                    
                    <div>
                      <h3 className="font-semibold text-gray-300 mb-1">Status</h3>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          subscription.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_theme(colors.green.500)]' : 
                          subscription.status === 'trialing' ? 'bg-blue-500 shadow-[0_0_8px_theme(colors.blue.500)]' : 
                          'bg-red-500 shadow-[0_0_8px_theme(colors.red.500)]'
                        }`}></div>
                        <p className="capitalize font-medium text-lg">{subscription.status}</p>
                      </div>
                    </div>
                    
                    <ManageSubscriptionButton />
                  </>
                ) : (
                  <div className="text-center py-4">
                    <h3 className="font-semibold text-xl text-white mb-2">Free Plan</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      You are currently on our free plan with limited features.
                    </p>
                    <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-md hover:shadow-lg transition-all py-3">
                      <Link href="/pricing">
                        <Star className="w-4 h-4 mr-2"/>
                        Upgrade Plan
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
