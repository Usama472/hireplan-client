import { Frame, LifeBuoy, PieChart, Send, Terminal } from 'lucide-react'
import type * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { ROUTES } from '@/constants'
import { useNavigate } from 'react-router-dom'
import { NavProjects } from './nav-projects'
import { NavSecondary } from './nav-secondary'
import { NavUser } from './nav-user'

const data = {
  user: {
    name: 'usama',
    email: 'usamakla1122@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send,
    },
  ],
  projects: [
    {
      name: 'All Jobs',
      url: ROUTES.DASHBOARD.MAIN,
      icon: Frame,
    },
    {
      name: 'Create Job',
      url: ROUTES.DASHBOARD.CREATE_JOB,
      icon: PieChart,
    },
  ],
}

export const DashboardSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const navigate = useNavigate()
  return (
    <Sidebar
      variant='inset'
      {...props}
      collapsible='icon'
      className='bg-gray-200'
    >
      <SidebarHeader className='bg-gray-200'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <div onClick={() => navigate('/')} className='cursor-pointer'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <Terminal className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>HirePlan</span>
                  <span className='truncate text-xs'>Enterprise</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='bg-gray-200'>
        <NavProjects name='Jobs' projects={data.projects} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter className='bg-primary rounded-lg'>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
