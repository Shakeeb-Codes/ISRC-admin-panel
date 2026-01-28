'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, PlusCircle, Image, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/posts', label: 'Posts', icon: FileText },
    { href: '/admin/posts/new', label: 'Add New Post', icon: PlusCircle },
    { href: '/admin/media', label: 'Media Library', icon: Image },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // Clear authentication
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      
      // Redirect to login page
      window.location.href = '/';
    }
  };

  return (
    <div className="w-64 bg-[#009cd6] text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <Link href="/admin/dashboard" className="p-6 flex items-center gap-3 border-b border-gray-700 hover:bg-gray-700 transition-colors">
        <img src="/images/sidebar-logo.png" alt="ISRC Logo" />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                isActive
                  ? 'bg-[#2c3e50] text-white shadow-lg'
                  : 'text-white-300 hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 px-8 py-4 text-white-300 hover:bg-gray-700 transition-all border-t border-gray-700"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
}