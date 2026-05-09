import { NextRequest, NextResponse } from 'next/server';
import { requireRole, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ['ADMIN', 'RH', 'SUPERVISOR']);

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      where.checkIn = { gte: startOfDay(d), lte: endOfDay(d) };
    }
    if (userId) where.userId = userId;

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, department: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return NextResponse.json({ success: true, attendances, total, page, limit });
  } catch (error) {
    return handleAuthError(error);
  }
}
