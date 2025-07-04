import React, { useState, useEffect } from 'react'
import { Wallet, Video, Calendar, Settings } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabaseClient'
import Layout from '../components/layout/Layout'
import Button from '../components/common/Button'
import type { Video as VideoType } from '../types'

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const [userVideos, setUserVideos] = useState<VideoType[]>([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    joinedDate: '',
  })

  useEffect(() => {
    if (user) {
      fetchUserVideos()
      fetchUserStats()
    }
  }, [user])

  const fetchUserVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('Video')
        .select('*')
        .eq('ownerId', user?.id)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Error fetching user videos:', error)
        return
      }

      setUserVideos(data || [])
    } catch (error) {
      console.error('Error fetching user videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true)
      const { data, error } = await supabase
        .from('Video')
        .select('id')
        .eq('ownerId', user?.id)

      if (error) {
        console.error('Error fetching stats:', error)
        return
      }

      setStats({
        totalVideos: data?.length || 0,
        totalViews: 0, // This would be calculated from a views table in a real app
        joinedDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please login to view your profile
          </h2>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {user.username.slice(0, 2).toUpperCase()}
                </span>
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.username}
                </h1>
                <p className="text-gray-600 mb-2">
                  {user.email}
                </p>
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-gray-500" />
                  <button
                    onClick={() => copyToClipboard(user.walletAddress)}
                    className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                    title="Click to copy wallet address"
                  >
                    {formatAddress(user.walletAddress)}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Settings Button */}
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Video className="w-8 h-8 text-primary-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats.totalVideos}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold">👁</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats.totalViews}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats.joinedDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Videos */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Your Videos
            </h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner w-8 h-8"></div>
            </div>
          ) : userVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No videos yet
              </h3>
              <p className="text-gray-600 mb-6">
                Upload your first video to get started!
              </p>
              <Button size="lg">
                <a href="/upload" className="flex items-center">
                  Upload Video
                </a>
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userVideos.map((video) => (
                  <div key={video.id} className="group relative">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <video
                        src={video.videoUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    </div>
                    <div className="mt-3">
                      <h3 className="font-medium text-gray-900 truncate">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wallet Info */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Your Web3 Wallet
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Wallet Address</p>
              <p className="font-mono text-sm text-gray-900">
                {user.walletAddress}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Network</p>
              <p className="text-sm text-gray-900">
                Ethereum (Your videos are cryptographically signed)
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProfilePage