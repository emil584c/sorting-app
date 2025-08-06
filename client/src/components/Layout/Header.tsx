import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { SettingsDialog } from '@/components/Settings/SettingsDialog';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-4 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Home Organizer</h1>
              <p className="text-xs text-gray-500 -mt-1">Organize your life</p>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-2">
          <Link
            to="/"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname === '/' 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/categories"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname === '/categories' 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80'
            }`}
          >
            Categories
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
              {user?.email}
            </span>
          </div>
          <SettingsDialog />
          <Button variant="ghost" size="icon" onClick={logout} className="hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};