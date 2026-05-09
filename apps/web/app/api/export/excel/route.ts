import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { requireRole, handleAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ['ADMIN', 'RH']);

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Record<string, unknown> = {};
    if (from || to) {
      const checkIn: Record<string, Date> = {};
      if (from) {
        const [y, m, d] = from.split('-').map(Number);
        checkIn.gte = new Date(y, m - 1, d, 0, 0, 0, 0);
      }
      if (to) {
        const [y, m, d] = to.split('-').map(Number);
        checkIn.lte = new Date(y, m - 1, d, 23, 59, 59, 999);
      }
      where.checkIn = checkIn;
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, department: true, employeeId: true } },
      },
      orderBy: { checkIn: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Asistencia');

    sheet.columns = [
      { header: 'Empleado', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Departamento', key: 'department', width: 20 },
      { header: 'No. Empleado', key: 'employeeId', width: 15 },
      { header: 'Entrada', key: 'checkIn', width: 22 },
      { header: 'Salida', key: 'checkOut', width: 22 },
      { header: 'Horas', key: 'workedHours', width: 10 },
      { header: 'Retardo', key: 'late', width: 10 },
      { header: 'Min. Retardo', key: 'lateMinutes', width: 14 },
      { header: 'Hrs. Extra', key: 'overtime', width: 12 },
      { header: 'Estado', key: 'status', width: 15 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' },
    };

    for (const a of attendances) {
      sheet.addRow({
        name: a.user.name,
        email: a.user.email,
        department: a.user.department || '-',
        employeeId: a.user.employeeId || '-',
        checkIn: a.checkIn.toLocaleString('es-MX'),
        checkOut: a.checkOut?.toLocaleString('es-MX') || 'Activo',
        workedHours: a.workedHours ?? '-',
        late: a.late ? 'Sí' : 'No',
        lateMinutes: a.lateMinutes,
        overtime: a.overtime,
        status: a.status === 'COMPLETED' ? 'Completado' : a.status === 'ACTIVE' ? 'Activo' : a.status,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `asistencia_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
