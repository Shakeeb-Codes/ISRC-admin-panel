"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { graphqlRequest } from "../../lib/api";

export default function Header({ toggleSidebar }) {
  const [userRole, setUserRole] = useState("staff");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchUserData = async () => {
      const query = `
        query {
          me {
            first_name
            last_name
            role
          }
        }
      `;

      const data = await graphqlRequest(query);

      if (data?.me) {
        setUserName(`${data.me.first_name} ${data.me.last_name}`);
        setUserRole(data.me.role);
        localStorage.setItem("userName", `${data.me.first_name} ${data.me.last_name}`);
        localStorage.setItem("userRole", data.me.role);
      }
    };

    fetchUserData();
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

          <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
            Admin Panel
          </h1>
        </div>

        {/* Right: Profile */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* User Profile */}
          <div className="flex items-center gap-3">
            {/* Name + Role */}
            <div className="text-right hidden md:block leading-tight">
              <p className="text-sm font-semibold text-gray-800">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-300 bg-gray-100 overflow-hidden">
              {userRole === "admin" ? (
                <img
                  src="/images/logo.png"
                  alt="Admin"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-sm font-semibold text-gray-700">
                  {userName?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
