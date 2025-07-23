'use client'

import type React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Camera, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

export function ProfileImageUpload() {
  const { watch, setValue } = useFormContext()
  const [isUploading, setIsUploading] = useState(false)

  const profileImg = watch('profileImg')
  const firstName = watch('firstName')

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const imageUrl = URL.createObjectURL(file)
      setValue('profileImg', imageUrl, { shouldDirty: true })
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setValue('profileImg', '', { shouldDirty: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Upload a profile picture to personalize your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center gap-6'>
          <div className='relative'>
            <Avatar className='h-24 w-24 ring-4 ring-gray-100'>
              <AvatarImage src={profileImg || '/placeholder.svg'} />
              <AvatarFallback className='text-2xl font-bold'>
                {firstName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className='absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg border'>
              <Camera className='h-4 w-4 text-gray-600' />
            </div>
          </div>

          <div className='flex-1 space-y-3'>
            <div>
              <h4 className='font-medium text-gray-900'>Profile Photo</h4>
              <p className='text-sm text-gray-600'>
                JPG, PNG or GIF. Max size 2MB. Recommended 400x400px.
              </p>
            </div>

            <div className='flex gap-3'>
              <Button
                type='button'
                variant='outline'
                //disabled={isUploading}
                disabled
                className='relative overflow-hidden bg-transparent'
              >
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                />
                <Upload className='h-4 w-4 mr-2' />
                {isUploading ? 'Uploading...' : 'Upload Photo'}
              </Button>
              <p className='text-[12px] text-gray-400 mt-1'>
                This feature is not available yet
              </p>

              {profileImg && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleRemoveImage}
                  className='text-red-600 hover:text-red-700 bg-transparent'
                >
                  <X className='h-4 w-4 mr-2' />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
