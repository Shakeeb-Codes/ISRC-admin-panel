'use client';

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

export default function Header({ toggleSidebar }) {
  const [userRole, setUserRole] = useState('staff');
  const [userName, setUserName] = useState('User');
  const [userProfilePic, setUserProfilePic] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const role = localStorage.getItem('userRole') || 'staff';
    const name = localStorage.getItem('userName') || 'User';
    const email = localStorage.getItem('userEmail') || '';
    
    setUserRole(role);
    setUserName(name);

    // If staff, get their profile picture from staff list
    if (role === 'staff') {
      const staffList = JSON.parse(localStorage.getItem('staffList') || '[]');
      const currentStaff = staffList.find(s => s.email === email);
      
      if (currentStaff && currentStaff.profilePic) {
        setUserProfilePic(currentStaff.profilePic);
      }
    }
  }, []);

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

        {/* Right: Profile */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* User Profile */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-800">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden transition-all flex-shrink-0 bg-white border-2 border-gray-200">
              {userRole === 'admin' ? (
                // Admin: Show ISRC logo
                <img
                  src="/images/logo.png"
                  alt="Admin"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                // Staff: Show their profile picture
                <img
                  src={userProfilePic || 'https://via.placeholder.com/100'}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}