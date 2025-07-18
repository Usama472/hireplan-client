import { JobListItem } from './job-list-item'
import type { Job } from '@/interfaces'

interface JobsListProps {
  jobs: Job[]
}

export function JobsList({ jobs }: JobsListProps) {
  return (
    <div className='space-y-4'>
      {jobs.map((job) => (
        <JobListItem key={job.id} job={job} />
      ))}
    </div>
  )
}
