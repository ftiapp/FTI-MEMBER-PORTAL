'use client';

import Link from 'next/link';

function MenuItem({ 
  item, 
  pathname, 
  collapsed, 
  loading, 
  activePath, 
  onNavigation 
}) {
  const isActive = pathname === item.path || (item.path !== '/admin/dashboard' && pathname.startsWith(item.path));
  const isLoading = loading && activePath === item.path;

  return (
    <div className="mb-2 relative">
      <Link
        href={item.path}
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          isActive 
            ? 'bg-gray-900 text-white' 
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={(e) => onNavigation(e, item.path)}
      >
        <div className="mr-3">{item.icon}</div>
        {!collapsed && (
          <div className="flex-grow">
            <span>{item.name}</span>
            {item.badge && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                {item.badge}
              </span>
            )}
          </div>
        )}
        {collapsed && item.badge && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    </div>
  );
}

export default MenuItem;