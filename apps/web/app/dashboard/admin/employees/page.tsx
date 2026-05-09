'use client';

import { useState, useEffect, useCallback } from 'react';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  position: string | null;
  employeeId: string | null;
  phone: string | null;
  active: boolean;
  scheduleId: string | null;
  schedule: { name: string } | null;
}

interface Schedule {
  id: string;
  name: string;
}

const emptyForm = {
  name: '', email: '', password: '', role: 'EMPLOYEE',
  department: '', position: '', employeeId: '', phone: '', scheduleId: '',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);

  const loadEmployees = useCallback(async () => {
    const res = await fetch('/api/employees');
    const data = await res.json();
    if (data.success) setEmployees(data.employees);
  }, []);

  const loadSchedules = useCallback(async () => {
    const res = await fetch('/api/schedules');
    const data = await res.json();
    if (data.success) setSchedules(data.schedules);
  }, []);

  useEffect(() => {
    loadEmployees();
    loadSchedules();
  }, [loadEmployees, loadSchedules]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editing ? `/api/employees/${editing.id}` : '/api/employees';
    const method = editing ? 'PUT' : 'POST';
    const body = { ...form };
    if (editing && !form.password) delete (body as Record<string, string>).password;

    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      setShowModal(false);
      setEditing(null);
      setForm(emptyForm);
      loadEmployees();
    } else {
      alert(data.message);
    }
  }

  function openEdit(emp: Employee) {
    setEditing(emp);
    setForm({
      name: emp.name, email: emp.email, password: '', role: emp.role,
      department: emp.department || '', position: emp.position || '',
      employeeId: emp.employeeId || '', phone: emp.phone || '',
      scheduleId: emp.scheduleId || '',
    });
    setShowModal(true);
  }

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
        <button
          onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          Nuevo Empleado
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text" placeholder="Buscar empleados..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Nombre</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Rol</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Departamento</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Horario</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Estado</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-medium">{emp.name}</td>
                <td className="p-4 text-sm text-gray-500">{emp.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    emp.role === 'ADMIN' ? 'bg-purple-100 text-purple-800'
                    : emp.role === 'RH' ? 'bg-blue-100 text-blue-800'
                    : emp.role === 'SUPERVISOR' ? 'bg-teal-100 text-teal-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>{emp.role}</span>
                </td>
                <td className="p-4 text-sm text-gray-500">{emp.department || '-'}</td>
                <td className="p-4 text-sm text-gray-500">{emp.schedule?.name || '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    emp.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {emp.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => openEdit(emp)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">No hay empleados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña {editing && <span className="text-gray-400 font-normal">(vacío = sin cambio)</span>}
                  </label>
                  <input type="password" required={!editing} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="EMPLOYEE">Empleado</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="RH">RH</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puesto</label>
                  <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Empleado</label>
                  <input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
                  <select value={form.scheduleId} onChange={(e) => setForm({ ...form, scheduleId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Sin horario</option>
                    {schedules.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditing(null); }}
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
