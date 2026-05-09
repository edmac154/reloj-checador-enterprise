'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface Attendance {
  id: string;
  checkIn: string;
  checkOut: string | null;
  workedHours: number | null;
  late: boolean;
  lateMinutes: number;
  overtime: number;
  status: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAttendances = useCallback(async () => {
    const res = await fetch('/api/attendance/today');
    const data = await res.json();
    if (data.success) setAttendances(data.attendances);
  }, []);

  useEffect(() => {
    loadAttendances();
  }, [loadAttendances]);

  const activeAttendance = attendances.find((a) => a.status === 'ACTIVE');

  async function handleAction(type: 'checkin' | 'checkout') {
    setLoading(true);
    try {
      const res = await fetch(`/api/${type}`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        alert(data.message);
        return;
      }
      loadAttendances();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.name}</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('es-MX', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          className={`col-span-2 p-6 rounded-xl shadow-sm ${
            activeAttendance
              ? 'bg-green-50 border border-green-200'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h2 className="text-lg font-semibold mb-2">
            {activeAttendance ? 'Jornada Activa' : 'Sin Entrada'}
          </h2>
          {activeAttendance ? (
            <div>
              <p className="text-green-700">
                Entrada:{' '}
                {new Date(activeAttendance.checkIn).toLocaleTimeString('es-MX', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
              {activeAttendance.late && (
                <p className="text-amber-600 text-sm mt-1">
                  Retardo: {activeAttendance.lateMinutes} min
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No has registrado entrada hoy</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {!activeAttendance ? (
            <button
              onClick={() => handleAction('checkin')}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors text-center py-4"
            >
              {loading ? 'Registrando...' : 'Registrar Entrada'}
            </button>
          ) : (
            <button
              onClick={() => handleAction('checkout')}
              disabled={loading}
              className="flex-1 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors text-center py-4"
            >
              {loading ? 'Registrando...' : 'Registrar Salida'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Historial de Asistencia</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Fecha</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Entrada</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Salida</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Horas</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {attendances.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm">
                  {new Date(a.checkIn).toLocaleDateString('es-MX')}
                </td>
                <td className="p-4 text-sm">
                  {new Date(a.checkIn).toLocaleTimeString('es-MX', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </td>
                <td className="p-4 text-sm">
                  {a.checkOut
                    ? new Date(a.checkOut).toLocaleTimeString('es-MX', {
                        hour: '2-digit', minute: '2-digit',
                      })
                    : '-'}
                </td>
                <td className="p-4 text-sm font-medium">
                  {a.workedHours ? `${a.workedHours} hrs` : '-'}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      a.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : a.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {a.status === 'ACTIVE' ? 'Activo' : a.status === 'COMPLETED' ? 'Completado' : a.status}
                  </span>
                  {a.late && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Retardo ({a.lateMinutes} min)
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {attendances.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No hay registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
