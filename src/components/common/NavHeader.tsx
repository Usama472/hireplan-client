'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants'
import { Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

export default function NavHeader() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  return (
    <header className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-5'>
      <div className='flex items-center px-4 gap-4'>
        {/* Search Bar */}
        <div className='flex-1 max-w-2xl'>
          <div className='relative border rounded-l-lg'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search mail...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 pr-4 h-10 shadow-none'
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center gap-2 ml-auto'>
          {/* Compose Button */}
          <Button
            size='sm'
            className='hidden sm:flex'
            onClick={() => {
              navigate(ROUTES.DASHBOARD.CREATE_JOB)
            }}
          >
            <Plus className='h-4 w-4 mr-2' />
            Compose
          </Button>
        </div>
      </div>
    </header>
  )
}
