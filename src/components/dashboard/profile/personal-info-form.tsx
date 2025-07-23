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
      <CardHeader className='pb-6'>
        <CardTitle className='flex items-center gap-2 text-xl'>
          <div className='p-2 bg-blue-50 rounded-lg'>
            <User className='h-5 w-5 text-blue-600' />
          </div>
          Personal Information
        </CardTitle>
        <CardDescription className='text-base'>
          Update your personal details and contact information
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
