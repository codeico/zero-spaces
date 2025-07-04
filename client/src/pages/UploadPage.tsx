import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Upload, Video, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { uploadVideo, getPublicUrl } from '../services/supabaseClient'
import { videoApi } from '../services/api'
import Layout from '../components/layout/Layout'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import type { UploadVideoData } from '../types'

const UploadPage: React.FC = () => {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UploadVideoData>()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file')
        return
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video file must be less than 100MB')
        return
      }
      
      setSelectedFile(file)
      
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const onSubmit = async (data: UploadVideoData) => {
    if (!selectedFile) {
      toast.error('Please select a video file')
      return
    }

    if (!user) {
      toast.error('You must be logged in to upload videos')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      
      // Generate unique filename
      const fileExtension = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExtension}`
      
      // Upload video to Supabase Storage
      toast.loading('Uploading video...', { id: 'upload' })
      setUploadProgress(25)
      
      const { data: uploadData, error: uploadError } = await uploadVideo(
        selectedFile,
        fileName
      )
      
      if (uploadError) {
        throw new Error(uploadError.message)
      }
      
      setUploadProgress(50)
      
      // Get public URL
      const publicUrl = getPublicUrl(uploadData.path)
      
      setUploadProgress(75)
      
      // Save metadata using Edge Function
      toast.loading('Saving video metadata...', { id: 'upload' })
      
      await videoApi.uploadMetadata(
        publicUrl,
        data.title,
        data.password
      )
      
      setUploadProgress(100)
      
      toast.success('Video uploaded successfully!', { id: 'upload' })
      
      // Reset form
      reset()
      removeFile()
      setUploadProgress(0)
      
    } catch (error: any) {
      console.error('Upload error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Upload failed'
      toast.error(errorMessage, { id: 'upload' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Upload Video
        </h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File
            </label>
            
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-lg font-medium text-gray-900 mb-2">
                    Choose video to upload
                  </span>
                  <span className="text-sm text-gray-500">
                    MP4, MOV, AVI up to 100MB
                  </span>
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Video className="w-8 h-8 text-primary-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {previewUrl && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Video Title */}
          <Input
            label="Video Title"
            placeholder="Enter a catchy title for your video"
            {...register('title', {
              required: 'Video title is required',
              minLength: {
                value: 3,
                message: 'Title must be at least 3 characters long',
              },
              maxLength: {
                value: 100,
                message: 'Title must be less than 100 characters',
              },
            })}
            error={errors.title?.message}
            helperText="Make it descriptive and engaging!"
          />

          {/* Password for Wallet Signing */}
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password to sign the video"
            {...register('password', {
              required: 'Password is required to sign the video',
            })}
            error={errors.password?.message}
            helperText="This is used to decrypt your wallet and sign the video as proof of ownership"
          />

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Uploading...
                </span>
                <span className="text-sm text-gray-500">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            loading={uploading}
            disabled={uploading || !selectedFile}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </form>

        {/* Upload Info */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            How Video Upload Works
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Your video is uploaded directly to secure cloud storage</li>
            <li>• Video metadata is signed with your Ethereum wallet</li>
            <li>• This creates cryptographic proof of ownership</li>
            <li>• Your password is used only to decrypt your wallet temporarily</li>
            <li>• Videos are processed and become available immediately</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}

export default UploadPage