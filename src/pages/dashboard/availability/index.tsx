import DashboardHeader from '@/components/common/DashboardHeader'
import AvailabilityManager from '@/components/dashboard/availability'
import { AVAILABILITY_TEXT } from '@/constants'

export default function AvailabilityPage() {
  // Define the breadcrumb links for the header
  const links = [
    { label: 'Dashboard', href: '/dashboard/jobs', isCurrent: false },
    {
      label: AVAILABILITY_TEXT,
      href: '/dashboard/availability',
      isCurrent: true,
    },
  ]

  return (
    <div className='flex flex-col h-full'>
      <DashboardHeader links={links} />
      <div className='flex-1 p-4 md:p-6 overflow-auto'>
        <AvailabilityManager />
      </div>
    </div>
  )
}
