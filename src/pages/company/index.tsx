import CompanyJobCard from "@/components/company/company-job-card";
import JobDetailModal from "@/components/company/job-detail-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import API from "@/http";
import type { JobFormDataWithId } from "@/interfaces";
import {
  Building,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  Briefcase,
  MapPin,
} from "lucide-react";
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
    modifiedHtml = modifiedHtml.replace(
      /(class="[^"]*)(active|current|selected)([^"]*")/gi,
      "$1$3"
    );
    modifiedHtml = modifiedHtml.replace(/aria-current="[^"]*"/gi, "");
    modifiedHtml = modifiedHtml.replace(
      /style="[^"]*font-weight:\s*(bold|bolder|\d+)[^"]*"/gi,
      ""
    );

    // Find navigation patterns - be more flexible
    const navPatterns = [
      // Handle any navigation container with multiple approaches
      {
        containerPattern: /<nav[^>]*>(.*?)<\/nav>/gis,
        itemPattern: /<a[^>]*>.*?<\/a>/gi,
        isListBased: false,
      },
      {
        containerPattern: /<ul[^>]*>(.*?)<\/ul>/gis,
        itemPattern: /<li[^>]*>.*?<\/li>/gi,
        isListBased: true,
      },
      {
        containerPattern:
          /<div[^>]*class="[^"]*menu[^"]*"[^>]*>(.*?)<\/div>/gis,
        itemPattern: /<a[^>]*>.*?<\/a>/gi,
        isListBased: false,
      },
      // Fallback: any container with multiple links
      {
        containerPattern: /<div[^>]*>(.*?)<\/div>/gis,
        itemPattern: /<a[^>]*>.*?<\/a>/gi,
        isListBased: false,
      },
    ];

    // Find the navigation with the most items (likely the main navigation)
    let bestMatch: {
      match: string;
      content: string;
      items: string[];
      pattern: {
        containerPattern: RegExp;
        itemPattern: RegExp;
        isListBased: boolean;
      } | null;
    } = { match: "", content: "", items: [], pattern: null };

    navPatterns.forEach((pattern) => {
      const matches = modifiedHtml.match(pattern.containerPattern);
      if (matches) {
        matches.forEach((match) => {
          const content = match.match(pattern.containerPattern)?.[1] || "";
          const items = content.match(pattern.itemPattern) || [];

          // Look for navigation that contains common menu words
          const hasNavWords = /home|about|contact|blog|services/i.test(content);

          if (
            items.length > bestMatch.items.length &&
            hasNavWords &&
            items.length >= 3
          ) {
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
          .replace(/(<a[^>]*>)[^<]*(<\/a>)/gi, "$1Careers$2")
          .replace(/href="[^"]*"/gi, 'href="#careers"');

        // Add aria-current for active state
        careersItem = careersItem.replace(
          /(<a[^>]*?)>/gi,
          '$1 aria-current="page">'
        );
      } else {
        // For direct anchors
        careersItem = lastItem
          .replace(/>.*?</g, ">Careers<")
          .replace(/href="[^"]*"/gi, 'href="#careers"');

        if (!careersItem.includes("aria-current")) {
          careersItem = careersItem.replace("<a ", '<a aria-current="page" ');
        }
      }

      // Detect spacing
      let separator = " ";
      if (content.includes("</li>\n") || content.includes("</a>\n")) {
        separator = "\n    ";
      } else if (content.includes("</li> ") || content.includes("</a> ")) {
        separator = " ";
      }

      // Replace the navigation with the updated version
      const newContent = content + separator + careersItem;
      modifiedHtml = modifiedHtml.replace(
        match,
        match.replace(content, newContent)
      );
      careersAdded = true;

      console.log(
        "Added Careers to navigation with",
        bestMatch.items.length,
        "items"
      );
    }

    console.log("Successfully modified navigation with Careers link");
    return modifiedHtml;
  } catch (error) {
    console.error("Error modifying header navigation:", error);
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
  const [selectedJob, setSelectedJob] = useState<JobFormDataWithId | null>(
    null
  );
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  // Filter jobs based on title, location, and search query
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((job) => {
        const titleMatch = job.jobBoardTitle?.toLowerCase().includes(query);
        const descriptionMatch = job.jobDescription
          ?.toLowerCase()
          .includes(query);
        const locationMatch = job.jobLocation
          ? `${job.jobLocation.city}, ${job.jobLocation.state}`
              .toLowerCase()
              .includes(query)
          : false;
        return titleMatch || descriptionMatch || locationMatch;
      });
    }

    // Filter by job title
    if (selectedJobTitle !== "all") {
      filtered = filtered.filter(
        (job) => job.jobBoardTitle === selectedJobTitle
      );
    }

    // Filter by location
    if (selectedLocation !== "all") {
      filtered = filtered.filter((job) => {
        if (
          !job.jobLocation ||
          !job.jobLocation.city ||
          !job.jobLocation.state
        ) {
          return false;
        }
        const jobLocation = `${job.jobLocation.city}, ${job.jobLocation.state}`;
        return jobLocation === selectedLocation;
      });
    }

    return filtered;
  }, [jobs, selectedLocation, selectedJobTitle, searchQuery]);

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
  }, [selectedJobTitle, selectedLocation, searchQuery]);

  const hasActiveFilters =
    selectedJobTitle !== "all" ||
    selectedLocation !== "all" ||
    searchQuery.trim() !== "";

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
          console.log(
            "No scraped data available - website was not scraped during account setup"
          );
          // Set basic fallback data
          setScrapedData({
            header: `<header><h1>${company.companyName}</h1></header>`,
            footer: `<footer><p>&copy; ${new Date().getFullYear()} ${
              company.companyName
            }</p></footer>`,
            title: company.companyName,
            favicon: null,
            mainColor: null,
            cssLinks: [],
            domain: domainName,
          });
        }

        // Always fetch actual job postings from the database
        try {
          const jobsResponse = await API.job.getPublicJobsByCompany(
            slug as string
          );
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
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
        </div>
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading career opportunities...
          </h2>
          <p className="text-gray-500 text-sm">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-red-200">
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Building className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to Load Page
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500">
              Please contact the company directly if you're looking for job
              opportunities.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (contentMode === "embed") {
    return (
      <>
        {scrapedData?.header && (
          <div
            className="website-header w-full"
            style={{
              isolation: "isolate",
              contain: "layout style paint",
              position: "relative",
              zIndex: 1000,
            }}
            dangerouslySetInnerHTML={{
              __html: modifyHeaderNavigation(scrapedData.header),
            }}
          />
        )}

        <div
          className="careers-page-content container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
          style={{
            isolation: "isolate",
            contain: "layout style paint",
            position: "relative",
            zIndex: 1,
          }}
        >
          {jobs.length > 0 && (
            <div className="mb-8">
              {/* Search and Filters */}
              <Card className="border-gray-200 shadow-sm mb-8">
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search jobs by title, description, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Select
                        value={selectedJobTitle}
                        onValueChange={setSelectedJobTitle}
                      >
                        <SelectTrigger className="h-11 border-gray-300">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <SelectValue
                              placeholder={`All Job Titles (${jobs.length})`}
                            />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            All Job Titles ({jobs.length})
                          </SelectItem>
                          {uniqueJobTitles.map((title) => {
                            const count = jobs.filter(
                              (job) => job.jobBoardTitle === title
                            ).length;
                            return (
                              <SelectItem key={title} value={title}>
                                {title} ({count})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="sm:w-64">
                      <Select
                        value={selectedLocation}
                        onValueChange={setSelectedLocation}
                      >
                        <SelectTrigger className="h-11 border-gray-300">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <SelectValue
                              placeholder={`All Locations (${jobs.length})`}
                            />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            All Locations ({jobs.length})
                          </SelectItem>
                          {uniqueLocations.map((location) => {
                            const count = jobs.filter(
                              (job) =>
                                job.jobLocation &&
                                `${job.jobLocation.city}, ${job.jobLocation.state}` ===
                                  location
                            ).length;
                            return (
                              <SelectItem key={location} value={location}>
                                {location} ({count})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Active Filters */}
                  {hasActiveFilters && (
                    <div className="pt-4 border-t border-gray-200 flex flex-wrap items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Active filters:
                      </span>
                      {selectedJobTitle !== "all" && (
                        <Badge
                          variant="secondary"
                          className="gap-1.5 px-3 py-1"
                        >
                          <Briefcase className="h-3 w-3" />
                          {selectedJobTitle}
                          <button
                            onClick={() => setSelectedJobTitle("all")}
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {selectedLocation !== "all" && (
                        <Badge
                          variant="secondary"
                          className="gap-1.5 px-3 py-1"
                        >
                          <MapPin className="h-3 w-3" />
                          {selectedLocation}
                          <button
                            onClick={() => setSelectedLocation("all")}
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {searchQuery && (
                        <Badge
                          variant="secondary"
                          className="gap-1.5 px-3 py-1"
                        >
                          <Search className="h-3 w-3" />"{searchQuery}"
                          <button
                            onClick={() => setSearchQuery("")}
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedJobTitle("all");
                          setSelectedLocation("all");
                          setSearchQuery("");
                        }}
                        className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 ml-auto"
                      >
                        Clear all
                      </Button>
                    </div>
                  )}

                  {/* Results Count */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Showing{" "}
                      <span className="font-semibold text-gray-900">
                        {filteredJobs.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-gray-900">
                        {jobs.length}
                      </span>{" "}
                      positions
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Jobs Grid */}
          {paginatedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedJobs.map((job) => (
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
              ))}
            </div>
          ) : filteredJobs.length === 0 && hasActiveFilters ? (
            <Card className="border-gray-200">
              <div className="p-12 sm:p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No jobs match your filters
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try adjusting your search or filters to see more opportunities
                </p>
                <Button
                  onClick={() => {
                    setSelectedJobTitle("all");
                    setSelectedLocation("all");
                    setSearchQuery("");
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear all filters
                </Button>
              </div>
            </Card>
          ) : jobs.length === 0 ? (
            <Card className="border-gray-200">
              <div className="p-12 sm:p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No positions available
                </h3>
                <p className="text-gray-600">
                  Check back soon for new opportunities
                </p>
              </div>
            </Card>
          ) : null}

          {/* Pagination */}
          {filteredJobs.length > jobsPerPage && (
            <Card className="border-gray-200 shadow-sm">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {Math.min(
                        (currentPage - 1) * jobsPerPage + 1,
                        filteredJobs.length
                      )}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-900">
                      {Math.min(currentPage * jobsPerPage, filteredJobs.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {filteredJobs.length}
                    </span>{" "}
                    positions
                  </div>
                  <nav
                    className="flex items-center gap-2"
                    aria-label="Pagination"
                  >
                    <Button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>

                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
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
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              className="min-w-[2.5rem]"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              </div>
            </Card>
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
            style={{
              isolation: "isolate",
              contain: "layout style paint",
              position: "relative",
              zIndex: 1000,
            }}
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
