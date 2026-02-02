'use client';

import { Menu } from 'lucide-react';

export default function Header({ toggleSidebar }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 sticky top-0 z-10">
      <div className="flex justify-between items-center gap-4">
        {/* Left: Hamburger Menu + Title */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Hamburger Menu (mobile only) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <Menu size={24} className="text-gray-600" />
          </button>

          <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">Admin Panel</h1>
          
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* User Profile */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden transition-all flex-shrink-0">
              <img
                src="/images/logo.png"
                alt="Admin"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}