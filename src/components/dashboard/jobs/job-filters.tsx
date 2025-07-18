'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Filter } from 'lucide-react'
import { JOB_STATUS, JOB_TYPES } from '@/constants'
import type { JobFilters } from '@/interfaces'

interface JobFiltersProps {
  filters: JobFilters
  onFiltersChange: (filters: JobFilters) => void
  sortBy: string
  onSortChange: (sortBy: string) => void
  totalJobs: number
  filteredCount: number
}

export function JobFiltersComponent({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  totalJobs,
  filteredCount,
}: JobFiltersProps) {
  const updateFilter = (key: keyof JobFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (key: keyof JobFilters, value: string) => {
    const currentArray = filters[key] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]
    updateFilter(key, newArray)
  }

  return (
    <Card className='border-0 shadow-sm mb-8'>
      <CardContent className='p-6'>
        <div className='flex flex-col lg:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <Input
                placeholder='Search jobs, companies, or skills...'
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          {/* Filters */}
          <div className='flex flex-wrap gap-2'>
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Filter className='w-4 h-4 mr-2' />
                  Status
                  {filters.status.length > 0 && (
                    <Badge
                      variant='secondary'
                      className='ml-2 px-1 py-0 text-xs'
                    >
                      {filters.status.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuLabel>Job Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {JOB_STATUS.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status.value}
                    checked={filters.status.includes(status.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter('status', status.value)
                    }
                  >
                    {status.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm'>
                  Job Type
                  {filters.type.length > 0 && (
                    <Badge
                      variant='secondary'
                      className='ml-2 px-1 py-0 text-xs'
                    >
                      {filters.type.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuLabel>Employment Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {JOB_TYPES.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={filters.type.includes(type.value)}
                    onCheckedChange={() =>
                      toggleArrayFilter('type', type.value)
                    }
                  >
                    {type.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='createdAt'>Created Date</SelectItem>
                <SelectItem value='updatedAt'>Updated Date</SelectItem>
                <SelectItem value='deadline'>Deadline</SelectItem>
                <SelectItem value='applicants'>Applicants</SelectItem>
                <SelectItem value='matches'>Matches</SelectItem>
                <SelectItem value='title'>Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className='mt-4 text-sm text-gray-600'>
          Showing {filteredCount} of {totalJobs} jobs
        </div>
      </CardContent>
    </Card>
  )
}
