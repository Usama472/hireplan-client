import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ROUTES } from '@/constants'
import API from '@/http'
import type { Job } from '@/interfaces'
import { usePaginationQuery } from '@/lib/hooks/usePaginateQuery'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { EmptyJobsState } from './empty-jobs-state'
import { JobsGrid } from './jobs-grid'
import { JobsList } from './jobs-list'

interface JobsResponse {
  jobs: {
    results: Job[]
    limit: number
    page: number
    totalPages: number
    totalResults: number
  }
}

export default function JobsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const navigate = useNavigate()
  const {
    data: jobs,
    loading,
    pageParams,
    error,
  } = usePaginationQuery({
    key: 'queryJobs',
    limit: 10,
    fetchFun: API.job.getJobs,
    parseResponse: (data: JobsResponse) => data.jobs,
  })

  const handleJobEdit = (job: Job) => {
    console.log('Edit job:', job.id)
  }

  const handleJobDuplicate = (job: Job) => {
    console.log('Duplicate job:', job.id)
  }

  const handleJobArchive = (job: Job) => {
    console.log('Archive job:', job.id)
  }

  const handleJobDelete = (job: Job) => {
    console.log('Delete job:', job.id)
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='pt-10 pb-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header Section */}
          <div className='mb-8'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  Job Postings
                </h1>
                <p className='text-gray-600 mt-1'>
                  Manage and track your job postings and applications
                </p>
              </div>
              <Button
                onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
                className='mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700'
              >
                <Plus className='w-4 h-4 mr-2' />
                Create Job
              </Button>
            </div>

            {/* Stats Cards */}
            {/* <JobStatsCards stats={stats} /> */}
          </div>

          {/* Filters */}
          {/* <JobFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalJobs={jobs.length}
            filteredCount={filteredJobs.length}
          /> */}

          {/* Jobs Grid/List */}
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as 'grid' | 'list')}
          >
            <div className='flex items-center justify-between mb-6'>
              <div />
              <TabsList className='grid w-fit grid-cols-2'>
                <TabsTrigger value='grid'>Grid</TabsTrigger>
                <TabsTrigger value='list'>List</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value='grid' className='space-y-6'>
              {jobs.length > 0 ? (
                <JobsGrid
                  jobs={jobs}
                  onEdit={handleJobEdit}
                  onDuplicate={handleJobDuplicate}
                  onArchive={handleJobArchive}
                  onDelete={handleJobDelete}
                />
              ) : (
                <EmptyJobsState
                  onClearFilters={() => {}}
                  hasFilters={false as boolean}
                />
              )}
            </TabsContent>

            <TabsContent value='list' className='space-y-4'>
              {jobs.length > 0 ? (
                <JobsList jobs={jobs} />
              ) : (
                <EmptyJobsState
                  onClearFilters={() => {}}
                  hasFilters={false as boolean}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
