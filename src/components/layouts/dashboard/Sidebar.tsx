import React from 'react';
import Link from 'next/link';
// Importar SVG inline para los iconos
const MonitoringIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const HistoricalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Sidebar = () => {
  // No usar usePathname para evitar problemas de compatibilidad
  
  const menuItems = [
    { name: 'Monitoring', path: '/dashboard/monitoring', icon: <MonitoringIcon /> },
    { name: 'Historical', path: '/dashboard/historical', icon: <HistoricalIcon /> },
  ];

  return (
    <aside className="w-64 h-full bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-xl">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Energy Monitor</h2>
        </div>
        <nav>
          <ul className="space-y-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className="flex items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-md group"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
