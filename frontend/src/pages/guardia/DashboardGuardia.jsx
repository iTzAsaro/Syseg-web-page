import React from 'react';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardGuardia = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Panel de Guardia</h1>
        <Link to="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
        </Link>
      </header>
      
      <main className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Bienvenido, Guardia</h2>
            <p className="text-gray-500">Aquí podrás gestionar tus tareas diarias.</p>
            {/* Aquí iría la funcionalidad específica para guardias */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardGuardia;
