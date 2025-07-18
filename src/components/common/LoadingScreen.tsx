import React from 'react'

export const LoadingScreen: React.FC = () => {
  return (
    <div className='flex items-center justify-center h-screen bg-white'>
      <div className='flex flex-col items-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4'></div>
        <p className='text-gray-600'>Loading...</p>
      </div>
    </div>
  )
}
