import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireRole, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ['ADMIN', 'RH']);

    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        department: true, position: true, employeeId: true,
        phone: true, active: true, scheduleId: true,
        schedule: true, createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, employees: users });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    requireRole(request, ['ADMIN', 'RH']);

    const body = await request.json();
    const { name, email, password, role, department, position, employeeId, phone, scheduleId } = body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'El email ya existe' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name, email, password: hashedPassword,
        role: role || 'EMPLOYEE',
        department: department || null,
        position: position || null,
        employeeId: employeeId || null,
        phone: phone || null,
        scheduleId: scheduleId || null,
      },
    });

    return NextResponse.json({
      success: true,
      employee: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
