"use client";

import { useState, useEffect } from "react";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showAvatar?: boolean;
}

export const PageHeader = ({ title, subtitle, showAvatar = true }: PageHeaderProps) => {
  const { user, logout, refreshUser } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Refresh user data when component mounts
    if (user) {
      refreshUser();
    }
  }, [user, refreshUser]);

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

  const handleSignOut = () => {
    logout();
    setShowUserMenu(false);
    // Don't redirect here - let the AuthContext handle it
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const resetImageError = () => {
    setImageError(false);
  };

  // Reset image error when user changes
  useEffect(() => {
    resetImageError();
  }, [user?.profilePictureUrl]);

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
                {user.profilePictureUrl && !imageError ? (
                  <Image 
                    src={user.profilePictureUrl} 
                    alt="Profile" 
                    width={40}
                    height={40}
                    className="avatar-image"
                    onError={handleImageError}
                  />
                ) : (
                  <FaUserCircle className="avatar-icon" />
                )}
              </div>
              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <div className="user-info">
                      <div className="user-avatar-menu">
                        {user.profilePictureUrl && !imageError ? (
                          <Image 
                            src={user.profilePictureUrl} 
                            alt="Profile" 
                            width={32}
                            height={32}
                            className="avatar-image-small"
                            onError={handleImageError}
                          />
                        ) : (
                          <FaUserCircle className="avatar-icon-small" />
                        )}
                      </div>
                      <div className="user-details">
                        <div className="user-name">
                          {user.username || "Anonymous User"}
                        </div>
                        <div className="user-address">
                          {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                        </div>
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
