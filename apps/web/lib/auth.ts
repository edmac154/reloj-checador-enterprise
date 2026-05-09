import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export class AuthError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get('token')?.value ?? null;
}

export function requireAuth(request: NextRequest): TokenPayload {
  const token = getTokenFromRequest(request);
  if (!token) throw new AuthError('No autenticado', 401);
  try {
    return verifyToken(token);
  } catch {
    throw new AuthError('Token inválido', 401);
  }
}

export function requireRole(request: NextRequest, roles: string[]): TokenPayload {
  const payload = requireAuth(request);
  if (!roles.includes(payload.role)) throw new AuthError('Sin permisos', 403);
  return payload;
}

export async function getCurrentUser(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  try {
    const { id } = verifyToken(token);
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true,
        department: true, position: true, active: true,
        scheduleId: true, schedule: true,
      },
    });
  } catch {
    return null;
  }
}

export function createTokenCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return response;
}

export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
}
