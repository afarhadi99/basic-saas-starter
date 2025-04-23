// src/components/dashboard/media-library.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchUserMedia } from '@/lib/actions/media.actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ImageIcon, VideoIcon, Loader2, Calendar } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { GeneratedMedia } from '@/types/db_types';
import { MediaType } from '@/lib/constants/media';

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
  const formattedDate = new Date(item.created_at).toLocaleDateString();
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div 
        className="relative aspect-square overflow-hidden bg-secondary/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {item.media_type === 'image' ? (
          <Image
            src={item.media_url}
            alt={item.prompt || 'Generated image'}
            fill
            className="object-cover"
          />
        ) : (
            <Image
            src={item.media_url}
            alt={item.prompt || 'Generated image'}
            fill
            className="object-cover"
          />
        )}
        
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
        <p className="text-xs text-muted-foreground line-clamp-2" title={item.prompt}>
          {item.prompt}
        </p>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
      </CardContent>
    </Card>
  );
}
