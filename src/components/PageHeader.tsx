"use client";

import { useState, useEffect } from "react";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { MiniKit } from "@worldcoin/minikit-js";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
  walletAddress: string;
  username?: string;
  profilePictureUrl?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showAvatar?: boolean;
}

export const PageHeader = ({ title, subtitle, showAvatar = true }: PageHeaderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('pool_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Fetch username from MiniKit if not already available
      if (!userData.username && userData.walletAddress) {
        fetchUserInfo(userData.walletAddress);
      }
    }
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const fetchUserInfo = async (walletAddress: string) => {
    try {
      if (MiniKit.isInstalled()) {
        const userInfo = await MiniKit.getUserByAddress(walletAddress);
        if (userInfo) {
          const updatedUser = {
            walletAddress,
            username: userInfo.username,
            profilePictureUrl: userInfo.profilePictureUrl,
          };
          setUser(updatedUser);
          localStorage.setItem('pool_user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('pool_user');
    setShowUserMenu(false);
    router.push('/');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="page-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {showAvatar && user && (
          <div className="header-right">
            <div className="user-menu-container">
              <div className="user-avatar-small" onClick={toggleUserMenu}>
                {user.profilePictureUrl ? (
                  <Image 
                    src={user.profilePictureUrl} 
                    alt="Profile" 
                    width={40}
                    height={40}
                    className="avatar-image"
                  />
                ) : (
                  <FaUser className="avatar-icon" />
                )}
              </div>
              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <div className="user-info">
                      <div className="user-name">
                        {user.username || "Anonymous User"}
                      </div>
                      <div className="user-address">
                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <div className="user-menu-actions">
                    <button className="menu-action" onClick={handleSignOut}>
                      <FaSignOutAlt className="action-icon" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
