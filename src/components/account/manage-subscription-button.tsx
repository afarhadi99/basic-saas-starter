// src/app/(app)/account/manage-subscription-button.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/create-customer-portal', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create customer portal session');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Something went wrong');
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleManageSubscription} 
      className="w-full"
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  );
}
