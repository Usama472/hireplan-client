import React from 'react'
import { useParams } from 'react-router-dom'

const CompanyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()

  // Using slug to avoid linter error
  React.useEffect(() => {
    console.log('Company slug:', slug)
  }, [slug])

  return (
    <div className='mx-auto'>
      Company Page
      {/* Empty content as per request */}
    </div>
  )
}

export default CompanyPage
