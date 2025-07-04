import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Play, Pause } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/layout/Layout'
import type { Video } from '../types'

const HomePage: React.FC = () => {
  const { user } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchVideos()
    }
  }, [user])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('Video')
        .select(`
          *,
          owner:User!Video_ownerId_fkey (
            id,
            username,
            walletAddress
          )
        `)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Error fetching videos:', error)
        return
      }

      setVideos(data || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleVideoPlay = (videoId: string) => {
    if (playingVideo === videoId) {
      setPlayingVideo(null)
    } else {
      setPlayingVideo(videoId)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="loading-spinner w-12 h-12"></div>
        </div>
      </Layout>
    )
  }

  if (videos.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No videos yet
          </h2>
          <p className="text-gray-600 mb-8">
            Be the first to share a video with the community!
          </p>
          <a
            href="/upload"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Upload First Video
          </a>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Video Feed
        </h1>
        
        <div className="space-y-8">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Video Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {video.owner?.username?.slice(0, 2).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {video.owner?.username || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatAddress(video.owner?.walletAddress || '')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Video Content */}
              <div className="relative bg-black aspect-video">
                <video
                  src={video.videoUrl}
                  className="w-full h-full object-cover"
                  controls={false}
                  muted
                  loop
                  ref={(el) => {
                    if (el) {
                      if (playingVideo === video.id) {
                        el.play()
                      } else {
                        el.pause()
                      }
                    }
                  }}
                />
                
                {/* Play/Pause Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => toggleVideoPlay(video.id)}
                    className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    {playingVideo === video.id ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </button>
                </div>

                {/* Video Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white font-medium text-lg mb-2">
                    {video.title}
                  </h4>
                </div>
              </div>

              {/* Video Actions */}
              <div className="p-4">
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">Like</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">Comment</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default HomePage