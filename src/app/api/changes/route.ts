import { listChanges } from '@/lib/store/changes';
import { NextResponse } from 'next/server';

export async function GET() {
  const changes = await listChanges();
  return NextResponse.json(changes);
}
