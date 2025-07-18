import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, CheckCircle, Users, Target, TrendingUp } from 'lucide-react'
import type { JobStats } from '@/interfaces'

interface JobStatsCardsProps {
  stats: JobStats
}

export function JobStatsCards({ stats }: JobStatsCardsProps) {
  const statsData = [
    {
      label: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'blue',
    },
    {
      label: 'Active Jobs',
      value: stats.activeJobs,
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'Total Applicants',
      value: stats.totalApplicants,
      icon: Users,
      color: 'purple',
    },
    {
      label: 'Avg Matches',
      value: stats.avgMatchScore,
      icon: Target,
      color: 'orange',
    },
    {
      label: 'Fill Rate',
      value: `${stats.fillRate}%`,
      icon: TrendingUp,
      color: 'emerald',
    },
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      emerald: 'bg-emerald-100 text-emerald-600',
    }
    return (
      colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600'
    )
  }

  const getTextColor = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      emerald: 'text-emerald-600',
    }
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600'
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
      {statsData.map((stat) => (
        <Card key={stat.label} className='border-0 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>{stat.label}</p>
                <p className={`text-2xl font-bold ${getTextColor(stat.color)}`}>
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(
                  stat.color
                )}`}
              >
                <stat.icon className='w-5 h-5' />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
