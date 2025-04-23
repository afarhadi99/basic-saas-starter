// src/components/account/credit-pack-card.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface CreditPackCardProps {
  creditPack: {
    id: string;
    name: string;
    description: string;
    amount: number;
    price: number;
    priceId: string;
  };
}

export function CreditPackCard({ creditPack }: CreditPackCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/purchase-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: creditPack.priceId }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Something went wrong');
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold">{creditPack.name}</h3>
            <p className="text-sm text-muted-foreground">{creditPack.description}</p>
          </div>
          
          <div className="text-2xl font-bold">{formatPrice(creditPack.price)}</div>
          
          <Button 
            onClick={handlePurchase}
            className="w-full" 
            disabled={isLoading || !creditPack.priceId}
          >
            {isLoading ? 'Processing...' : 'Purchase'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
