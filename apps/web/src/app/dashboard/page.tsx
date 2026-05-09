'use client';

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold">
            Employees
          </h2>

          <p className="text-4xl mt-4">
            0
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold">
            Active Today
          </h2>

          <p className="text-4xl mt-4">
            0
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold">
            Incidents
          </h2>

          <p className="text-4xl mt-4">
            0
          </p>
        </div>
      </div>
    </main>
  );
}