// src/app/(app)/account/success-toast.tsx
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

export function SuccessToast() {
  const router = useRouter();
  
  useEffect(() => {
    // Show success toast
    toast.success(
      <div className="flex flex-col">
        <span className="font-medium">Payment successful!</span>
        <span className="text-sm">Your subscription is now active.</span>
      </div>,
      {
        duration: 5000,
      }
    );
    
    // Clean up URL parameters
    setTimeout(() => {
      router.replace('/account');
    }, 500);
  }, [router]);
  
  return null;
}

// This wrapper component handles all the URL parameter logic
export function SuccessToastWrapper() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  
  if (success) {
    return <SuccessToast />;
  }
  
  return null;
}
