'use client';

import { useState, useEffect, useCallback } from 'react';

interface Incident {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  VACATION: 'Vacaciones', PERMISSION: 'Permiso',
  SICK_LEAVE: 'Incapacidad', ABSENCE: 'Falta', OTHER: 'Otro',
};

export default function MyIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'VACATION', startDate: '', endDate: '', reason: '' });

  const loadIncidents = useCallback(async () => {
    const res = await fetch('/api/incidents');
    const data = await res.json();
    if (data.success) setIncidents(data.incidents);
  }, []);

  useEffect(() => { loadIncidents(); }, [loadIncidents]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/incidents', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setShowModal(false);
      setForm({ type: 'VACATION', startDate: '', endDate: '', reason: '' });
      loadIncidents();
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis Incidencias</h1>
        <button onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
          Nueva Solicitud
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Tipo</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Desde</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Hasta</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Motivo</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Estado</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Fecha Solicitud</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {incidents.map((i) => (
              <tr key={i.id} className="hover:bg-gray-50">
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
                <td className="p-4 text-sm text-gray-500">{new Date(i.createdAt).toLocaleDateString('es-MX')}</td>
              </tr>
            ))}
            {incidents.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">No tienes incidencias</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva Solicitud</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="VACATION">Vacaciones</option>
                  <option value="PERMISSION">Permiso</option>
                  <option value="SICK_LEAVE">Incapacidad</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                  <input required type="date" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                  <input required type="date" value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
