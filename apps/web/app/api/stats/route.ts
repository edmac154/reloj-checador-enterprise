import { NextRequest, NextResponse } from 'next/server';
import { requireRole, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ['ADMIN', 'RH', 'SUPERVISOR']);

    const today = new Date();

    const [totalEmployees, activeToday, lateToday, pendingIncidents] = await Promise.all([
      prisma.user.count({ where: { active: true } }),
      prisma.attendance.count({
        where: { checkIn: { gte: startOfDay(today), lte: endOfDay(today) } },
      }),
      prisma.attendance.count({
        where: { late: true, checkIn: { gte: startOfDay(today), lte: endOfDay(today) } },
      }),
      prisma.incident.count({ where: { status: 'PENDING' } }),
    ]);

    return NextResponse.json({
      success: true,
      stats: { totalEmployees, activeToday, lateToday, pendingIncidents },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
