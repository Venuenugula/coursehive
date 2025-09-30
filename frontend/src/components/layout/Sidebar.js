import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  FileText, 
  BarChart3, 
  User, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Brain,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  Target
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: Home,
      color: 'coursehive-primary'
    },
    {
      name: 'Resources',
      path: '/links',
      icon: BookOpen,
      color: 'coursehive-secondary',
      submenu: [
        { name: 'All Resources', path: '/links' },
        { name: 'Bookmarked', path: '/links?bookmarked=true' },
        { name: 'Recent', path: '/links?recent=true' }
      ]
    },
    {
      name: 'Tests',
      path: '/tests',
      icon: FileText,
      color: 'coursehive-accent',
      submenu: [
        { name: 'All Tests', path: '/tests' },
        { name: 'My Tests', path: '/tests?my=true' },
        { name: 'Test History', path: '/tests?history=true' }
      ]
    },
    {
      name: 'Learning Paths',
      path: '/learning-paths',
      icon: Target,
      color: 'coursehive-accent'
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
      color: 'coursehive-warm'
    },
    {
      name: 'AI Tutor',
      path: '/ai-tutor',
      icon: Brain,
      color: 'coursehive-primary'
    },
    {
      name: 'Community',
      path: '/community',
      icon: Users,
      color: 'coursehive-secondary'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSubmenu = (itemName) => {
    setActiveSubmenu(activeSubmenu === itemName ? null : itemName);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        h-full bg-white border-r border-gray-200 transition-all duration-500 ease-in-out shadow-lg flex-shrink-0
        ${isOpen ? 'w-64' : 'w-16'}
      `}>
        {/* Header - Toggle Button Only */}
        <div className="flex items-center justify-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-110"
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isItemActive = isActive(item.path);
            const isSubmenuOpen = activeSubmenu === item.name;

            return (
              <div key={item.name}>
                <Link
                  to={hasSubmenu ? '#' : item.path}
                  onClick={(e) => {
                    if (hasSubmenu) {
                      e.preventDefault();
                      toggleSubmenu(item.name);
                    }
                  }}
                  className={`
                    flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer group transform hover:scale-105 hover:shadow-md
                    ${isItemActive 
                      ? 'bg-blue-500 text-white shadow-lg scale-105' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded-lg transition-all duration-300 ${
                      isItemActive ? 'bg-white bg-opacity-20' : 'group-hover:bg-blue-100'
                    }`}>
                      <Icon className={`h-5 w-5 transition-all duration-300 ${
                        isItemActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                      }`} />
                    </div>
                    <span className={`font-medium transition-all duration-300 ${
                      isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'
                    }`}>
                      {item.name}
                    </span>
                  </div>
                  {hasSubmenu && (
                    <ChevronRight 
                      className={`h-4 w-4 transition-all duration-300 ${
                        isOpen ? 'opacity-100' : 'opacity-0 w-0'
                      } ${isSubmenuOpen ? 'rotate-90' : ''}`} 
                    />
                  )}
                </Link>

                {/* Submenu */}
                {hasSubmenu && isOpen && isSubmenuOpen && (
                  <div className="ml-4 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className={`
                          block p-2 pl-8 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-sm
                          ${isActive(subItem.path)
                            ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                          }
                        `}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-white to-blue-50">
          <div className="space-y-2">
            <Link
              to="/settings"
              className={`
                flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-sm
                ${isActive('/settings')
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }
              `}
            >
              <div className={`p-1 rounded-lg transition-all duration-300 ${
                isActive('/settings') ? 'bg-white bg-opacity-20' : 'hover:bg-blue-100'
              }`}>
                <Settings className="h-5 w-5" />
              </div>
              <span className={`font-medium transition-all duration-300 ${
                isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'
              }`}>
                Settings
              </span>
            </Link>
            <Link
              to="/help"
              className={`
                flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-sm
                ${isActive('/help')
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }
              `}
            >
              <div className={`p-1 rounded-lg transition-all duration-300 ${
                isActive('/help') ? 'bg-white bg-opacity-20' : 'hover:bg-blue-100'
              }`}>
                <HelpCircle className="h-5 w-5" />
              </div>
              <span className={`font-medium transition-all duration-300 ${
                isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'
              }`}>
                Help & Support
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;