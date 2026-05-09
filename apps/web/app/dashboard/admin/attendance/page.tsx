'use client';

import { useState, useEffect, useCallback } from 'react';

interface AttendanceRecord {
  id: string;
  checkIn: string;
  checkOut: string | null;
  workedHours: number | null;
  late: boolean;
  lateMinutes: number;
  overtime: number;
  status: string;
  user: { name: string; email: string; department: string | null };
}

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [total, setTotal] = useState(0);

  const loadAttendances = useCallback(async () => {
    const res = await fetch(`/api/attendance?date=${date}`);
    const data = await res.json();
    if (data.success) {
      setAttendances(data.attendances);
      setTotal(data.total);
    }
  }, [date]);

  useEffect(() => {
    loadAttendances();
  }, [loadAttendances]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Asistencia</h1>
        <a
          href={`/api/export/excel?from=${date}&to=${date}`}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          Exportar Excel
        </a>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <input
          type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <span className="text-sm text-gray-500">{total} registros</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Empleado</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Departamento</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Entrada</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Salida</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Horas</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Retardo</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Hrs Extra</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {attendances.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-medium">{a.user.name}</td>
                <td className="p-4 text-sm text-gray-500">{a.user.department || '-'}</td>
                <td className="p-4 text-sm">
                  {new Date(a.checkIn).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-4 text-sm">
                  {a.checkOut ? new Date(a.checkOut).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
                <td className="p-4 text-sm font-medium">{a.workedHours ?? '-'}</td>
                <td className="p-4">
                  {a.late
                    ? <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">{a.lateMinutes} min</span>
                    : <span className="text-sm text-gray-400">-</span>}
                </td>
                <td className="p-4 text-sm">{a.overtime > 0 ? `${a.overtime} hrs` : '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    a.status === 'ACTIVE' ? 'bg-green-100 text-green-800'
                    : a.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                    {a.status === 'ACTIVE' ? 'Activo' : a.status === 'COMPLETED' ? 'Completado' : a.status}
                  </span>
                </td>
              </tr>
            ))}
            {attendances.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">No hay registros para esta fecha</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
