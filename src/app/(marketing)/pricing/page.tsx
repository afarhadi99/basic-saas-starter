// src/app/(marketing)/pricing/page.tsx
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { PRICING_TIERS, getTierByPriceId } from '@/lib/config/pricing';
import { PricingClient } from '@/components/pricing/pricing-client';

export default async function PricingPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Variable for client-side component to access
  const initialBillingInterval = 'monthly';
  
  // If user is authenticated, fetch their subscription to highlight current plan
  let userSubscription = null;
  let userTierId = 'free';
  let userBillingInterval: 'monthly' | 'yearly' = initialBillingInterval;
  
  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*, prices(id, products(*))')
      .eq('user_id', user.id)
      .in('status', ['trialing', 'active'])
      .maybeSingle();
    
    if (subscription) {
      userSubscription = subscription;
      
      // Determine which tier the user is on based on price ID
      const priceId = subscription.prices?.id;
      const { tier, interval } = getTierByPriceId(priceId);
      
      if (tier) {
        userTierId = tier.id;
        
        // If we have the interval information, use it as the initial billing interval
        if (interval) {
          userBillingInterval = interval;
        }
      }
    }
  }
  
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black pt-20">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Floating Orbs Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-full opacity-30 blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-gradient-to-r from-green-400 via-cyan-500 to-blue-500 rounded-full opacity-25 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-40 right-40 w-60 h-60 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full opacity-30 blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
        </div>

        {/* Basketball Court Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg viewBox="0 0 1200 800" className="w-full h-full">
            <circle cx="600" cy="400" r="100" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="600" cy="400" r="20" fill="none" stroke="currentColor" strokeWidth="2"/>
            <line x1="0" y1="400" x2="1200" y2="400" stroke="currentColor" strokeWidth="2"/>
            <line x1="600" y1="0" x2="600" y2="800" stroke="currentColor" strokeWidth="2"/>
            <path d="M 200 100 Q 300 400 200 700" fill="none" stroke="currentColor" strokeWidth="2"/>
            <path d="M 1000 100 Q 900 400 1000 700" fill="none" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10 py-24">
          <div className="text-center max-w-7xl mx-auto mb-20">
            {/* AI Status Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">🏀 Choose Your Winning Strategy</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Invest in Your
              <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                WINNING FUTURE
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Access our <span className="text-cyan-400 font-bold">69% accurate moneyline predictions</span> and 
              <span className="text-blue-400 font-bold"> 55% under/over performance</span>. 
              Every plan includes Kelly Criterion optimization and neural network insights.
            </p>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-black text-green-400 mb-1">69.2%</div>
                  <div className="text-sm text-gray-400">Moneyline Accuracy</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-400 mb-1">55.7%</div>
                  <div className="text-sm text-gray-400">Under/Over Rate</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-black text-purple-400 mb-1">16</div>
                  <div className="text-sm text-gray-400">Seasons of Data</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-black text-orange-400 mb-1">AI</div>
                  <div className="text-sm text-gray-400">Neural Network</div>
                </div>
              </div>
            </div>
            
            {/* Client-side component for billing toggle and pricing cards */}
            <PricingClient 
              initialBillingInterval={userBillingInterval} 
              pricingTiers={PRICING_TIERS} 
              userTierId={userTierId}
              isAuthenticated={!!user}
            />
          </div>
        </div>
      </section>

      {/* Features Comparison Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">
              What&apos;s Included in
              <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                EVERY PLAN
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              All plans are built on our proven neural network with 16 seasons of NBA data
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Core AI Features */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-xl">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Neural Network AI</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span>16 seasons of training data</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span>50,000+ variables per game</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span>Real-time model updates</span>
                </li>
              </ul>
            </div>

            {/* Mathematical Approach */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-8 backdrop-blur-xl">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Mathematical Edge</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Expected value calculations</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <span>Kelly Criterion optimization</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <span>Risk management built-in</span>
                </li>
              </ul>
            </div>

            {/* Performance Tracking */}
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-3xl p-8 backdrop-blur-xl">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Proven Results</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  <span>69% moneyline accuracy</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span>55% under/over performance</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span>Transparent tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900/50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">
              Frequently Asked
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                QUESTIONS
              </span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">How accurate are the predictions?</h3>
              <p className="text-gray-300 leading-relaxed">
                Our neural network achieves 69.2% accuracy on moneylines and 55.7% on under/overs, 
                trained on 16 seasons of NBA data from 2007-08 to present.
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">What is the Kelly Criterion?</h3>
              <p className="text-gray-300 leading-relaxed">
                A mathematical formula that calculates the optimal bet size based on your edge and bankroll. 
                We recommend betting 50% of the Kelly suggestion for safer long-term growth.
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Can I cancel anytime?</h3>
              <p className="text-gray-300 leading-relaxed">
                Yes, absolutely. All plans can be canceled anytime with no penalties. 
                Your access continues until the end of your current billing period.
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Do you guarantee profits?</h3>
              <p className="text-gray-300 leading-relaxed">
                We provide mathematical edges, not guarantees. Our 69% accuracy and Kelly Criterion 
                approach gives you the best statistical advantage, but betting always involves risk.
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">How often do you update predictions?</h3>
              <p className="text-gray-300 leading-relaxed">
                Our AI processes new data continuously. Predictions are updated in real-time as 
                injury reports, lineup changes, and other factors become available.
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">What makes your AI different?</h3>
              <p className="text-gray-300 leading-relaxed">
                16 seasons of comprehensive training data, neural network architecture specifically 
                designed for NBA betting, and integration with Kelly Criterion for optimal bankroll management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-r from-orange-500 via-red-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/20" />
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl lg:text-7xl font-black text-white mb-8">
            Ready to Start
            <span className="block">WINNING?</span>
          </h2>
          <p className="text-2xl text-white/90 mb-12 max-w-4xl mx-auto">
            Join thousands using our 69% accurate AI predictions. 
            Get neural network insights, Kelly Criterion optimization, and mathematical betting edge.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 text-white/90 text-lg max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              <span>14-Day Free Trial</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              <span>No Setup Fees</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
