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
import { SubscriptionManager } from '../subscription/subscription-manager'
import useAuthSessionContext from '@/lib/context/AuthSessionContext'

export function AccountSettingsForm() {
  const { data: session } = useAuthSessionContext()
  
  return (
    <div className='space-y-8'>
      <Card className='border-0 shadow-lg shadow-gray-100/50'>
        <CardHeader className='pb-6'>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <div className='p-2 bg-blue-50 rounded-lg'>
              <CreditCard className='h-5 w-5 text-blue-600' />
            </div>
            Subscription & Billing
          </CardTitle>
          <CardDescription className='text-base'>
            Manage your subscription, billing, and payment methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session?.user?._id ? (
            <SubscriptionManager userId={session.user._id} />
          ) : (
            <PlanSelection />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
