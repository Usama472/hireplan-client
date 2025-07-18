import type React from 'react'

import { Button } from '@components/ui/button'
import { Separator } from '@components/ui/separator'
import { APP_NAME, GithubIcon, GoogleIcon, ROUTES } from '@constants/index'
import { cn } from '@lib/utils'
import { useNavigate } from 'react-router'

interface AuthWrapperProps {
  children: React.ReactNode
  title: string
  footerText: string
  footerLinkText: string
  footerLinkHref: string
  showSocial?: boolean
  isLoading?: boolean
}

export const AuthLayout = ({
  children,
  title,
  footerText,
  footerLinkText,
  footerLinkHref,
  showSocial = true,
  isLoading = false,
}: AuthWrapperProps) => {
  const navigate = useNavigate()
  return (
    <div>
      <div
        className='absolute top-4 left-5 text-xl font-bold tracking-tight text-primary cursor-pointer'
        onClick={() => navigate(ROUTES.HOME)}
      >
        {APP_NAME}
      </div>

      <div className='mx-auto w-full max-w-[400px] overflow-hidden rounded-xl transition-all flex items-center justify-center min-h-dvh'>
        <div className='w-full md:border pt-8 rounded-md bg-white dark:bg-background'>
          <div className='flex flex-col items-center justify-center space-y-2 px-6'>
            <h1 className='text-2xl font-bold'>{title}</h1>
          </div>
          <div className='p-6'>
            {children}

            {showSocial && (
              <div className='mt-6'>
                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <Separator className='w-full' />
                  </div>
                  <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-background px-2 text-muted-foreground'>
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className='mt-6 grid grid-cols-2 gap-4'>
                  <Button
                    variant='outline'
                    type='button'
                    disabled={isLoading}
                    onClick={() => navigate(ROUTES.DASHBOARD.MAIN)}
                  >
                    <GoogleIcon />
                    Google
                  </Button>
                  <Button variant='outline' type='button' disabled={isLoading}>
                    <GithubIcon />
                    GitHub
                  </Button>
                </div>
              </div>
            )}

            <div className='mt-6 text-center text-sm text-muted-foreground'>
              {footerText}{' '}
              <Button
                variant='link'
                onClick={() => navigate(footerLinkHref)}
                className='font-medium text-primary underline-offset-4 hover:underline px-2'
              >
                {footerLinkText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CompanyLogo() {
  return (
    <div
      className={cn(
        'flex h-12 w-12 items-center justify-center rounded-full',
        'bg-primary text-primary-foreground'
      )}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='h-6 w-6'
      >
        <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
      </svg>
    </div>
  )
}
