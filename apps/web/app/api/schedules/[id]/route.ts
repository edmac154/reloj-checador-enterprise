import { NextRequest, NextResponse } from 'next/server';
import { requireRole, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireRole(request, ['ADMIN', 'RH']);
    const { id } = await params;
    const body = await request.json();
    const schedule = await prisma.schedule.update({ where: { id }, data: body });
    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireRole(request, ['ADMIN']);
    const { id } = await params;
    await prisma.schedule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
