import CompanyJobCard from "@/components/company/company-job-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import API from "@/http";
import type { JobFormDataWithId } from "@/interfaces";
import { Building, MapPin, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  // Filter jobs based on search query and selected location
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((job) => {
        const searchTerm = searchQuery.toLowerCase();
        return (
          job.jobBoardTitle.toLowerCase().includes(searchTerm) ||
          job.jobDescription.toLowerCase().includes(searchTerm) ||
          job.employmentType?.toLowerCase().includes(searchTerm) ||
          job.workplaceType?.toLowerCase().includes(searchTerm) ||
          (job.requiredQualifications && 
            job.requiredQualifications.some(qual => 
              qual.text.toLowerCase().includes(searchTerm)
            )) ||
          (job.preferredQualifications && 
            job.preferredQualifications.some(qual => 
              qual.text.toLowerCase().includes(searchTerm)
            )) ||
          (job.jobRequirements && 
            job.jobRequirements.some(req => 
              req.toLowerCase().includes(searchTerm)
            ))
        );
      });
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
  }, [jobs, selectedLocation, searchQuery]);

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
  }, [searchQuery, selectedLocation]);


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
          {/* Search and Filters */}
          {jobs.length > 0 && (
            <div className="mb-8">
              {/* Header Section */}
              <div className="mb-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Open Positions
                  </h2>
                  <p className="text-lg text-gray-600">
                    {searchQuery.trim() || selectedLocation !== "all"
                      ? `${filteredJobs.length} jobs found`
                      : `${jobs.length} total jobs available`}
                  </p>
                </div>
              </div>

              {/* Enhanced Search and Filter Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Bar */}
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Search Jobs
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        placeholder="Search by title, description, skills, or requirements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div className="lg:w-80">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Filter by Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <Select
                        value={selectedLocation}
                        onValueChange={setSelectedLocation}
                      >
                        <SelectTrigger className="pl-12 h-14 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50 focus:bg-white">
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                          <SelectItem value="all" className="text-base py-3 px-4 rounded-lg">
                            <div className="flex items-center justify-between w-full">
                              <span>All locations</span>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
                                {jobs.length}
                              </span>
                            </div>
                          </SelectItem>
                          {uniqueLocations.map((location) => {
                            const jobCount = jobs.filter(
                              (job) =>
                                job.jobLocation &&
                                `${job.jobLocation.city}, ${job.jobLocation.state}` ===
                                  location
                            ).length;
                            return (
                              <SelectItem key={location} value={location} className="text-base py-3 px-4 rounded-lg">
                                <div className="flex items-center justify-between w-full">
                                  <span>{location}</span>
                                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2">
                                    {jobCount}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(searchQuery.trim() || selectedLocation !== "all") && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Active filters:</span>
                      
                      {searchQuery.trim() && (
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                          <Search className="h-3 w-3" />
                          <span>"{searchQuery}"</span>
                          <button
                            onClick={() => setSearchQuery("")}
                            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                      
                      {selectedLocation !== "all" && (
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                          <MapPin className="h-3 w-3" />
                          <span>{selectedLocation}</span>
                          <button
                            onClick={() => setSelectedLocation("all")}
                            className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedLocation("all");
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 underline ml-2"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job) => (
                <CompanyJobCard key={job.id} job={job} />
              ))
            ) : filteredJobs.length === 0 && (searchQuery.trim() || selectedLocation !== "all") ? (
              <div className="col-span-full">
                <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                  <div className="text-center py-12 px-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-sm mx-auto text-sm">
                      {searchQuery.trim() 
                        ? `No jobs match "${searchQuery}"`
                        : `No jobs found in ${selectedLocation}`}
                      . Try adjusting your search or filters.
                    </p>
                    <div className="flex gap-2 justify-center">
                      {searchQuery.trim() && (
                        <Button
                          onClick={() => setSearchQuery("")}
                          variant="outline"
                          size="sm"
                        >
                          Clear Search
                        </Button>
                      )}
                      {selectedLocation !== "all" && (
                        <Button
                          onClick={() => setSelectedLocation("all")}
                          variant="outline"
                          size="sm"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          View All Jobs
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
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
