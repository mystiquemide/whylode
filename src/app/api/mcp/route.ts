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

// Stateless server with no server-to-client stream. Per the MCP streamable HTTP
// spec, answer GET with 405 so clients don't hold a stream open until timeout.
export async function GET(req: NextRequest) {
  if (!bearerOk(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return new NextResponse(null, { status: 405, headers: { Allow: 'POST, DELETE' } });
}

export async function DELETE(req: NextRequest) {
  if (!bearerOk(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return handleMcpRequest(req);
}
