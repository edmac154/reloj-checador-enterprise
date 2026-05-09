import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireRole, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireRole(request, ['ADMIN', 'RH']);
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true,
        department: true, position: true, employeeId: true,
        phone: true, active: true, scheduleId: true, schedule: true,
        createdAt: true,
        attendances: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, employee: user });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    requireRole(request, ['ADMIN', 'RH']);
    const { id } = await params;
    const body = await request.json();
    const { name, email, role, department, position, employeeId, phone, active, scheduleId, password } = body;

    const data: Record<string, unknown> = {
      name, email, role,
      department: department || null,
      position: position || null,
      employeeId: employeeId || null,
      phone: phone || null,
      active,
      scheduleId: scheduleId || null,
    };
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json({
      success: true,
      employee: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
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
    await prisma.user.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
