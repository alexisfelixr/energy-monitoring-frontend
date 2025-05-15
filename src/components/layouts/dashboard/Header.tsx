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
  // const [localUser, setLocalUser] = useState(user);
  
  // When component mounts, check both context and localStorage for user data
  // useEffect(() => {
  //   setLocalUser(user);
  // }, [user]);
  
  const handleLogout = async () => {
    await logout();
    // setLocalUser(null);
  };
  
  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`;
  };
  
  // Use either context user or local user from storage
  const displayUser = user ;

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm backdrop-blur-sm z-10">
      <div className="flex items-center">
        <Link href="/dashboard" className="flex items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-green-400 rounded-md flex items-center justify-center text-white mr-3 shadow-md">
              <EnergyIcon />
            </div>
            <span className="text-xl font-semibold text-black tracking-tight">Energy<span className="text-blue-600 font-bold">Monitor</span></span>
          </div>
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* User profile information */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-black">{displayUser?.nombre} {displayUser?.apellido}</p>
            <p className="text-xs font-medium text-blue-700">{displayUser?.email}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-md">
            <span className="text-sm font-semibold">
              {displayUser ? getInitials(displayUser.nombre, displayUser.apellido) : 'UN'}
            </span>
          </div>
        </div>
        
        {/* Botón de logout */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow transition-colors flex items-center space-x-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
