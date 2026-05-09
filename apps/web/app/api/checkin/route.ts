import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkTardiness, startOfDay, endOfDay } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { id: userId } = requireAuth(request);

    const existing = await prisma.attendance.findFirst({
      where: {
        userId,
        checkOut: null,
        checkIn: { gte: startOfDay(), lte: endOfDay() },
      },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Ya tienes una entrada activa' },
        { status: 400 },
      );
    }

    const now = new Date();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { schedule: true },
    });

    let late = false;
    let lateMinutes = 0;

    if (user?.schedule) {
      const result = checkTardiness(now, user.schedule.checkInTime, user.schedule.toleranceMinutes);
      late = result.late;
      lateMinutes = result.lateMinutes;
    }

    const attendance = await prisma.attendance.create({
      data: { userId, checkIn: now, late, lateMinutes },
    });

    return NextResponse.json({ success: true, attendance, late, lateMinutes });
  } catch (error) {
    return handleAuthError(error);
  }
}
