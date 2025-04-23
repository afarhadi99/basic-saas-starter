// src/app/(app)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getUserCredits } from '@/lib/credits';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaGenerationForm } from '@/components/dashboard/media-generation-form';
import { MediaLibrary } from '@/components/dashboard/media-library';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  
  // Get user's total credits
  const { total: totalCredits } = await getUserCredits();
  
  // Define credit costs
  const CREDIT_COSTS = {
    image: 10,
    video: 100
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.full_name || 'Friend'}!
        </h1>
        <p className="text-muted-foreground">
          Generate AI images and videos using your credits
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Media Generator</CardTitle>
          <CardDescription>
            Create images and videos from text prompts using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="image">Image Generation</TabsTrigger>
              <TabsTrigger value="video">Video Generation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="image" className="mt-0">
              <MediaGenerationForm 
                mediaType="image" 
                creditCost={CREDIT_COSTS.image} 
                userCredits={totalCredits} 
              />
            </TabsContent>
            
            <TabsContent value="video" className="mt-0">
              <MediaGenerationForm 
                mediaType="video" 
                creditCost={CREDIT_COSTS.video} 
                userCredits={totalCredits} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <MediaLibrary />
    </div>
  );
}
