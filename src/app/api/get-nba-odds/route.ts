// src/app/api/get-nba-odds/route.ts
import { NextRequest, NextResponse } from 'next/server';

// URL of your FastAPI backend
const FASTAPI_BACKEND_URL = 'http://localhost:8000/predictions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Extract parameters from the incoming Next.js API request
  const sportsbook = searchParams.get('sportsbook') || 'fanduel'; // Default to fanduel
  const model = searchParams.get('model') || 'xgboost'; // Default to xgboost
  const kelly_criterion = searchParams.get('kelly_criterion') || 'true'; // Default to true

  // Construct the URL for the FastAPI backend
  const fastapiURL = new URL(FASTAPI_BACKEND_URL);
  fastapiURL.searchParams.append('sportsbook', sportsbook);
  fastapiURL.searchParams.append('model', model);
  fastapiURL.searchParams.append('kelly_criterion', kelly_criterion);

  console.log(`Forwarding request to FastAPI: ${fastapiURL.toString()}`);

  try {
    const response = await fetch(fastapiURL.toString(), {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        // Add any other headers your FastAPI backend might require
      },
      // If you need to handle caching strategies for the FastAPI response:
      // cache: 'no-store', // Or 'force-cache', 'default', etc.
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `FastAPI backend error: ${response.status} ${response.statusText}`,
        errorBody
      );
      return NextResponse.json(
        { error: `Failed to fetch odds from backend: ${response.statusText}`, details: errorBody },
        { status: response.status }
      );
    }

    const data = await response.json();
    // console.log("Received data from FastAPI:", data);

    // Forward the response from the FastAPI backend to the client
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error connecting to FastAPI backend:', error);
    return NextResponse.json(
      { error: 'Internal server error: Could not connect to odds service.' },
      { status: 500 }
    );
  }
}
