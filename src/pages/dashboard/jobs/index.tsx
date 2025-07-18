import AllJobs from '@/components/dashboard/jobs'

export default function DashboardPage() {
  return (
    <div className='h-screen bg-background flex flex-col'>
      <div className='flex-1'>
        <AllJobs />
      </div>
    </div>
  )
}
