import React from 'react'

interface CompanyLayoutProps {
  children: React.ReactNode
}

const CompanyLayout: React.FC<CompanyLayoutProps> = ({ children }) => {
  return (
    <div className='flex flex-col min-h-screen'>
      {/* Main content - no header or footer */}
      <main className='flex-grow'>{children}</main>
    </div>
  )
}

export default CompanyLayout
