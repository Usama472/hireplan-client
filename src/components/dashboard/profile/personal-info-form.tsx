'use client'

import { InputField } from '@/components/common/InputField'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { INPUT_TYPES } from '@/interfaces'
import { User } from 'lucide-react'

export function PersonalInfoForm() {
  return (
    <Card className='border-0 shadow-lg shadow-gray-100/50'>
      <CardHeader className='pb-4 sm:pb-6 px-4 sm:px-6'>
        <CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
          <div className='p-2 bg-blue-50 rounded-lg flex-shrink-0'>
            <User className='h-4 sm:h-5 w-4 sm:w-5 text-blue-600' />
          </div>
          <span className='truncate'>Personal Information</span>
        </CardTitle>
        <CardDescription className='text-sm sm:text-base'>
          Update your personal details and contact information
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 sm:space-y-6 px-4 sm:px-6'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
          <InputField
            name='firstName'
            type={INPUT_TYPES.TEXT}
            placeholder='Enter first name'
            label='First Name'
          />
          <InputField
            name='lastName'
            type={INPUT_TYPES.TEXT}
            placeholder='Enter last name'
            label='Last Name'
          />
        </div>

        <InputField
          name='email'
          type={INPUT_TYPES.EMAIL}
          placeholder='Enter email address'
          label='Email Address'
          disabled
        />

        <InputField
          name='companyRole'
          type={INPUT_TYPES.TEXT}
          placeholder='Enter your role'
          label='Company Role'
        />
      </CardContent>
    </Card>
  )
}
