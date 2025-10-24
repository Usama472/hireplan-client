import CompanyJobCard from "@/components/company/company-job-card";
import JobDetailModal from "@/components/company/job-detail-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import API from "@/http";
import type { JobFormDataWithId } from "@/interfaces";
import { Building, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

interface ScrapedWebsite {
  header: string;
  footer: string;
  title: string;
  favicon: string | null;
  mainColor: string | null;
  cssLinks: string[];
  domain?: string;
}

/**
 * Modifies the scraped header HTML to add "Careers" as the last menu item
 * and mark it as the selected/active menu item while removing active state from Home
 */
const modifyHeaderNavigation = (headerHtml: string): string => {
  try {
    let modifiedHtml = headerHtml;
    
    // Track if we've already added careers to prevent duplicates
    let careersAdded = false;
    
    // Remove active classes from any existing navigation items
    modifiedHtml = modifiedHtml.replace(/(class="[^"]*)(active|current|selected)([^"]*")/gi, '$1$3');
    modifiedHtml = modifiedHtml.replace(/aria-current="[^"]*"/gi, '');
    modifiedHtml = modifiedHtml.replace(/style="[^"]*font-weight:\s*(bold|bolder|\d+)[^"]*"/gi, '');
    
    // Find navigation patterns - be more flexible
    const navPatterns = [
      // Handle any navigation container with multiple approaches
      {
        containerPattern: /<nav[^>]*>(.*?)<\/nav>/gis,
        itemPattern: /<a[^>]*>.*?<\/a>/gi,
        isListBased: false
      },
      {
        containerPattern: /<ul[^>]*>(.*?)<\/ul>/gis,
        itemPattern: /<li[^>]*>.*?<\/li>/gi,
        isListBased: true
      },
      {
        containerPattern: /<div[^>]*class="[^"]*menu[^"]*"[^>]*>(.*?)<\/div>/gis,
        itemPattern: /<a[^>]*>.*?<\/a>/gi,
        isListBased: false
      },
      // Fallback: any container with multiple links
      {
        containerPattern: /<div[^>]*>(.*?)<\/div>/gis,
        itemPattern: /<a[^>]*>.*?<\/a>/gi,
        isListBased: false
      }
    ];
    
    // Find the navigation with the most items (likely the main navigation)
    let bestMatch: { 
      match: string; 
      content: string; 
      items: string[]; 
      pattern: { containerPattern: RegExp; itemPattern: RegExp; isListBased: boolean } | null;
    } = { match: '', content: '', items: [], pattern: null };
    
    navPatterns.forEach((pattern) => {
      const matches = modifiedHtml.match(pattern.containerPattern);
      if (matches) {
        matches.forEach(match => {
          const content = match.match(pattern.containerPattern)?.[1] || '';
          const items = content.match(pattern.itemPattern) || [];
          
          // Look for navigation that contains common menu words
          const hasNavWords = /home|about|contact|blog|services/i.test(content);
          
          if (items.length > bestMatch.items.length && hasNavWords && items.length >= 3) {
            bestMatch = { match, content, items, pattern };
          }
        });
      }
    });
    
    // If we found a good navigation, add careers to it
    if (bestMatch.pattern && bestMatch.items.length > 0 && !careersAdded) {
      const { match, content, items, pattern } = bestMatch;
      const lastItem = items[items.length - 1];
      
      let careersItem;
      if (pattern.isListBased) {
        // For list items, clone the structure and change text
        careersItem = lastItem
          .replace(/(<a[^>]*>)[^<]*(<\/a>)/gi, '$1Careers$2')
          .replace(/href="[^"]*"/gi, 'href="#careers"');
        
        // Add aria-current for active state
        careersItem = careersItem.replace(/(<a[^>]*?)>/gi, '$1 aria-current="page">');
      } else {
        // For direct anchors
        careersItem = lastItem
          .replace(/>.*?</g, '>Careers<')
          .replace(/href="[^"]*"/gi, 'href="#careers"');
        
        if (!careersItem.includes('aria-current')) {
          careersItem = careersItem.replace('<a ', '<a aria-current="page" ');
        }
      }
      
      // Detect spacing
      let separator = ' ';
      if (content.includes('</li>\n') || content.includes('</a>\n')) {
        separator = '\n    ';
      } else if (content.includes('</li> ') || content.includes('</a> ')) {
        separator = ' ';
      }
      
      // Replace the navigation with the updated version
      const newContent = content + separator + careersItem;
      modifiedHtml = modifiedHtml.replace(match, match.replace(content, newContent));
      careersAdded = true;
      
      console.log('Added Careers to navigation with', bestMatch.items.length, 'items');
    }
    
    console.log('Successfully modified navigation with Careers link');
    return modifiedHtml;
  } catch (error) {
    console.error('Error modifying header navigation:', error);
    return headerHtml;
  }
};

const CompanyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [scrapedData, setScrapedData] = useState<ScrapedWebsite | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [contentMode, _] = useState<"embed" | "custom">("embed");

  const [domainName, setDomainName] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobFormDataWithId[]>([]);

  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<JobFormDataWithId | null>(null);
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const jobsPerPage = 6;

  // Get unique locations from jobs for filtering
  const uniqueLocations = useMemo(() => {
    const jobsWithLocation = jobs.filter(
      (job) => job.jobLocation?.city && job.jobLocation?.state
    );

    const locations = jobsWithLocation.map(
      (job) => `${job.jobLocation!.city}, ${job.jobLocation!.state}`
    );
    return [...new Set(locations)].sort();
  }, [jobs]);

  // Get unique job titles
  const uniqueJobTitles = useMemo(() => {
    const titles = jobs.map((job) => job.jobBoardTitle);
    return [...new Set(titles)].sort();
  }, [jobs]);

  // Filter jobs based on title and location
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Filter by job title
    if (selectedJobTitle !== "all") {
      filtered = filtered.filter((job) => job.jobBoardTitle === selectedJobTitle);
    }

    // Filter by location
    if (selectedLocation !== "all") {
      filtered = filtered.filter((job) => {
        if (!job.jobLocation || !job.jobLocation.city || !job.jobLocation.state) {
          return false;
        }
        const jobLocation = `${job.jobLocation.city}, ${job.jobLocation.state}`;
        return jobLocation === selectedLocation;
      });
    }

    return filtered;
  }, [jobs, selectedLocation, selectedJobTitle]);

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage, jobsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedJobTitle, selectedLocation]);


  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        setLoading(true);
        if (!slug) return;

        const company = await API.company.getPublicCompany(slug as string);

        if (!company) {
          setError("Sorry! This company is not available");
          return;
        }

        const domainName = company.domainName;

        setDomainName(domainName);

        // Use scraped data if available (scraped during account setup)
        if (company.scrapedData && company.scrapedData.header) {
          console.log("Using scraped data from account setup");
          setScrapedData({
            ...company.scrapedData,
            domain: domainName,
          });

          // Apply cached styles and metadata
          if (
            company.scrapedData.cssLinks &&
            Array.isArray(company.scrapedData.cssLinks)
          ) {
            company.scrapedData.cssLinks.forEach((cssLink: string) => {
              if (!document.querySelector(`link[href="${cssLink}"]`)) {
                const linkElement = document.createElement("link");
                linkElement.rel = "stylesheet";
                linkElement.href = cssLink;
                linkElement.className = "scraped-website-styles";
                document.head.appendChild(linkElement);
              }
            });
          }

          if (company.scrapedData.favicon) {
            const existingFavicon = document.querySelector('link[rel="icon"]');
            if (existingFavicon) {
              existingFavicon.setAttribute("href", company.scrapedData.favicon);
            } else {
              const faviconLink = document.createElement("link");
              faviconLink.rel = "icon";
              faviconLink.href = company.scrapedData.favicon;
              document.head.appendChild(faviconLink);
            }
          }

          if (company.scrapedData.mainColor) {
            const metaThemeColor = document.querySelector(
              'meta[name="theme-color"]'
            );
            if (metaThemeColor) {
              metaThemeColor.setAttribute(
                "content",
                company.scrapedData.mainColor
              );
            } else {
              const themeColorMeta = document.createElement("meta");
              themeColorMeta.name = "theme-color";
              themeColorMeta.content = company.scrapedData.mainColor;
              document.head.appendChild(themeColorMeta);
            }
          }
        } else {
          console.log("No scraped data available - website was not scraped during account setup");
          // Set basic fallback data
          setScrapedData({
            header: `<header><h1>${company.companyName}</h1></header>`,
            footer: `<footer><p>&copy; ${new Date().getFullYear()} ${company.companyName}</p></footer>`,
            title: company.companyName,
            favicon: null,
            mainColor: null,
            cssLinks: [],
            domain: domainName,
          });
        }

        // Always fetch actual job postings from the database
        try {
          const jobsResponse = await API.job.getPublicJobsByCompany(slug as string);
          setJobs(jobsResponse.jobs || []);
        } catch (jobError) {
          console.error("Error fetching jobs:", jobError);
          setJobs([]);
        }
      } catch (err) {
        console.error("Error fetching website data:", err);
        setError("Failed to load website content");
      } finally {
        setLoading(false);
      }
    };

    fetchWebsiteData();

    return () => {
      const addedStyles = document.querySelectorAll(".scraped-website-styles");
      addedStyles.forEach((style) => style.remove());

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) metaThemeColor.remove();
    };
  }, [slug]);


  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="mt-4 text-lg font-medium">
          Loading website content...
        </span>
        <p className="text-gray-500 text-sm mt-2">
          This may take a few moments
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <p className="text-gray-600 mt-4">
          Please contact the company directly if you're looking for job opportunities.
        </p>
      </div>
    );
  }

  if (contentMode === "embed") {
    return (
      <>
        {scrapedData?.header && (
          <div
            className="website-header w-full"
            dangerouslySetInnerHTML={{ 
              __html: modifyHeaderNavigation(scrapedData.header)
            }}
          />
        )}
        <div className="container mx-auto px-4 py-6">
          {jobs.length > 0 && (
            <div className="mb-8">
              {/* Header */}
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Open Positions</h2>
                <p className="text-lg text-gray-600">
                  {selectedJobTitle !== "all" || selectedLocation !== "all"
                    ? `${filteredJobs.length} jobs found`
                    : `${jobs.length} total jobs available`}
                </p>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <select
                    value={selectedJobTitle}
                    onChange={(e) => setSelectedJobTitle(e.target.value)}
                    className="flex-1 h-14 px-4 text-xl font-bold text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="all">All Job Titles ({jobs.length})</option>
                    {uniqueJobTitles.map((title) => {
                      const count = jobs.filter((job) => job.jobBoardTitle === title).length;
                      return <option key={title} value={title}>{title} ({count})</option>;
                    })}
                  </select>

                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="sm:w-72 h-14 px-4 text-xl font-bold text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="all">All Locations ({jobs.length})</option>
                    {uniqueLocations.map((location) => {
                      const count = jobs.filter(
                        (job) => job.jobLocation && `${job.jobLocation.city}, ${job.jobLocation.state}` === location
                      ).length;
                      return <option key={location} value={location}>{location} ({count})</option>;
                    })}
                  </select>
                </div>

                {/* Active Filters */}
                {(selectedJobTitle !== "all" || selectedLocation !== "all") && (
                  <div className="pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">Viewing:</span>
                    {selectedJobTitle !== "all" && (
                      <span className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 h-10 rounded-lg text-lg font-bold">
                        {selectedJobTitle}
                        <button onClick={() => setSelectedJobTitle("all")} className="hover:bg-blue-700 rounded-md p-1 text-2xl leading-none font-bold">×</button>
                      </span>
                    )}
                    {selectedLocation !== "all" && (
                      <span className="inline-flex items-center gap-2 bg-green-600 text-white px-4 h-10 rounded-lg text-lg font-bold">
                        {selectedLocation}
                        <button onClick={() => setSelectedLocation("all")} className="hover:bg-green-700 rounded-md p-1 text-2xl leading-none font-bold">×</button>
                      </span>
                    )}
                    <button
                      onClick={() => { setSelectedJobTitle("all"); setSelectedLocation("all"); }}
                      className="text-lg text-blue-600 hover:text-blue-700 underline font-bold"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => {
                    setSelectedJob(job);
                    setShowJobModal(true);
                  }}
                  className="cursor-pointer"
                >
                  <CompanyJobCard job={job} />
                </div>
              ))
            ) : filteredJobs.length === 0 && (selectedJobTitle !== "all" || selectedLocation !== "all") ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 mb-4">No jobs match your filters.</p>
                <Button
                  onClick={() => {
                    setSelectedJobTitle("all");
                    setSelectedLocation("all");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No jobs available at this time.</p>
              </div>
            ) : null}
          </div>

          {/* Pagination */}
          {filteredJobs.length > jobsPerPage && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {Math.min((currentPage - 1) * jobsPerPage + 1, filteredJobs.length)}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * jobsPerPage, filteredJobs.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredJobs.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="relative inline-flex items-center rounded-l-md px-2 py-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="relative inline-flex items-center px-3 py-2 text-sm font-semibold"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="relative inline-flex items-center rounded-r-md px-2 py-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Job Detail Modal */}
        <JobDetailModal
          job={selectedJob}
          open={showJobModal}
          onOpenChange={setShowJobModal}
        />

        {scrapedData?.footer && (
          <div
            className="website-footer w-full"
            dangerouslySetInnerHTML={{ __html: scrapedData.footer }}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Card
          className="shadow-lg border-t-4 overflow-hidden"
          style={
            scrapedData?.mainColor
              ? { borderTopColor: scrapedData.mainColor }
              : {}
          }
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                {scrapedData?.favicon ? (
                  <img
                    src={scrapedData.favicon}
                    alt={`${domainName} logo`}
                    className="h-10 w-10 mr-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23888'%3E%3Cpath d='M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3z'/%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <Building className="h-10 w-10 mr-3 text-gray-500" />
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompanyPage;
