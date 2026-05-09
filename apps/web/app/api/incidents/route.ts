import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const payload = requireAuth(request);
    const isAdmin = ['ADMIN', 'RH'].includes(payload.role);

    const where = isAdmin ? {} : { userId: payload.id };
    const incidents = await prisma.incident.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, incidents });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id: userId } = requireAuth(request);
    const { type, startDate, endDate, reason } = await request.json();

    const incident = await prisma.incident.create({
      data: {
        userId, type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || null,
      },
    });

    return NextResponse.json({ success: true, incident });
  } catch (error) {
    return handleAuthError(error);
  }
}
