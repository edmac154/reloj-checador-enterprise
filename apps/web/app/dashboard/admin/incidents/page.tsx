'use client';

import { useState, useEffect, useCallback } from 'react';

interface Incident {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
  user: { name: string; department: string | null };
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  VACATION: 'Vacaciones', PERMISSION: 'Permiso',
  SICK_LEAVE: 'Incapacidad', ABSENCE: 'Falta', OTHER: 'Otro',
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState('ALL');

  const loadIncidents = useCallback(async () => {
    const res = await fetch('/api/incidents');
    const data = await res.json();
    if (data.success) setIncidents(data.incidents);
  }, []);

  useEffect(() => { loadIncidents(); }, [loadIncidents]);

  async function handleAction(id: string, status: string) {
    const res = await fetch(`/api/incidents/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) loadIncidents();
  }

  const filtered = filter === 'ALL' ? incidents : incidents.filter((i) => i.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Incidencias</h1>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'ALL', label: 'Todas' }, { key: 'PENDING', label: 'Pendientes' },
          { key: 'APPROVED', label: 'Aprobadas' }, { key: 'REJECTED', label: 'Rechazadas' },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f.key ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>{f.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Empleado</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Tipo</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Desde</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Hasta</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Motivo</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Estado</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((i) => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-medium">{i.user.name}</td>
                <td className="p-4 text-sm">{typeLabels[i.type] || i.type}</td>
                <td className="p-4 text-sm">{new Date(i.startDate).toLocaleDateString('es-MX')}</td>
                <td className="p-4 text-sm">{new Date(i.endDate).toLocaleDateString('es-MX')}</td>
                <td className="p-4 text-sm text-gray-500">{i.reason || '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    i.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800'
                    : i.status === 'APPROVED' ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                    {i.status === 'PENDING' ? 'Pendiente' : i.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}
                  </span>
                </td>
                <td className="p-4">
                  {i.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(i.id, 'APPROVED')}
                        className="text-green-600 hover:text-green-800 text-sm font-medium">Aprobar</button>
                      <button onClick={() => handleAction(i.id, 'REJECTED')}
                        className="text-red-600 hover:text-red-800 text-sm font-medium">Rechazar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">No hay incidencias</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
