"use client";

import React, { useState, useEffect } from "react";
import HistoricalChart from '@/components/ui/HistoricalChart';
import { MedicionesAPI, SensorsAPI, CentrosAPI, AreasAPI } from "@/lib/api";
import { format } from "date-fns";

// Tipos para los datos históricos
type HistoricalDataResume = {
  fecha: string;
  centroid: number;
  centronombre: string;
  areaid: number;
  areanombre: string;
  sensorid: number;
  sensoruid: string;
  voltajepromedio: string;
  corrientepromedio: string;
  consumopromedio: string;
};

type MedicionPorDia = {
  fecha: string;
  voltajepromedio: string;
  corrientepromedio: string;
};

export default function HistoricalPage() {
  // Estados para datos y filtros
  const [historicalData, setHistoricalData] = useState<HistoricalDataResume[]>([]);
  const [medicionesPorDia, setMedicionesPorDia] = useState<MedicionPorDia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los filtros
  const [centros, setCentros] = useState<{id: number; nombre: string}[]>([]);
  const [areas, setAreas] = useState<{id: number; nombre: string}[]>([]);
  const [sensores, setSensores] = useState<{id: number; sensorUid: string}[]>([]);
  
  const [filters, setFilters] = useState({
    startDate: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 7 días atrás
    endDate: format(new Date(), 'yyyy-MM-dd'),
    centroId: '',
    areaId: '',
    sensorId: ''
  });

  // Función para manejar cambios en los filtros
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Cargar los centros, áreas y sensores para los filtros
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [centrosData, areasData, sensoresData] = await Promise.all([
          CentrosAPI.getAll(),
          AreasAPI.getAll(),
          SensorsAPI.getAll()
        ]);
        
        setCentros(centrosData);
        setAreas(areasData);
        setSensores(sensoresData);
      } catch (err) {
        console.error("Error loading filter options:", err);
        setError("Error al cargar opciones de filtro.");
      }
    };
    
    loadFilterOptions();
  }, []);

  // Función para cargar datos históricos con los filtros aplicados
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Convertir filtros a números cuando sea necesario
        const apiFilters = {
          startDate: filters.startDate,
          endDate: filters.endDate,
          centroId: filters.centroId ? parseInt(filters.centroId) : undefined,
          areaId: filters.areaId ? parseInt(filters.areaId) : undefined,
          sensorId: filters.sensorId ? parseInt(filters.sensorId) : undefined
        };
        
        const response = await MedicionesAPI.getHistoricalData(apiFilters);

        if (response) {          
          setHistoricalData(response.medicionesHistorial || []);
          setMedicionesPorDia(response.medicionesPorDia || []);
        } else {
          setError("No se recibieron datos del servidor.");
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching historical data:", err);
        setError("Error al cargar los datos históricos.");
        setIsLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [filters]); // Se ejecuta cuando cambian los filtros
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Datos Históricos</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Filtros */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 mb-6 text-black">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <button 
            type="button" 
            className="md:hidden text-sm text-blue-600 font-medium flex items-center"
            onClick={() => {
              const filtersContainer = document.getElementById('filtersContainer');
              if (filtersContainer) {
                filtersContainer.classList.toggle('hidden');
              }
            }}
          >
            <span>Ajustar</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* Contenedor de filtros que se puede ocultar/mostrar en móvil */}
        <div id="filtersContainer" className="block">
          {/* Fechas en una fila para móvil */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-2 md:mb-0">
            {/* Fecha inicio */}
            <div>
              <label htmlFor="startDate" className="block text-xs font-medium text-black mb-1">Inicio</label>
              <input
                type="date"
                id="startDate"
                className="w-full p-1 sm:p-2 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                max={format(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')}
              />
            </div>
            
            {/* Fecha fin */}
            <div>
              <label htmlFor="endDate" className="block text-xs font-medium text-black mb-1">Fin</label>
              <input
                type="date"
                id="endDate"
                className="w-full p-1 sm:p-2 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            
            {/* Centro, Área y Sensor en otra fila para móvil */}
            <div className="md:col-span-1">
              <label htmlFor="centroId" className="block text-xs font-medium text-black mb-1">Centro</label>
              <select
                id="centroId"
                className="w-full p-1 sm:p-2 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                value={filters.centroId}
                onChange={(e) => handleFilterChange("centroId", e.target.value)}
              >
                <option value="">Todos</option>
                {centros.map((centro) => (
                  <option key={centro.id} value={centro.id.toString()}>{centro.nombre}</option>
                ))}
              </select>
            </div>
            
            {/* Área */}
            <div className="md:col-span-1">
              <label htmlFor="areaId" className="block text-xs font-medium text-black mb-1">Área</label>
              <select
                id="areaId"
                className="w-full p-1 sm:p-2 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                value={filters.areaId}
                onChange={(e) => handleFilterChange("areaId", e.target.value)}
              >
                <option value="">Todas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id.toString()}>{area.nombre}</option>
                ))}
              </select>
            </div>
            
            {/* Sensor */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="sensorId" className="block text-xs font-medium text-black mb-1">Sensor</label>
              <select
                id="sensorId"
                className="w-full p-1 sm:p-2 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                value={filters.sensorId}
                onChange={(e) => handleFilterChange("sensorId", e.target.value)}
              >
                <option value="">Todos</option>
                {sensores.map((sensor) => (
                  <option key={sensor.id} value={sensor.id.toString()}>{sensor.sensorUid}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráfico principal de líneas */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Voltaje y Consumo por día</h2>
        </div>
        <div className="h-80 w-full">
          {isLoading ? (
            <div className="w-full h-full flex justify-center items-center">
              <div className="loader">Cargando...</div>
            </div>
          ) : (
            <HistoricalChart 
              data={(() => {
                // Convertir los datos al formato que espera HistoricalChart
                const formattedData = (medicionesPorDia || []).map(point => {
                  return {
                    fecha: point.fecha.toString().split('T')[0],
                    voltaje: parseFloat(point.voltajepromedio) || 0,
                    consumo: parseFloat(point.corrientepromedio) || 0
                  };
                });
                
                // Si no hay datos, proporcionar un punto de datos predeterminado
                return formattedData.length > 0 
                  ? formattedData 
                  : [{ fecha: format(new Date(), 'yyyy-MM-dd'), voltaje: 0, consumo: 0 }];
              })()}
              width={800} 
              height={320} 
            />
          )}
        </div>
      </div>
      
      {/* Tabla de datos */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-lg font-bold mb-4 text-black">Datos Detallados</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200 table-auto text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wider">Fecha</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wider">Centro</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wider">Área</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wider">Sensor</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wider">Voltaje</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wider">Corriente</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wider">Consumo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">Cargando datos...</td>
                </tr>
              ) : historicalData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">No hay datos disponibles para los filtros seleccionados</td>
                </tr>
              ) : (
                historicalData.map((item, index) => {
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-[10px] sm:text-sm font-medium text-gray-900">{item?.fecha ? new Date(item.fecha).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-[10px] sm:text-sm font-medium text-gray-900">{item?.centronombre || 'N/A'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-[10px] sm:text-sm font-medium text-gray-900">{item?.areanombre || 'N/A'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-[10px] sm:text-sm font-medium text-gray-900">{item?.sensoruid || 'N/A'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-[10px] sm:text-sm font-medium text-gray-900">
                        {parseFloat(item?.voltajepromedio || '0').toFixed(1)}V
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-[10px] sm:text-sm font-medium text-gray-900">
                        {parseFloat(item?.corrientepromedio || '0').toFixed(1)}A
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-[10px] sm:text-sm font-medium text-gray-900">
                        {parseFloat(item?.consumopromedio || '0').toFixed(1)}kW
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
