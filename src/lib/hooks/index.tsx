'use client'

import { useState, useMemo } from 'react'
import type { Job, JobFilters, JobStats } from '@/interfaces'

export function useJobFilters(jobs: Job[]) {
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    status: [],
    type: [],
    experience: [],
    location: '',
    department: [],
    priority: [],
    dateRange: '',
  })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      const matchesSearch =
        !filters.search ||
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.skills.some((skill) =>
          skill.toLowerCase().includes(filters.search.toLowerCase())
        )

      const matchesStatus =
        filters.status.length === 0 || filters.status.includes(job.status)
      const matchesType =
        filters.type.length === 0 || filters.type.includes(job.type)
      const matchesExperience =
        filters.experience.length === 0 ||
        filters.experience.includes(job.experience)
      const matchesLocation =
        !filters.location ||
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      const matchesDepartment =
        filters.department.length === 0 ||
        filters.department.includes(job.department)
      const matchesPriority =
        filters.priority.length === 0 || filters.priority.includes(job.priority)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesExperience &&
        matchesLocation &&
        matchesDepartment &&
        matchesPriority
      )
    })

    // Sort jobs
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Job]
      let bValue: any = b[sortBy as keyof Job]

      if (
        sortBy === 'createdAt' ||
        sortBy === 'updatedAt' ||
        sortBy === 'deadline'
      ) {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [jobs, filters, sortBy, sortOrder])

  const stats: JobStats = useMemo(() => {
    const totalJobs = jobs.length
    const activeJobs = jobs.filter((job) => job.status === 'active').length
    const totalApplicants = jobs.reduce((sum, job) => sum + job.applicants, 0)
    const avgMatchScore =
      jobs.reduce((sum, job) => sum + job.matches, 0) / jobs.length
    const fillRate =
      (jobs.filter((job) => job.status === 'closed').length / totalJobs) * 100

    return {
      totalJobs,
      activeJobs,
      totalApplicants,
      avgMatchScore: Math.round(avgMatchScore),
      fillRate: Math.round(fillRate),
    }
  }, [jobs])

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      type: [],
      experience: [],
      location: '',
      department: [],
      priority: [],
      dateRange: '',
    })
  }

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search ||
      filters.status.length > 0 ||
      filters.type.length > 0 ||
      filters.experience.length > 0 ||
      filters.location ||
      filters.department.length > 0 ||
      filters.priority.length > 0 ||
      filters.dateRange
    )
  }, [filters])

  return {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredJobs,
    stats,
    clearFilters,
    hasActiveFilters,
  }
}
