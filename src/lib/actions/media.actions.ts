// src/lib/actions/media.actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { useCredits } from '@/lib/credits';
import { revalidatePath } from 'next/cache';
import { triggerMediaGeneration, checkGenerationStatus, getUserMedia } from '@/lib/services/media.service';
import { MediaType, CREDIT_COSTS, GenerationResult } from '@/lib/constants/media';
import { GeneratedMedia } from '@/types/db_types';

export async function generateMedia(formData: FormData): Promise<GenerationResult> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user || userError) {
    return { success: false, error: 'Authentication error' };
  }
  
  const prompt = formData.get('prompt') as string;
  const mediaType = formData.get('mediaType') as MediaType;
  
  if (!prompt || !mediaType) {
    return { success: false, error: 'Missing required fields' };
  }
  
  const creditCost = CREDIT_COSTS[mediaType];
  
  try {
    // Attempt to use credits first
    const creditSuccess = await useCredits(
      user.id, 
      creditCost, 
      `Generated ${mediaType}: "${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}"`
    );
    
    if (!creditSuccess) {
      return { success: false, error: 'Not enough credits' };
    }
    
    // Now trigger the generation
    const result = await triggerMediaGeneration(user.id, prompt, mediaType);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    // Revalidate the dashboard page to show updated credit count
    revalidatePath('/dashboard');
    
    return {
      success: true,
      mediaId: result.mediaId,
      runId: result.runId,
      status: 'processing'
    };
  } catch (error: any) {
    console.error('Error generating media:', error);
    return { success: false, error: error.message };
  }
}

export async function checkMediaStatus(mediaId: string, runId: string): Promise<GenerationResult> {
  try {
    const result = await checkGenerationStatus(mediaId, runId);
    
    // If the status has changed, revalidate the page
    if (result.status === 'completed' || result.status === 'failed') {
      revalidatePath('/dashboard');
    }
    
    return result;
  } catch (error: any) {
    console.error('Error checking media status:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchUserMedia(): Promise<{
    success: boolean;
    media: GeneratedMedia[]; // Now always returns an array (not optional)
    error?: string;
  }> {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user || userError) {
      return { success: false, error: 'Authentication error', media: [] }; // Return empty array
    }
    
    try {
      const result = await getUserMedia(user.id, 50);
      
      // Ensure we always return a media array
      return {
        success: result.success,
        media: result.media || [], // Convert undefined to empty array
        error: result.error
      };
    } catch (error: any) {
      console.error('Error fetching user media:', error);
      return { 
        success: false, 
        error: error.message,
        media: [] // Return empty array in error case
      };
    }
  }