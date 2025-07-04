import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Upload, User, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../common/Button'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  if (!user) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary-600">
                Web3TikTok
              </h1>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive('/')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
              <Link
                to="/upload"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive('/upload')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  isActive('/profile')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user.username}</span>
              <br />
              <span className="text-xs text-gray-500">
                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
              isActive('/')
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Link>
          <Link
            to="/upload"
            className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
              isActive('/upload')
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Link>
          <Link
            to="/profile"
            className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
              isActive('/profile')
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar