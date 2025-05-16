'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';

// Icono de energía para el logo
const EnergyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const Header = () => {
  // Get user from auth context
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`;
  };

  // Use either context user or local user from storage
  const displayUser = user;

  // Menu items - same as in Sidebar
  const menuItems = [
    { name: 'Monitoring', path: '/dashboard/monitoring', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
    { name: 'Historical', path: '/dashboard/historical', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  ];

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm backdrop-blur-sm z-10">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Logo section */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-green-400 rounded-md flex items-center justify-center text-white mr-3 shadow-md">
                <EnergyIcon />
              </div>
              <span className="hidden sm:inline-block text-xl font-semibold text-black tracking-tight">Energy<span className="text-blue-600 font-bold">Monitor</span></span>
            </div>
          </Link>
        </div>

        {/* Mobile navigation shown only on smaller screens */}
        <div className="md:hidden flex items-center">
          <div className="flex space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 flex items-center"
              >
                <span className="mr-1">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* User profile and logout section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-black">{displayUser?.nombre} {displayUser?.apellido}</p>
              <p className="text-xs font-medium text-blue-700">{displayUser?.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-md">
              <span className="text-sm font-semibold">
                {displayUser ? getInitials(displayUser.nombre, displayUser.apellido) : 'UN'}
              </span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow transition-colors flex items-center space-x-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
