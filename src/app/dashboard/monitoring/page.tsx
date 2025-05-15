"use client";

import { useState, useEffect } from "react";
import LineChart from "@/components/ui/LineChart";
import BarChart from "@/components/ui/BarChart";
import PieChart from "@/components/ui/PieChart";
import { MedicionesAPI, CentrosAPI, CentroMonitoringData, Centro } from "@/lib/api";

// Initial empty state for charts
const initialLineData = [
  { date: "00:00", voltage: 0, current: 0 }
];

// Initial types of consumption
const consumptionTypes = [
  { name: "Lighting", value: 0 },
  { name: "HVAC", value: 0 },
  { name: "Equipment", value: 0 }
];

export default function MonitoringPage() {
  // State for chart data and stats
  const [realtimeData, setRealtimeData] = useState(initialLineData);
  const [deviceData, setDeviceData] = useState<{name: string, status: string, consumption: number, lastUpdate: string, id: number}[]>([]);
  const [energyByDeviceData, setEnergyByDeviceData] = useState<{name: string, value: number}[]>([]);
  const [consumptionByTypeData, setConsumptionByTypeData] = useState(consumptionTypes);
  const [currentConsumption, setCurrentConsumption] = useState(0);
  const [efficiency, setEfficiency] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for centers and selected center
  const [centers, setCenters] = useState<Centro[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(null);
  
    // Fetch all monitoring data for a specific center
  const fetchCenterMonitoringData = async (centerId: number) => {
    try {
      setLoading(true);
      setError("");
      
      // Get all monitoring data for the center using the new endpoint
      const centerData: CentroMonitoringData = await MedicionesAPI.getCentroMonitoringData(centerId);
      
      // Format the voltage & current data for the LineChart
      const voltageCurrentData = centerData.voltajeCorrienteSeries.map(item => ({
        date: item.hora,
        voltage: item.voltaje,
        current: item.corriente
      }));
      
      // Format device data
      const deviceList = centerData.dispositivos.map(device => ({
        id: device.id,
        name: device.nombre,
        status: device.estado === 'activo' ? 'Online' : 'Offline',
        consumption: device.consumo !== undefined ? parseFloat(device.consumo.toFixed(1)) : 0,
        lastUpdate: formatLastUpdate(new Date(device.ultimaActualizacion))
      }));
      
      // Update all state with the fetched data
      if (voltageCurrentData.length > 0) {
        setRealtimeData(voltageCurrentData);
      }
      
      if (centerData.energiaPorDispositivo?.length > 0) {
        // Map the properties to match the expected format for the chart
        const formattedEnergyData = centerData.energiaPorDispositivo.map(item => ({
          name: item.nombre,
          value: item.valor
        }));
        setEnergyByDeviceData(formattedEnergyData);
      }
      
      if (centerData.consumoPorTipo?.length > 0) {
        // Map the properties to match the expected format for the chart
        const formattedConsumptionData = centerData.consumoPorTipo.map(item => ({
          name: item.nombre,
          value: item.valor
        }));
        setConsumptionByTypeData(formattedConsumptionData);
      } else {
        // If not provided by the API, generate it from the total consumption
        updateConsumptionByType(centerData.consumoTotal);
      }
      
      setDeviceData(deviceList);
      setCurrentConsumption(parseFloat(centerData.consumoTotal.toFixed(1)));
      setEfficiency(centerData.eficiencia);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching center monitoring data:', err);
      setError('Failed to load center monitoring data');
      setLoading(false);
    }
  };

  // Fetch centers data for dropdown selection
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const data = await CentrosAPI.getAll();
        setCenters(data);
        
        // Select the first center by default if any exist
        if (data.length > 0) {
          setSelectedCenterId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching centers:', err);
        setError('Failed to load centers data');
      }
    };
    
    fetchCenters();
  }, []);
  
  // Fetch center monitoring data when selected center changes
  useEffect(() => {
    if (selectedCenterId !== null) {
      fetchCenterMonitoringData(selectedCenterId);
      
      // Set up polling interval to refresh data every 2 minutes
      const interval = setInterval(() => {
        fetchCenterMonitoringData(selectedCenterId);
      }, 120000);
      
      return () => clearInterval(interval);
    }
  }, [selectedCenterId]);
  
  // Helper function to format the last update time
  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Sample distribution by type - replace with actual data from backend if available
  const updateConsumptionByType = (totalConsumption: number) => {
    // This is just a placeholder - ideally this data would come from your backend
    setConsumptionByTypeData([
      { name: "Lighting", value: Math.round(totalConsumption * 0.25) },
      { name: "HVAC", value: Math.round(totalConsumption * 0.40) },
      { name: "Equipment", value: Math.round(totalConsumption * 0.35) }
    ]);
  };
  
  const handleCenterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const centerId = parseInt(e.target.value);
    setSelectedCenterId(centerId);
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-green-500 p-2 rounded-md mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Real-Time Monitoring</h1>
        </div>

        {/* Center Selection Filter */}
        <div className="flex items-center">
          <label htmlFor="centerSelect" className="mr-2 text-gray-700 font-medium">Center:</label>
          <select
            id="centerSelect"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={selectedCenterId || ''}
            onChange={handleCenterChange}
            disabled={loading || centers.length === 0}
          >
            {centers.length === 0 ? (
              <option value="">No centers available</option>
            ) : (
              centers.map(center => (
                <option key={center.id} value={center.id}>{center.nombre}</option>
              ))
            )}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Tarjetas de estadísticas */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-50 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Consumption</p>
                <p className="text-2xl font-bold text-gray-800">{currentConsumption}<span className="text-base font-medium"> kWh</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="rounded-full bg-green-50 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Efficiency</p>
                <p className="text-2xl font-bold text-gray-800">{efficiency}<span className="text-base font-medium"> %</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-50 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Usage Status</p>
                <p className="text-2xl font-bold text-green-600">Normal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
          <h2 className="text-lg font-bold mb-4 text-black">Real-time Voltage & Current</h2>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="h-80 flex items-center justify-center text-red-500">{error}</div>
        ) : (
          <div className="h-80">
            <LineChart data={realtimeData} width={800} height={320} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-black">Energy Consumption by Device</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="h-64 flex items-center justify-center text-red-500">{error}</div>
          ) : energyByDeviceData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">No device data available</div>
          ) : (
            <div className="h-64">
              <BarChart data={energyByDeviceData} width={500} height={250} color="#10B981" />
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-black">Consumption by Type</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="h-64 flex items-center justify-center text-red-500">{error}</div>
          ) : consumptionByTypeData.every(item => item.value === 0) ? (
            <div className="h-64 flex items-center justify-center text-gray-500">No consumption data available</div>
          ) : (
            <div className="h-64 flex justify-center">
              <PieChart data={consumptionByTypeData} width={250} height={250} />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-lg font-bold mb-4 text-black">Devices Status</h2>
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="h-40 flex items-center justify-center text-red-500">{error}</div>
        ) : deviceData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-500">No devices available</div>
        ) : (
          <div className="border border-gray-200 rounded-lg">
            <div className="grid grid-cols-4 bg-gray-100 p-4 border-b border-gray-200 font-semibold text-gray-900">
              <div>Device Name</div>
              <div>Status</div>
              <div>Consumption</div>
              <div>Last Update</div>
            </div>
            {deviceData.map((device, index) => (
              <div key={index} className={`grid grid-cols-4 p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 font-medium`}>
                <div className="font-semibold text-gray-900">{device.name}</div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${device.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {device.status}
                  </span>
                </div>
                <div className="text-gray-900">{device.consumption} kWh</div>
                <div className="text-gray-900">{device.lastUpdate}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
