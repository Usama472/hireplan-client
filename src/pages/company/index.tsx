import CompanyJobCard from '@/components/company/company-job-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import API from '@/http'
import { scrapeWebsite } from '@/http/scrape/api'
import type { Job } from '@/interfaces'
import { Building } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

interface ScrapedWebsite {
  header: string
  footer: string
  title: string
  favicon: string | null
  mainColor: string | null
  cssLinks: string[]
  domain?: string
}

const CompanyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()

  const [scrapedData, setScrapedData] = useState<ScrapedWebsite | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [contentMode, setContentMode] = useState<'embed' | 'custom'>('embed')
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null)
  const [domainName, setDomainName] = useState<string | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])

  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        setLoading(true)
        if (!slug) return

        const company = await API.company.getPublicCompany(slug as string)

        if (!company) {
          setError('Sorry! This company is not available')
          return
        }

        const websiteUrl = company.websiteUrl
        const domainName = company.domainName

        setWebsiteUrl(websiteUrl)
        setDomainName(domainName)
        setCompanyId(company.id)

        const response = await scrapeWebsite(company.id, websiteUrl)
        setScrapedData({
          ...response,
          domain: domainName,
        })

        const jobs = response?.jobs?.results || []
        setJobs(jobs)

        if (response.cssLinks && Array.isArray(response.cssLinks)) {
          response.cssLinks.forEach((cssLink: string) => {
            if (!document.querySelector(`link[href="${cssLink}"]`)) {
              const linkElement = document.createElement('link')
              linkElement.rel = 'stylesheet'
              linkElement.href = cssLink
              linkElement.className = 'scraped-website-styles'
              document.head.appendChild(linkElement)
            }
          })
        }

        if (response.favicon) {
          const existingFavicon = document.querySelector('link[rel="icon"]')
          if (existingFavicon) {
            existingFavicon.setAttribute('href', response.favicon)
          } else {
            const faviconLink = document.createElement('link')
            faviconLink.rel = 'icon'
            faviconLink.href = response.favicon
            document.head.appendChild(faviconLink)
          }
        }

        if (response.mainColor) {
          const metaThemeColor = document.querySelector(
            'meta[name="theme-color"]'
          )
          if (metaThemeColor) {
            metaThemeColor.setAttribute('content', response.mainColor)
          } else {
            const themeColorMeta = document.createElement('meta')
            themeColorMeta.name = 'theme-color'
            themeColorMeta.content = response.mainColor
            document.head.appendChild(themeColorMeta)
          }
        }
      } catch (err) {
        console.error('Error fetching website data:', err)
        setError('Failed to load website content')
      } finally {
        setLoading(false)
      }
    }

    fetchWebsiteData()

    return () => {
      const addedStyles = document.querySelectorAll('.scraped-website-styles')
      addedStyles.forEach((style) => style.remove())

      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) metaThemeColor.remove()
    }
  }, [slug])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    if (websiteUrl && companyId)
      scrapeWebsite(companyId, websiteUrl)
        .then((response) => {
          setScrapedData({
            ...response,
            domain: domainName,
          })
          setLoading(false)
        })
        .catch((err) => {
          console.error('Retry failed:', err)
          setError('Failed to load website content after retry')
          setLoading(false)
        })
  }

  if (loading) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        <span className='mt-4 text-lg font-medium'>
          Loading website content...
        </span>
        <p className='text-gray-500 text-sm mt-2'>
          This may take a few moments
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-10 text-center'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
        <Button
          onClick={handleRetry}
          className='bg-blue-500 hover:bg-blue-600 text-white'
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (contentMode === 'embed') {
    return (
      <>
        {scrapedData?.header && (
          <div
            className='website-header w-full'
            dangerouslySetInnerHTML={{ __html: scrapedData.header }}
          />
        )}
        <div className='container mx-auto px-4 py-10 m-5'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {jobs.map((job) => (
              <CompanyJobCard key={job.id} job={job} />
            ))}
          </div>
        </div>

        {scrapedData?.footer && (
          <div
            className='website-footer w-full'
            dangerouslySetInnerHTML={{ __html: scrapedData.footer }}
          />
        )}
      </>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4'>
      <div className='max-w-5xl mx-auto'>
        <Card
          className='shadow-lg border-t-4 overflow-hidden'
          style={
            scrapedData?.mainColor
              ? { borderTopColor: scrapedData.mainColor }
              : {}
          }
        >
          <div className='p-6'>
            <div className='flex justify-between items-center mb-6'>
              <div className='flex items-center'>
                {scrapedData?.favicon ? (
                  <img
                    src={scrapedData.favicon}
                    alt={`${domainName} logo`}
                    className='h-10 w-10 mr-3'
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23888'%3E%3Cpath d='M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3z'/%3E%3C/svg%3E"
                    }}
                  />
                ) : (
                  <Building className='h-10 w-10 mr-3 text-gray-500' />
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CompanyPage
