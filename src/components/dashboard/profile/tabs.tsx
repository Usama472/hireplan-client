'use client'

import { cn } from '@/lib/utils'
import { Building2, User, Settings } from 'lucide-react'
import type React from 'react'

interface Tab {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const tabs: Tab[] = [
  {
    id: 'personal',
    label: 'Personal Info',
    icon: User,
  },
  {
    id: 'company',
    label: 'Company Info',
    icon: Building2,
  },
  {
    id: "settings",
    label: "Subscription & Billing",
    icon: Settings,
  },
]

interface ProfileTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
  children: React.ReactNode
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  children,
}: ProfileTabsProps) {
  return (
    <div className='w-full'>
      {/* Clean Tab Navigation */}
      <div className='border-b border-gray-200 mb-8'>
        <nav className='flex space-x-8'>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const IconComponent = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200',
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <IconComponent className='w-4 h-4' />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='relative'>{children}</div>
    </div>
  )
}
