"use client";

import { useState } from "react";
import { FaHome, FaExchangeAlt, FaChartLine, FaWallet } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";

interface NavigationProps {
  className?: string;
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: FaHome,
    path: '/dashboard',
  },
  {
    id: 'pools',
    label: 'Pools',
    icon: FaChartLine,
    path: '/pools',
  },
  {
    id: 'swap',
    label: 'Swap',
    icon: FaExchangeAlt,
    path: '/swap',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: FaWallet,
    path: '/portfolio',
  },
];

export const Navigation = ({ className = "" }: NavigationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  const handleNavigation = (path: string) => {
    setActiveTab(path);
    router.push(path);
  };

  return (
    <nav className={`bottom-navigation ${className}`}>
      <div className="nav-container">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              aria-label={item.label}
            >
              <div className="nav-icon">
                <Icon />
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
