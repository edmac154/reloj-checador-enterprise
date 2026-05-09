'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

const personalLinks = [
  { href: '/dashboard', label: 'Mi Panel' },
  { href: '/dashboard/incidents', label: 'Mis Incidencias' },
];

const adminLinks = [
  { href: '/dashboard/admin', label: 'Panel General' },
  { href: '/dashboard/admin/employees', label: 'Empleados' },
  { href: '/dashboard/admin/attendance', label: 'Asistencia' },
  { href: '/dashboard/admin/schedules', label: 'Horarios' },
  { href: '/dashboard/admin/incidents', label: 'Incidencias' },
  { href: '/dashboard/admin/reports', label: 'Reportes' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isAdmin = user && ['ADMIN', 'RH'].includes(user.role);

  if (!user) {
    return <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900" />;
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col z-40">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-lg font-bold tracking-tight">Reloj Checador</h1>
        <p className="text-xs text-slate-400 mt-0.5">Enterprise</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Personal
        </p>
        {personalLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === link.href
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {link.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <p className="px-4 py-2 mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Administración
            </p>
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === link.href
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="px-4 py-2">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-xs text-slate-400">{user.role}</p>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 mt-1 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-left transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
