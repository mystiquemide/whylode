import { listPrograms } from '@/lib/store/programs';
import { NextResponse } from 'next/server';

export async function GET() {
  const programs = await listPrograms();
  return NextResponse.json(programs);
}
