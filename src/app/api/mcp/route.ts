import { handleMcpRequest } from '@/lib/mcp/server';
import { NextRequest, NextResponse } from 'next/server';

function bearerOk(req: NextRequest): boolean {
  const token = process.env.WHYLODE_MCP_TOKEN;
  if (!token) return false; // No token configured → always deny
  const header = req.headers.get('authorization') ?? '';
  return header === `Bearer ${token}`;
}

export async function POST(req: NextRequest) {
  if (!bearerOk(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return handleMcpRequest(req);
}

export async function GET(req: NextRequest) {
  if (!bearerOk(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return handleMcpRequest(req);
}

export async function DELETE(req: NextRequest) {
  if (!bearerOk(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return handleMcpRequest(req);
}
