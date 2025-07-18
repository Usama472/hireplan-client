import type { JobCreationData } from '@/interfaces'
import { get, post } from '../apiHelper'

export const createJob = async (job: JobCreationData) => post('/jobs', job)
export const getJobs = async ({
  page,
  limit,
  searchQuery,
}: {
  page: number
  limit: number
  searchQuery?: string
}) => get('/jobs', { page, limit, searchQuery })
