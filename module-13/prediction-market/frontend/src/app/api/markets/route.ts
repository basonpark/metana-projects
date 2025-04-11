import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch data from the Gamma API
    const response = await fetch('https://gamma-api.polymarket.com/events/active', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the response with proper CORS headers
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Gamma API:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}