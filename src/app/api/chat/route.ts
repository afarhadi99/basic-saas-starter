// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/lib/gemini-service';
import { Content } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // `isInitialOddsQuery` and `rawInitialOddsData` will be new flags/data from client
    const { message, history, isInitialOddsQuery, rawInitialOddsData } = body; 

    if (!message) { // Message is always required now
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const typedHistory: Content[] = Array.isArray(history) ? history.map((item: any) => ({
        role: item.role === "user" || item.role === "model" ? item.role : "user",
        parts: Array.isArray(item.parts) ? item.parts.map((part: any) => ({ text: typeof part.text === 'string' ? part.text : '' })) : [{text: ''}]
    })) : [];

    let aiServiceResponse: { text: string; groundingSources?: any[]; structuredData?: any };

    if (isInitialOddsQuery && rawInitialOddsData) {
      // User's first relevant query, and we have pre-loaded odds data to use
      console.log("/api/chat: Formatting pre-loaded initial odds data based on user query:", message);
      aiServiceResponse = await geminiService.formatPreloadedOddsWithAI(rawInitialOddsData, message);
    } else {
      // Regular chat turn or a query where pre-loaded odds aren't applicable/available
      console.log("/api/chat: Processing user message:", message);
      const chatSession = geminiService.startChat(typedHistory);
      aiServiceResponse = await geminiService.sendMessage(chatSession, message as string);
    }
    
    // structuredData should already be parsed by geminiService methods
    const conversationalText = aiServiceResponse.text; 
    const structuredGameDataFromAI = aiServiceResponse.structuredData;

    console.log("/api/chat: Sending to client - Text:", conversationalText.substring(0,100)+"...");
    console.log("/api/chat: Sending to client - StructuredData:", JSON.stringify(structuredGameDataFromAI, null, 2));


    return NextResponse.json({ 
        response: conversationalText, 
        structuredGameData: structuredGameDataFromAI,
        groundingSources: aiServiceResponse.groundingSources 
    });

  } catch (error) {
    console.error('Error in /api/chat POST handler:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error in /api/chat' }, { status: 500 });
  }
}
