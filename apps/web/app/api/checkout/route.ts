import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateWorkedHours, calculateOvertime } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { id: userId } = requireAuth(request);

    const attendance = await prisma.attendance.findFirst({
      where: { userId, checkOut: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: 'No hay entrada activa' },
        { status: 400 },
      );
    }

    const now = new Date();
    const workedHours = calculateWorkedHours(attendance.checkIn, now);
    const overtime = calculateOvertime(workedHours);

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: now, workedHours, overtime, status: 'COMPLETED' },
    });

    return NextResponse.json({ success: true, attendance: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}
