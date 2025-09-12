export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-prometeo-red mb-8 text-center">
        Dashboard
      </h1>

      {/* Tarjetas de ejemplo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-prometeo-black p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold mb-2 text-prometeo-white">Archivo 1</h2>
          <p className="text-sm text-gray-400">Última modificación: hoy</p>
        </div>

        <div className="bg-prometeo-black p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold mb-2 text-prometeo-white">Archivo 2</h2>
          <p className="text-sm text-gray-400">Última modificación: ayer</p>
        </div>

        <div className="bg-prometeo-black p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold mb-2 text-prometeo-white">Archivo 3</h2>
          <p className="text-sm text-gray-400">Última modificación: hace 1 semana</p>
        </div>
      </div>
    </div>
  );
}
