'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalEmployees: number;
  activeToday: number;
  lateToday: number;
  pendingIncidents: number;
}

interface AttendanceRecord {
  id: string;
  checkIn: string;
  checkOut: string | null;
  late: boolean;
  lateMinutes: number;
  status: string;
  user: { name: string; department: string | null };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.stats); });
    fetch(`/api/attendance?date=${new Date().toISOString().split('T')[0]}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setAttendances(d.attendances); });
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Empleados', value: stats.totalEmployees, color: 'bg-blue-500' },
        { label: 'Presentes Hoy', value: stats.activeToday, color: 'bg-green-500' },
        { label: 'Retardos Hoy', value: stats.lateToday, color: 'bg-amber-500' },
        { label: 'Incidencias Pendientes', value: stats.pendingIncidents, color: 'bg-red-500' },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Panel de Administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className={`w-10 h-10 ${card.color} rounded-lg mb-3`} />
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Asistencia de Hoy</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Empleado</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Departamento</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Entrada</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Salida</th>
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
                  {a.checkOut
                    ? new Date(a.checkOut).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
                    : '-'}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      a.late ? 'bg-amber-100 text-amber-800'
                        : a.status === 'ACTIVE' ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {a.late
                      ? `Retardo (${a.lateMinutes} min)`
                      : a.status === 'ACTIVE' ? 'Activo' : 'Completado'}
                  </span>
                </td>
              </tr>
            ))}
            {attendances.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">No hay registros hoy</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
