'use client'

import { APP_NAME } from '@/constants'
import { cn } from '@/lib/utils'
import type React from 'react'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  message?: string
  showProgress?: boolean
  className?: string
}

/**
 * SimpleLoader - A classic, elegant loading component
 * Can be used independently in places where a stylish loading indicator is needed
 */
export const SimpleLoader: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'gray'
  className?: string
}> = ({ color = 'primary', className }) => {
  return (
    <div
      className={cn(
        'fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-background',
        className
      )}
    >
      <div className='flex flex-col items-center gap-4'>
        <div className='relative w-16 h-16'>
          <div
            className={cn('absolute w-full h-full rounded-full opacity-75', {
              'border-t-4 border-blue-500': color === 'primary',
              'border-t-4 border-purple-500': color === 'secondary',
              'border-t-4 border-gray-500': color === 'gray',
            })}
            style={{ animation: 'spin 1s linear infinite' }}
          />
          <div
            className={cn('absolute w-full h-full rounded-full opacity-75', {
              'border-r-4 border-blue-300': color === 'primary',
              'border-r-4 border-purple-300': color === 'secondary',
              'border-r-4 border-gray-300': color === 'gray',
            })}
            style={{ animation: 'spin 1.5s linear infinite' }}
          />
          <div
            className={cn('absolute w-full h-full rounded-full opacity-75', {
              'border-b-4 border-blue-400': color === 'primary',
              'border-b-4 border-purple-400': color === 'secondary',
              'border-b-4 border-gray-400': color === 'gray',
            })}
            style={{ animation: 'spin 2s linear infinite' }}
          />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `,
        }}
      />
    </div>
  )
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading your workspace...',
  showProgress = true,
  className,
}) => {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(message)

  const loadingMessages = [
    'Initializing application...',
    'Loading your workspace...',
    'Setting up your environment...',
    'Almost ready...',
  ]

  useEffect(() => {
    if (!showProgress) return

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + Math.random() * 15
      })
    }, 200)

    const messageInterval = setInterval(() => {
      setCurrentMessage(
        loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
      )
    }, 2000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(messageInterval)
    }
  }, [showProgress])

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50/30',
        className
      )}
    >
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-[0.02]'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className='relative flex flex-col items-center space-y-8 p-8'>
        {/* Logo/Brand Section */}
        <div className='flex items-center space-x-3 mb-4'>
          <div className='relative'>
            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center'>
              <div className='w-6 h-6 bg-white rounded-md opacity-90' />
            </div>
            <div className='absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>
              {APP_NAME}
            </h1>
            <p className='text-sm text-gray-500'>Professional Platform</p>
          </div>
        </div>

        {/* Main Loading Animation */}
        <div className='relative'>
          {/* Outer Ring */}
          <div className='w-20 h-20 rounded-full border-4 border-gray-200 relative'>
            {/* Animated Ring */}
            <div className='absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin' />

            {/* Inner Pulsing Dot */}
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-3 h-3 bg-blue-500 rounded-full animate-pulse' />
            </div>
          </div>

          {/* Floating Dots */}
          <div className='absolute -inset-8'>
            <div
              className='absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-bounce'
              style={{ animationDelay: '0s' }}
            />
            <div
              className='absolute top-1/2 right-0 w-2 h-2 bg-purple-400 rounded-full animate-bounce'
              style={{ animationDelay: '0.2s' }}
            />
            <div
              className='absolute bottom-0 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-bounce'
              style={{ animationDelay: '0.4s' }}
            />
            <div
              className='absolute top-1/2 left-0 w-2 h-2 bg-orange-400 rounded-full animate-bounce'
              style={{ animationDelay: '0.6s' }}
            />
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className='w-64 space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-medium text-gray-700'>
                Loading Progress
              </span>
              <span className='text-sm text-gray-500'>
                {Math.round(progress)}%
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
              <div
                className='h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out relative'
                style={{ width: `${progress}%` }}
              >
                <div className='absolute inset-0 bg-white/20 animate-pulse rounded-full' />
              </div>
            </div>
          </div>
        )}

        {/* Loading Message */}
        <div className='text-center space-y-2 max-w-sm'>
          <p className='text-lg font-medium text-gray-800 transition-all duration-500'>
            {currentMessage}
          </p>
          <p className='text-sm text-gray-500'>
            Please wait while we prepare everything for you
          </p>
        </div>

        {/* Loading Steps Indicator */}
        <div className='flex items-center space-x-2'>
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                progress > (step - 1) * 25
                  ? 'bg-blue-500 scale-110'
                  : 'bg-gray-300'
              )}
            />
          ))}
        </div>

        {/* Subtle Animation Elements */}
        <div className='absolute inset-0 pointer-events-none'>
          <div
            className='absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full animate-pulse'
            style={{ animationDuration: '3s' }}
          />
          <div
            className='absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/5 rounded-full animate-pulse'
            style={{ animationDuration: '4s', animationDelay: '1s' }}
          />
        </div>
      </div>

      {/* Bottom Branding */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2'>
        <div className='flex items-center space-x-2 text-xs text-gray-400'>
          <div className='w-1 h-1 bg-gray-400 rounded-full animate-pulse' />
          <span>{`Powered by ${APP_NAME}`}</span>
          <div className='w-1 h-1 bg-gray-400 rounded-full animate-pulse' />
        </div>
      </div>
    </div>
  )
}

// Alternative Minimal Version
export const MinimalLoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  className,
}) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-white',
        className
      )}
    >
      <div className='flex flex-col items-center space-y-6'>
        {/* Sophisticated Spinner */}
        <div className='relative w-16 h-16'>
          <div className='absolute inset-0 rounded-full border-4 border-gray-200' />
          <div className='absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin' />
          <div
            className='absolute inset-2 rounded-full border-2 border-transparent border-t-blue-300 animate-spin'
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          />
        </div>

        {/* Message */}
        <div className='text-center'>
          <p className='text-lg font-medium text-gray-800 mb-1'>{message}</p>
          <p className='text-sm text-gray-500'>This won't take long</p>
        </div>
      </div>
    </div>
  )
}

// Skeleton Loading Version
export const SkeletonLoadingScreen: React.FC = () => {
  return (
    <div className='fixed inset-0 z-50 bg-white'>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        {/* Header Skeleton */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div className='space-y-2'>
              <div className='h-8 bg-gray-200 rounded-lg w-64 animate-pulse' />
              <div className='h-4 bg-gray-200 rounded w-48 animate-pulse' />
            </div>
            <div className='h-10 bg-gray-200 rounded-lg w-32 animate-pulse' />
          </div>

          {/* Profile Card Skeleton */}
          <div className='bg-gray-50 rounded-xl p-6 border'>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 bg-gray-200 rounded-full animate-pulse' />
              <div className='flex-1 space-y-2'>
                <div className='h-6 bg-gray-200 rounded w-48 animate-pulse' />
                <div className='h-4 bg-gray-200 rounded w-64 animate-pulse' />
                <div className='flex gap-2'>
                  <div className='h-6 bg-gray-200 rounded-full w-20 animate-pulse' />
                  <div className='h-6 bg-gray-200 rounded-full w-24 animate-pulse' />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className='space-y-6'>
          <div className='flex space-x-1 bg-gray-100 rounded-lg p-1'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='h-10 bg-gray-200 rounded-md flex-1 animate-pulse'
              />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className='space-y-6'>
            <div className='bg-white rounded-lg border p-6'>
              <div className='space-y-4'>
                <div className='h-6 bg-gray-200 rounded w-48 animate-pulse' />
                <div className='grid grid-cols-2 gap-4'>
                  <div className='h-10 bg-gray-200 rounded animate-pulse' />
                  <div className='h-10 bg-gray-200 rounded animate-pulse' />
                </div>
                <div className='h-10 bg-gray-200 rounded animate-pulse' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
