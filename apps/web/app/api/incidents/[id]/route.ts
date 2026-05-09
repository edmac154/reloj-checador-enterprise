import { NextRequest, NextResponse } from 'next/server';
import { requireRole, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const payload = requireRole(request, ['ADMIN', 'RH']);
    const { id } = await params;
    const { status } = await request.json();

    const incident = await prisma.incident.update({
      where: { id },
      data: { status, approvedBy: payload.id },
    });

    return NextResponse.json({ success: true, incident });
  } catch (error) {
    return handleAuthError(error);
  }
}
