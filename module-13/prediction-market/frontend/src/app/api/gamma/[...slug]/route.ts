import { NextRequest, NextResponse } from 'next/server';

/**
 * Catch-all handler for Gamma API requests
 * Acts as a proxy to avoid CORS issues
 */
export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    // Extract the path segments after /api/gamma/
    const pathSegments = params.slug || [];
    const path = pathSegments.join('/');
    
    // Get the original query parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    // Construct the target Gamma API URL
    const targetUrl = `https://gamma-api.polymarket.com/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`[Gamma Proxy] Forwarding request to: ${targetUrl}`);
    
    // Make the request to the actual Gamma API
    const response = await fetch(targetUrl, {
      headers: {
        'Content-Type': 'application/json',
        // Add other headers if needed, like API keys, but be careful not to expose secrets
      },
      method: request.method, // Forward the method
      // body: request.body, // Forward body if needed for POST/PUT etc.
      // cache: 'no-store', // Consider cache strategy
    });
    
    // Check if the request to Gamma API was successful
    if (!response.ok) {
      console.error(`[Gamma Proxy] Error from Gamma API: ${response.status} ${response.statusText}`);
      // Return the error response from Gamma API to the client
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
    
    // Get the response data
    const data = await response.json();
    
    // Return the successful response from Gamma API
    return NextResponse.json(data);

  } catch (error) {
    console.error('[Gamma Proxy] Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error proxying to Gamma API' },
      { status: 500 }
    );
  }
}