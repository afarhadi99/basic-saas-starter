// src/components/dashboard/media-library.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchUserMedia } from '@/lib/actions/media.actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, VideoIcon, Loader2, Calendar, Download, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { GeneratedMedia } from '@/types/db_types';
import { MediaType } from '@/lib/constants/media';
import { Button } from '@/components/ui/button';

interface MediaLibraryProps {
  refreshTrigger?: number;
}

export function MediaLibrary({ refreshTrigger = 0 }: MediaLibraryProps) {
  const [media, setMedia] = useState<GeneratedMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | MediaType>('all');
  
  // Load media when component mounts or refreshTrigger changes
  useEffect(() => {
    async function loadMedia() {
      setLoading(true);
      
      try {
        const result = await fetchUserMedia();
        
        if (!result.success) {
          toast.error(result.error || 'Failed to load media');
          setLoading(false);
          return;
        }
        
        // Use optional chaining and default to empty array if media is undefined
        const successResult = result as { success: true; media: GeneratedMedia[]; error?: string };
        setMedia(successResult.media);
      } catch (error) {
        console.error('Error loading media:', error);
        toast.error('Failed to load media library');
      } finally {
        setLoading(false);
      }
    }
    
    loadMedia();
  }, [refreshTrigger]);
  
  // Filter media based on active tab
  const filteredMedia = activeTab === 'all' 
    ? media 
    : media.filter(item => item.media_type === activeTab);
  
  return (
    <div className="mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Media Library</h2>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'all' | MediaType)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              {activeTab === 'image' ? (
                <ImageIcon className="h-8 w-8 text-primary" />
              ) : activeTab === 'video' ? (
                <VideoIcon className="h-8 w-8 text-primary" />
              ) : (
                <div className="flex gap-2">
                  <ImageIcon className="h-8 w-8 text-primary" />
                  <VideoIcon className="h-8 w-8 text-primary" />
                </div>
              )}
            </div>
            <h3 className="text-xl font-medium mb-2">No media found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Start creating {activeTab === 'all' ? 'images and videos' : activeTab + 's'} using the generation tools above.
              Your creations will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map(item => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

interface MediaCardProps {
  item: GeneratedMedia;
}

function MediaCard({ item }: MediaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const formattedDate = new Date(item.created_at).toLocaleDateString();
  
  // Function to download media
  const downloadMedia = async () => {
    try {
      const response = await fetch(item.media_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Set file name with appropriate extension
      const extension = item.media_type === 'image' ? '.png' : '.webp';
      a.download = `${item.media_type}-${Date.now()}${extension}`;
      
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${item.media_type} downloaded successfully`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file');
    }
  };
  
  // Function to copy prompt to clipboard
  const copyPrompt = () => {
    navigator.clipboard.writeText(item.prompt)
      .then(() => {
        setIsCopied(true);
        toast.success('Prompt copied to clipboard');
        
        // Reset copy state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch((error) => {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy prompt');
      });
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="relative aspect-square overflow-hidden bg-secondary/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Media display - both image and video are displayed as images based on current implementation */}
        <Image
          src={item.media_url}
          alt={item.prompt || 'Generated media'}
          fill
          className="object-cover"
          unoptimized={true}
        />
        
        {/* Media type badge */}
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium flex items-center gap-1">
          {item.media_type === 'image' ? (
            <>
              <ImageIcon className="h-3 w-3" />
              <span>Image</span>
            </>
          ) : (
            <>
              <VideoIcon className="h-3 w-3" />
              <span>Video</span>
            </>
          )}
        </div>
      </div>
      
      <CardContent className="p-3">
        {/* Prompt text with date */}
        <p className="text-xs text-muted-foreground line-clamp-2" title={item.prompt}>
          {item.prompt}
        </p>
        <div className="flex items-center justify-between mt-2">
          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
          
          {/* Action buttons - moved here from the media preview */}
          <div className="flex gap-2">
            {/* Download button */}
            <Button 
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={downloadMedia}
              title="Download media"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            {/* Copy prompt button */}
            <Button 
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={copyPrompt}
              title="Copy prompt"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
