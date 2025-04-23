// src/components/dashboard/media-generation-form.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ImageIcon, VideoIcon, AlertCircle } from 'lucide-react';
import { generateMedia, checkMediaStatus } from '@/lib/actions/media.actions';
import { toast } from 'sonner';
import Image from 'next/image';
import { MediaType } from '@/lib/constants/media';

interface MediaGenerationFormProps {
  mediaType: MediaType;
  creditCost: number;
  userCredits: number;
  onComplete?: () => void;
}

export function MediaGenerationForm({ 
  mediaType, 
  creditCost, 
  userCredits,
  onComplete 
}: MediaGenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [statusInterval, setStatusInterval] = useState<NodeJS.Timeout | null>(null);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [statusInterval]);
  
  // Handle video errors
  const handleVideoError = () => {
    console.error('Video playback error');
    setVideoError(true);
  };
  
  // Handle video loaded successfully
  const handleVideoLoaded = () => {
    setVideoError(false);
    // Try to play video automatically
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Auto-play prevented:', err);
      });
    }
  };
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    if (userCredits < creditCost) {
      toast.error(`Not enough credits. You need ${creditCost} credits to generate this ${mediaType}.`);
      return;
    }
    
    setIsGenerating(true);
    setMediaUrl(null);
    setVideoError(false);
    
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('mediaType', mediaType);
      
      const result = await generateMedia(formData);
      
      if (!result.success) {
        toast.error(result.error || 'Failed to generate media');
        setIsGenerating(false);
        return;
      }
      
      // Set the media ID and run ID with null checks
      if (result.mediaId) setMediaId(result.mediaId);
      if (result.runId) setRunId(result.runId);
      
      // Only start the status check if we have both IDs
      if (result.mediaId && result.runId) {
        const checkStatus = setInterval(async () => {
          // Make sure we still have the IDs
          if (!result.mediaId || !result.runId) {
            clearInterval(checkStatus);
            return;
          }
          
          const statusResult = await checkMediaStatus(result.mediaId, result.runId);
          
          if (!statusResult.success) {
            clearInterval(checkStatus);
            toast.error(statusResult.error || 'Failed to check status');
            setIsGenerating(false);
            return;
          }
          
          if (statusResult.status === 'completed') {
            clearInterval(checkStatus);
            if (statusResult.mediaUrl) {
              setMediaUrl(statusResult.mediaUrl);
            }
            setIsGenerating(false);
            toast.success(`Your ${mediaType} has been generated!`);
            
            // Callback when complete
            if (onComplete) onComplete();
          } else if (statusResult.status === 'failed') {
            clearInterval(checkStatus);
            toast.error('Generation failed. Please try again.');
            setIsGenerating(false);
          }
        }, 3000);
        
        setStatusInterval(checkStatus);
      } else {
        // If we don't have both IDs, show an error
        toast.error('Missing information to check generation status');
        setIsGenerating(false);
      }
      
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred');
      setIsGenerating(false);
    }
  }
  
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor={`${mediaType}-prompt`} className="block text-sm font-medium mb-2">
              Enter your prompt
            </label>
            <Textarea
              id={`${mediaType}-prompt`}
              placeholder={`Describe the ${mediaType} you want to create...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              rows={6}
              className="resize-none"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isGenerating || !prompt.trim() || userCredits < creditCost}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                {mediaType === 'image' ? (
                  <ImageIcon className="mr-2 h-4 w-4" />
                ) : (
                  <VideoIcon className="mr-2 h-4 w-4" />
                )}
                Generate {mediaType} ({creditCost} credits)
              </>
            )}
          </Button>
        </form>
        
        <div className="text-sm text-muted-foreground">
          <p className="mb-1">
            <span className="font-medium">Cost:</span> {creditCost} credits per {mediaType}
          </p>
          <p>
            <span className="font-medium">Available:</span> {userCredits} credits
          </p>
        </div>
      </div>
      
      <div className="flex flex-col">
        <label className="block text-sm font-medium mb-2">
          Result preview
        </label>
        <div className="bg-secondary/20 rounded-md border h-[280px] flex items-center justify-center overflow-hidden">
          {isGenerating ? (
            <div className="text-center p-4">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Generating your {mediaType}...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a minute</p>
            </div>
          ) : mediaUrl ? (
            mediaType === 'image' ? (
              <div className="relative w-full h-full">
                <Image
                  src={mediaUrl}
                  alt={prompt}
                  fill
                  className="object-contain"
                  unoptimized={true}
                />
              </div>
            ) : videoError ? (
              <div className="text-center p-4">
                <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
                <p className="text-sm text-muted-foreground">
                  Unable to play this video format.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => window.open(mediaUrl, '_blank')}
                >
                  Download Video
                </Button>
              </div>
            ) : (
                <div className="relative w-full h-full">
                <Image
                  src={mediaUrl}
                  alt={prompt}
                  fill
                  className="object-contain"
                  unoptimized={true}
                />
              </div>
            )
          ) : (
            <div className="text-center p-4">
              <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-3">
                {mediaType === 'image' ? (
                  <ImageIcon className="h-6 w-6 text-primary" />
                ) : (
                  <VideoIcon className="h-6 w-6 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Your {mediaType} will appear here after generation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
