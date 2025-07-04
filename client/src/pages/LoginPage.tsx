import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import type { LoginData } from '../types'

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>()

  const onSubmit = async (data: LoginData) => {
    try {
      await login(data)
    } catch (error) {
      // Error handling is done in useAuth hook
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your Web3TikTok account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
              })}
              error={errors.password?.message}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="show-password"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <label htmlFor="show-password" className="ml-2 block text-sm text-gray-900">
                  Show password
                </label>
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              size="lg"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Create one here
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-900 mb-2">
              Secure Web3 Authentication
            </h3>
            <p className="text-sm text-green-800">
              Your login credentials are used to decrypt your Ethereum wallet, 
              ensuring only you can access your digital assets and sign transactions.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage