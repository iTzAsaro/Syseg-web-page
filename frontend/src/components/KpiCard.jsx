import React from 'react';

// --- COMPONENTE: TARJETA KPI (Reutilizable) ---
// Muestra indicadores clave de rendimiento con iconos, valores y tendencias
const KpiCard = ({ title, value, trend, trendIcon: TrendIcon, icon: Icon, trendColor, trendBg }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group relative overflow-hidden flex flex-col h-full min-h-[160px]">
      <div className="flex justify-between items-start gap-4 relative z-10 mb-4">
          <div className="flex flex-col flex-1 min-w-0">
              <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 truncate" title={title}>{title}</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight truncate">{value}</h3>
          </div>
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white shadow-lg shadow-black/10 group-hover:bg-red-600 group-hover:shadow-red-600/30 group-hover:scale-110 transition-all duration-300 shrink-0">
              <Icon className="w-6 h-6" />
          </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between relative z-10">
          <span className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${trendBg} ${trendColor} flex items-center gap-1.5 border border-transparent`}>
              <TrendIcon className="w-3.5 h-3.5" /> 
              {trend}
          </span>
          <span className="text-[10px] text-gray-300 font-medium">Estado actual</span>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
  </div>
);

export default KpiCard;
