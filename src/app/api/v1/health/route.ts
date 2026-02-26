import { NextResponse } from 'next/server';

// FEAT-0: Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok', name: 'beeSvat' });
}
