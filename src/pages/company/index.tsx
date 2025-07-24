import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import API from '@/http'
import { scrapeWebsite } from '@/http/scrape/api'
import type { CompanyInfo } from '@/interfaces'
import useAuthSessionContext from '@/lib/context/AuthSessionContext'
import { Building, Check, Globe, MapPin, Shield } from 'lucide-react'
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
  const { data } = useAuthSessionContext()
  const company = data?.user?.company as CompanyInfo

  const [scrapedData, setScrapedData] = useState<ScrapedWebsite | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [contentMode, setContentMode] = useState<'embed' | 'custom'>('embed')
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null)
  const [domainName, setDomainName] = useState<string | null>(null)

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

        const response = await scrapeWebsite(websiteUrl)
        setScrapedData({
          ...response,
          domain: domainName,
        })

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
    if (websiteUrl)
      scrapeWebsite(websiteUrl)
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

  const toggleContentMode = () => {
    setContentMode((prev) => (prev === 'embed' ? 'custom' : 'embed'))
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
        <div className='fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center space-x-2'>
          <span className='text-sm text-gray-600 dark:text-gray-300 mr-2'>
            <Shield className='inline-block w-4 h-4 mr-1' />
            Embedding {scrapedData?.domain}
          </span>
          <Button
            size='sm'
            variant='outline'
            onClick={toggleContentMode}
            className='text-xs'
          >
            View Custom
          </Button>
        </div>

        {scrapedData?.header && (
          <div
            className='website-header w-full'
            dangerouslySetInnerHTML={{ __html: scrapedData.header }}
          />
        )}

        <div className='container mx-auto px-4 py-10'>
          {/* <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8'>
            <h2 className='text-2xl font-bold mb-4 dark:text-white'>
              {company?.companyName || domainName || 'Company Profile'}
            </h2>
            <div className='prose dark:prose-invert max-w-none'>
              <p>
                This is your company profile page with the website's original
                header and footer.
              </p>
              <p>
                You can customize this section with any content you want to
                display.
              </p>

              {company && (
                <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center space-x-2'>
                    <Building className='text-gray-500' />
                    <span>
                      <strong>Industry:</strong> {company.industry}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Users className='text-gray-500' />
                    <span>
                      <strong>Size:</strong> {company.companySize}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Globe className='text-gray-500' />
                    <span>
                      <strong>Website:</strong> {websiteUrl}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <MapPin className='text-gray-500' />
                    <span>
                      <strong>Location:</strong> {company.city}, {company.state}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div> */}
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
                <div>
                  <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>
                    {company?.companyName || scrapedData?.title || domainName}
                  </h1>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {scrapedData?.domain && (
                      <a
                        href={websiteUrl || `https://${scrapedData.domain}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center hover:underline'
                      >
                        <Globe className='h-3.5 w-3.5 mr-1' />
                        {scrapedData.domain}
                      </a>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant='ghost'
                onClick={toggleContentMode}
                className='text-sm'
              >
                View Embedded
              </Button>
            </div>

            <div className='prose dark:prose-invert max-w-none'>
              <h2 className='text-xl font-semibold mb-4'>Company Profile</h2>
              <p>
                This is your custom company profile view without the embedded
                header and footer.
              </p>

              {company && (
                <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
                    <h3 className='text-lg font-medium mb-2 flex items-center'>
                      <Building className='mr-2 h-5 w-5' />
                      Company Information
                    </h3>
                    <dl className='space-y-2'>
                      <div className='flex justify-between'>
                        <dt className='text-gray-500'>Industry</dt>
                        <dd className='font-medium'>{company.industry}</dd>
                      </div>
                      <div className='flex justify-between'>
                        <dt className='text-gray-500'>Size</dt>
                        <dd className='font-medium'>{company.companySize}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
                    <h3 className='text-lg font-medium mb-2 flex items-center'>
                      <MapPin className='mr-2 h-5 w-5' />
                      Location
                    </h3>
                    <address className='not-italic'>
                      {company.address}
                      <br />
                      {company.city}, {company.state} {company.zipCode}
                      <br />
                      {company.country}
                    </address>
                  </div>
                </div>
              )}

              <div className='mt-6 flex items-center space-x-1 text-sm text-gray-500'>
                <Check className='h-4 w-4 text-green-500' />
                <span>Verified company profile</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CompanyPage
