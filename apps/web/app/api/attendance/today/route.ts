import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { id: userId } = requireAuth(request);

    const attendances = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return NextResponse.json({ success: true, attendances });
  } catch (error) {
    return handleAuthError(error);
  }
}
