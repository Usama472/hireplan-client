import React, { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ownerAuthService } from '@/http/owner/auth';
import {
  Users,
  Building2,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  UserCog
} from 'lucide-react';

interface OwnerLayoutProps {
  children: ReactNode;
}

const OwnerLayout: React.FC<OwnerLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await ownerAuthService.logout();
      navigate('/owner/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getMenuItems = () => [
    { icon: Activity, label: 'Dashboard', active: location.pathname === '/owner/dashboard', path: '/owner/dashboard' },
    { icon: Building2, label: 'Companies', active: location.pathname === '/owner/companies', path: '/owner/companies' },
    { icon: Users, label: 'Users', active: location.pathname === '/owner/users', path: '/owner/users' },
    { icon: UserCog, label: 'Admin Accounts', active: location.pathname === '/owner/accounts', path: '/owner/accounts' },
    { icon: CreditCard, label: 'Subscriptions', active: location.pathname === '/owner/subscriptions', path: '/owner/subscriptions' },
    { icon: AlertTriangle, label: 'Support Tickets', active: location.pathname === '/owner/support', path: '/owner/support' },
    { icon: TrendingUp, label: 'Analytics', active: location.pathname === '/owner/analytics', path: '/owner/analytics' },
  ];

  const menuItems = getMenuItems();

  const handleMenuClick = (path: string) => {
    console.log('🔗 Navigating to:', path);
    setSidebarOpen(false); // Close mobile sidebar on navigation
    navigate(path);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex lg:flex-col`}>
        <div className="flex items-center space-x-3 p-6 border-b border-slate-700">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white">Admin Portal</span>
            <p className="text-xs text-slate-400">HirePlan Admin</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-4 px-3 flex-1">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start rounded-lg ${
                    item.active 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => handleMenuClick(item.path)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-slate-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1" />
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
