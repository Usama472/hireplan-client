'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CreditCard } from 'lucide-react'
import { PlanSelection } from './plan-selection'

export function AccountSettingsForm() {
  return (
    <div className='space-y-8'>
      <Card className='border-0 shadow-lg shadow-gray-100/50'>
        <CardHeader className='pb-6'>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <div className='p-2 bg-blue-50 rounded-lg'>
              <CreditCard className='h-5 w-5 text-blue-600' />
            </div>
            Subscription Plan
          </CardTitle>
          <CardDescription className='text-base'>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanSelection />
        </CardContent>
      </Card>
    </div>
  )
}
