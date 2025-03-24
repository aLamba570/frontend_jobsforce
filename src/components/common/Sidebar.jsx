import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import {
  HomeIcon,
  BriefcaseIcon,
  UserIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      current: location.pathname === '/dashboard',
    },
    {
      name: 'Jobs',
      href: '/jobs',
      icon: BriefcaseIcon,
      current: location.pathname === '/jobs' || location.pathname.startsWith('/jobs/'),
    },
    // {
    //   name: 'Resume',
    //   href: '/resume',
    //   icon: DocumentTextIcon,
    //   current: location.pathname === '/resume',
    // },
    
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
      current: location.pathname === '/profile',
    },
  ];

  if (!currentUser) {
    return null;
  }

  return (
    <div className={`bg-white shadow-md ${collapsed ? 'w-16' : 'w-64'} transition-width duration-300 ease-in-out overflow-y-auto h-screen`}>
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-800">
            Navigation
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                item.current
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <item.icon
                className={`${
                  item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 flex-shrink-0 h-6 w-6`}
                aria-hidden="true"
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {!collapsed && (
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{currentUser?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;