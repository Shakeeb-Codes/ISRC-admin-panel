"use client";

import { Search } from "lucide-react";

export default function Header() {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>

          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 max-w-md flex-1 ml-8">
            <Search size={20} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search posts, media..."
              className="bg-transparent outline-none w-full text-gray-700"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#009cd6] transition-all">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
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
