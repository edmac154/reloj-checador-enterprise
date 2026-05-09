'use client';

import { useState } from 'react';

export default function ReportsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  function handleExport() {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    window.open(`/api/export/excel?${params.toString()}`, '_blank');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Reportes</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Exportar Asistencia a Excel</h2>
        <p className="text-sm text-gray-500 mb-6">
          Selecciona un rango de fechas para generar el reporte de asistencia en formato Excel.
        </p>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <button onClick={handleExport}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm font-medium h-[42px]">
            Descargar Excel
          </button>
        </div>
      </div>
    </div>
  );
}
