import { NextRequest, NextResponse } from 'next/server';
import { requireRole, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ['ADMIN', 'RH']);

    const schedules = await prisma.schedule.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, schedules });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireRole(request, ['ADMIN', 'RH']);

    const { name, checkInTime, checkOutTime, toleranceMinutes } = await request.json();
    const schedule = await prisma.schedule.create({
      data: { name, checkInTime, checkOutTime, toleranceMinutes: toleranceMinutes || 15 },
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    return handleAuthError(error);
  }
}
