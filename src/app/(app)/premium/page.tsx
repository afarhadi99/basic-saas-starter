// src/app/(app)/premium/page.tsx
import { isUserSubscribed, getSubscriptionTier } from '@/lib/supabase/subscriptions';
import { PremiumContent, NotSubscribedView } from './components';

export default async function PremiumPage() {
  const subscribed = await isUserSubscribed();
  const tier = await getSubscriptionTier();
  
  if (!subscribed) {
    return <PremiumContent tier={tier} />;
  }
  
  return <PremiumContent tier={tier} />;
}
