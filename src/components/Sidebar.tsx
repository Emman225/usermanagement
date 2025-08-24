"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { hasPermission } from "@/utils/roleCheck";

const menuData = [
  {
    title: "Dashboard",
    icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z'/></svg>",
    link: "/dashboard",
  },
  {
    title: "Journal",
    icon: "<svg class='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'/></svg>",
    link: "/dashboard/logs",
    requiredRole: "admin"
  },
  
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleNavigation = (link: string) => {
    if (link !== pathname) {
      setLoading(true);
      router.push(link);
    }
  };

  return (
    <aside className="bg-gray-900 text-gray-300 w-56 flex flex-col font-sans border-r border-gray-200 min-h-screen rounded-tr-lg rounded-br-lg">
      <div className="flex items-center justify-center h-16 border-b border-gray-700 px-4">
        <Image
          src="/logo.png"
          alt="User Management"
          width={48}
          height={48}
          className="h-12 w-auto object-contain"
        />
      </div>
      {loading && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12"></div>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {menuData.map((item, idx) => {
            // Vérifier si l'utilisateur a la permission d'accéder à ce menu
            const hasAccess = !item.requiredRole || hasPermission(item.requiredRole);
            
            if (!hasAccess) return null;
            
            return (
              <li key={idx}>
                {item.link && (
                  <button
                    onClick={() => handleNavigation(item.link!)}
                    className={`flex items-center w-full text-left rounded px-2 py-2 gap-2 focus:outline-none ${
                      pathname === item.link
                        ? "font-bold bg-[#f0f3ff] text-[#3a57e8]"
                        : "hover:bg-[#f0f3ff] hover:text-[#3a57e8]"
                    }`}
                  >
                    <span
                      className="icon-sidebar"
                      dangerouslySetInnerHTML={{ __html: item.icon }}
                    />
                    <span className="text-sm">{item.title}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <style>{`
        .loader {
          border-top-color: #3a57e8;
          animation: spinner 1.5s linear infinite;
        }
        @keyframes spinner {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </aside>
  );
}
