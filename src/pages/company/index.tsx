import CompanyJobCard from "@/components/company/company-job-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import API from "@/http";
import { scrapeWebsite } from "@/http/scrape/api";
import type { JobFormDataWithId } from "@/interfaces";
import { Building, MapPin } from "lucide-react";
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

const CompanyPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [scrapedData, setScrapedData] = useState<ScrapedWebsite | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [contentMode, _] = useState<"embed" | "custom">("embed");

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [domainName, setDomainName] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobFormDataWithId[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Get unique locations from jobs for filtering
  const uniqueLocations = useMemo(() => {
    const jobsWithLocation = jobs.filter(
      (job) => job.jobLocation && job.jobLocation.city && job.jobLocation.state
    );

    const locations = jobsWithLocation.map(
      (job) => `${job.jobLocation.city}, ${job.jobLocation.state}`
    );
    return [...new Set(locations)].sort();
  }, [jobs]);

  // Filter jobs based on selected location
  const filteredJobs = useMemo(() => {
    if (selectedLocation === "all") {
      return jobs;
    }
    return jobs.filter((job) => {
      if (!job.jobLocation || !job.jobLocation.city || !job.jobLocation.state) {
        return false;
      }
      const jobLocation = `${job.jobLocation.city}, ${job.jobLocation.state}`;
      return jobLocation === selectedLocation;
    });
  }, [jobs, selectedLocation]);

  // Helper function to save scraped data to backend
  const saveScrapedDataToCache = async (companyId: string, data: any) => {
    try {
      await fetch(
        `${
          import.meta.env.VITE_API_URL || "https://hireplan.co/api/v1"
        }/company/${companyId}/scraped-data`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            header: data.header || "",
            footer: data.footer || "",
            title: data.title || "",
            favicon: data.favicon || null,
            mainColor: data.mainColor || null,
            cssLinks: data.cssLinks || [],
          }),
        }
      );
    } catch (error) {
      console.error("Failed to save scraped data to cache:", error);
    }
  };

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

        const websiteUrl = company.websiteUrl;
        const domainName = company.domainName;

        setWebsiteUrl(websiteUrl);
        setDomainName(domainName);
        setCompanyId(company.id);

        // Check if we have cached scraped data - use it indefinitely until manually refreshed
        if (company.scrapedData && company.scrapedData.header) {
          console.log("Using cached scraped data");
          setScrapedData({
            ...company.scrapedData,
            domain: domainName,
          });

          // Get jobs from the cached data or fetch separately
          const jobs = company.scrapedData.jobs?.results || [];
          setJobs(jobs);

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
            "No cached data or cache is stale, performing live scraping"
          );

          // Fallback to live scraping
          if (!websiteUrl) {
            throw new Error("Website URL is required for scraping");
          }
          const response = await scrapeWebsite(company.id, websiteUrl);
          setScrapedData({
            ...response,
            domain: domainName,
          });

          const jobs = response?.jobs?.results || [];
          setJobs(jobs);

          // Save the scraped data to cache for future use
          await saveScrapedDataToCache(company.id, response);

          // Apply scraped styles and metadata
          if (response.cssLinks && Array.isArray(response.cssLinks)) {
            response.cssLinks.forEach((cssLink: string) => {
              if (!document.querySelector(`link[href="${cssLink}"]`)) {
                const linkElement = document.createElement("link");
                linkElement.rel = "stylesheet";
                linkElement.href = cssLink;
                linkElement.className = "scraped-website-styles";
                document.head.appendChild(linkElement);
              }
            });
          }

          if (response.favicon) {
            const existingFavicon = document.querySelector('link[rel="icon"]');
            if (existingFavicon) {
              existingFavicon.setAttribute("href", response.favicon);
            } else {
              const faviconLink = document.createElement("link");
              faviconLink.rel = "icon";
              faviconLink.href = response.favicon;
              document.head.appendChild(faviconLink);
            }
          }

          if (response.mainColor) {
            const metaThemeColor = document.querySelector(
              'meta[name="theme-color"]'
            );
            if (metaThemeColor) {
              metaThemeColor.setAttribute("content", response.mainColor);
            } else {
              const themeColorMeta = document.createElement("meta");
              themeColorMeta.name = "theme-color";
              themeColorMeta.content = response.mainColor;
              document.head.appendChild(themeColorMeta);
            }
          }
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

  const handleRetry = () => {
    setLoading(true);
    setError(null);

    if (!companyId || !websiteUrl) {
      setError("Missing company information for retry");
      setLoading(false);
      return;
    }

    scrapeWebsite(companyId, websiteUrl)
      .then(async (response) => {
        setScrapedData({
          ...response,
          domain: domainName,
        });

        // Save the new scraped data to cache
        if (companyId) {
          await saveScrapedDataToCache(companyId, response);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Retry failed:", err);
        setError("Failed to load website content after retry");
        setLoading(false);
      });
  };

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
        <Button
          onClick={handleRetry}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (contentMode === "embed") {
    return (
      <>
        {scrapedData?.header && (
          <div
            className="website-header w-full"
            dangerouslySetInnerHTML={{ __html: scrapedData.header }}
          />
        )}
        <div className="container mx-auto px-4 py-6">
          {/* Location Filter */}
          {jobs.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Open Positions
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedLocation === "all"
                    ? `${jobs.length} total jobs available`
                    : `${filteredJobs.length} jobs in ${selectedLocation}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All locations ({jobs.length})
                    </SelectItem>
                    {uniqueLocations.map((location) => {
                      const jobCount = jobs.filter(
                        (job) =>
                          job.jobLocation &&
                          `${job.jobLocation.city}, ${job.jobLocation.state}` ===
                            location
                      ).length;
                      return (
                        <SelectItem key={location} value={location}>
                          {location} ({jobCount})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <CompanyJobCard key={job.id} job={job} />
              ))
            ) : selectedLocation !== "all" ? (
              <div className="col-span-full">
                <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                  <div className="text-center py-12 px-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No jobs found in {selectedLocation}
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-sm mx-auto text-sm">
                      Try selecting a different location or view all available
                      positions.
                    </p>
                    <Button
                      onClick={() => setSelectedLocation("all")}
                      variant="outline"
                      size="sm"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      View All Jobs
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No jobs available at this time.</p>
              </div>
            )}
          </div>
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
