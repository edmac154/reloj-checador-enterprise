'use client';

import { useState, useEffect, useCallback } from 'react';

interface Schedule {
  id: string;
  name: string;
  checkInTime: string;
  checkOutTime: string;
  toleranceMinutes: number;
  _count: { users: number };
}

const emptyForm = { name: '', checkInTime: '09:00', checkOutTime: '18:00', toleranceMinutes: 15 };

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadSchedules = useCallback(async () => {
    const res = await fetch('/api/schedules');
    const data = await res.json();
    if (data.success) setSchedules(data.schedules);
  }, []);

  useEffect(() => { loadSchedules(); }, [loadSchedules]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editing ? `/api/schedules/${editing.id}` : '/api/schedules';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setShowModal(false);
      setEditing(null);
      setForm(emptyForm);
      loadSchedules();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este horario?')) return;
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    loadSchedules();
  }

  function openEdit(s: Schedule) {
    setEditing(s);
    setForm({ name: s.name, checkInTime: s.checkInTime, checkOutTime: s.checkOutTime, toleranceMinutes: s.toleranceMinutes });
    setShowModal(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Horarios</h1>
        <button
          onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          Nuevo Horario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map((s) => (
          <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-3">{s.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Entrada: <span className="font-medium text-gray-900">{s.checkInTime}</span></p>
              <p>Salida: <span className="font-medium text-gray-900">{s.checkOutTime}</span></p>
              <p>Tolerancia: <span className="font-medium text-gray-900">{s.toleranceMinutes} min</span></p>
              <p>Empleados: <span className="font-medium text-gray-900">{s._count.users}</span></p>
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => openEdit(s)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Editar</button>
              <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
            </div>
          </div>
        ))}
        {schedules.length === 0 && (
          <p className="text-gray-400 col-span-3 text-center py-12">No hay horarios configurados</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Editar Horario' : 'Nuevo Horario'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Ej: Turno Matutino" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Entrada</label>
                  <input required type="time" value={form.checkInTime}
                    onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Salida</label>
                  <input required type="time" value={form.checkOutTime}
                    onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tolerancia (minutos)</label>
                <input required type="number" value={form.toleranceMinutes}
                  onChange={(e) => setForm({ ...form, toleranceMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                  {editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
