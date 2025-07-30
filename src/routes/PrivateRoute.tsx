import { LoadingScreen } from '@/components/common/LoadingScreen'
import { DashboardSidebar } from '@/components/common/navigation/dashboard/sidebar'
import type { DefaultLayoutProps } from '@/interfaces'
import useAuthSessionContext from '@/lib/context/AuthSessionContext'
import { ScrollToTop } from '@/lib/hooks/ScrollToTop'
import { SidebarInset, SidebarProvider } from '@components/ui/sidebar'

export const PrivateRoute = ({ children }: DefaultLayoutProps) => {
  const { status } = useAuthSessionContext()

  if (status === 'loading') {
    return <LoadingScreen />
  }

  return (
    <SidebarProvider>
      <ScrollToTop />
      <DashboardSidebar />
      <SidebarInset>
        <div className='md:p-3 overflow-y-auto'>
          <div className='bg-muted/50 overflow-y-auto'>{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
