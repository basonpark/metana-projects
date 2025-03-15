import { NextResponse } from 'next/server';
import { getCurrentNetworkRPC } from '../../../lib/network';
import { weiToEther } from '../../../lib/utils';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }
    
    // make the request to the ethereum node
    const response = await fetch(getCurrentNetworkRPC(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: new Date().getTime(),
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json(
        { error: data.error.message },
        { status: 500 }
      );
    }
    
    // convert wei to ether for display
    const balance = weiToEther(data.result);
    
    return NextResponse.json({ balance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
} 