import { AuthProvider } from '@/components/AuthProvider';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64 p-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
