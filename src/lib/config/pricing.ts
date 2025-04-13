// src/lib/config/pricing.ts
export interface PricingTier {
    id: 'free' | 'pro' | 'business';
    name: string;
    description: string;
    features: string[];
    popular: boolean;
    // Each tier can have monthly and yearly pricing options
    pricing: {
      monthly: {
        priceId: string | null; // Stripe Price ID
        amount: number | null;  // Amount in cents
      };
      yearly: {
        priceId: string | null; // Stripe Price ID
        amount: number | null;  // Amount in cents
        discount?: number;      // Optional percentage discount compared to monthly
      };
    };
  }
  
  // These price IDs need to be replaced with your actual Stripe price IDs
  export const STRIPE_PRICE_IDS = {
    PRO_MONTHLY: 'price_1RDIOPJv3sw11XhoMRXMMs3H', // Replace with actual Pro monthly price ID
    PRO_YEARLY: 'price_1RDIOdJv3sw11Xhoiyx0bIfC',  // Replace with actual Pro yearly price ID
    BUSINESS_MONTHLY: 'price_1RDIPhJv3sw11XholOyQsvP5', // Replace with actual Business monthly price ID
    BUSINESS_YEARLY: 'price_1RDIQ4Jv3sw11XhoTdNTK0NY', // Replace with actual Business yearly price ID
  };
  
  export const PRICING_TIERS: PricingTier[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Essential features for individuals',
      features: [
        'Basic dashboard access',
        'Limited access to features',
        'Community support',
      ],
      popular: false,
      pricing: {
        monthly: {
          priceId: null,
          amount: null,
        },
        yearly: {
          priceId: null,
          amount: null,
        },
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Perfect for professionals',
      features: [
        'Everything in Free',
        'Advanced features',
        'Priority support',
        'Extended usage limits',
      ],
      popular: true,
      pricing: {
        monthly: {
          priceId: STRIPE_PRICE_IDS.PRO_MONTHLY,
          amount: 2900, // $29/month
        },
        yearly: {
          priceId: STRIPE_PRICE_IDS.PRO_YEARLY,
          amount: 29000, // $290/year
          discount: 16,  // 16% discount compared to monthly
        },
      },
    },
    {
      id: 'business',
      name: 'Business',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Enterprise features',
        'Dedicated support',
        'Custom integrations',
        'Team management',
      ],
      popular: false,
      pricing: {
        monthly: {
          priceId: STRIPE_PRICE_IDS.BUSINESS_MONTHLY,
          amount: 5900, // $59/month
        },
        yearly: {
          priceId: STRIPE_PRICE_IDS.BUSINESS_YEARLY,
          amount: 59000, // $590/year
          discount: 16,  // 16% discount compared to monthly
        },
      },
    },
  ];
  
  // Helper function to get a tier by ID
  export function getTierById(id: string): PricingTier | undefined {
    return PRICING_TIERS.find(tier => tier.id === id);
  }
  
  // Build a mapping of price IDs to tier information for easy lookup
  export type PriceIdInfo = {
    tierId: 'free' | 'pro' | 'business';
    interval: 'monthly' | 'yearly';
  };
  
  // Create a map of price IDs to tier info
  export const PRICE_ID_MAP: Record<string, PriceIdInfo> = {};
  
  // Populate the price ID map
  PRICING_TIERS.forEach(tier => {
    // Add monthly price ID if exists
    if (tier.pricing.monthly.priceId) {
      PRICE_ID_MAP[tier.pricing.monthly.priceId] = {
        tierId: tier.id as 'free' | 'pro' | 'business',
        interval: 'monthly'
      };
    }
    
    // Add yearly price ID if exists
    if (tier.pricing.yearly.priceId) {
      PRICE_ID_MAP[tier.pricing.yearly.priceId] = {
        tierId: tier.id as 'free' | 'pro' | 'business',
        interval: 'yearly'
      };
    }
  });
  
  // Helper function to get tier info from a price ID
  export function getTierByPriceId(priceId: string | null | undefined): { 
    tier: PricingTier | undefined, 
    interval: 'monthly' | 'yearly' | undefined 
  } {
    if (!priceId) {
      // Default to free tier with no interval
      const freeTier = getTierById('free');
      return { tier: freeTier, interval: undefined };
    }
    
    const priceInfo = PRICE_ID_MAP[priceId];
    
    if (!priceInfo) {
      // Price ID not found in our configuration
      return { tier: undefined, interval: undefined };
    }
    
    const tier = getTierById(priceInfo.tierId);
    
    return { 
      tier,
      interval: priceInfo.interval
    };
  }
  