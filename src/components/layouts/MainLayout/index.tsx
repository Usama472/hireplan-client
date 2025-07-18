import type { FC } from 'react'
import { Navbar } from '@/components/Navigation/main/navbar'
import type { DefaultLayoutProps } from '@interfaces/index'
import { Particles } from '@/components/effects/background/Particles'
import { useTheme } from '@/lib/hooks/useTheme'

export const MainLayout: FC<DefaultLayoutProps> = ({ children }) => {
  const { mode } = useTheme()
  return (
    <div className='relative'>
      <Particles
        quantity={50}
        color={mode === 'dark' ? '#ffffff' : 'oklch(0.205 0 0)'}
      />
      <div className='flex flex-col max-h-screen w-full absolute top-0 left-0 z-0 overflow-auto'>
        <Navbar />

        <div className='container mx-auto w-full'>{children}</div>
      </div>
    </div>
  )
}
