import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import type { FC } from 'react'

type BreadcrumbLinkType = {
  href?: string
  label: string
  isCurrent?: boolean
}

interface DashboardHeaderProps {
  links: BreadcrumbLinkType[]
}

const DashboardHeader: FC<DashboardHeaderProps> = ({ links }) => {
  return (
    <header className='flex shrink-0 items-center gap-2'>
      <div className='flex items-center gap-2 px-4'>
        <Breadcrumb>
          <BreadcrumbList>
            {links.map((link, idx) => (
              <div key={idx} className='flex items-center'>
                <BreadcrumbItem
                  className={idx !== links.length - 1 ? 'hidden md:block' : ''}
                >
                  {link.isCurrent ? (
                    <BreadcrumbPage>{link.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={link.href}
                      className='hover:text-primary'
                    >
                      {link.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {idx !== links.length - 1 && (
                  <BreadcrumbSeparator className='hidden md:block' />
                )}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}

export default DashboardHeader
