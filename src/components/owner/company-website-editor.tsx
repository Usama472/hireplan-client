import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Code,
  Eye,
  Save,
  Loader2,
  Globe,
  Palette,
  FileCode,
  Layout,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Wand2,
  Download,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { ownerManagementService, type Company } from '@/http/owner';

interface CompanyWebsiteEditorProps {
  company: Company;
  onUpdate?: (company: Company) => void;
}

const CompanyWebsiteEditor: React.FC<CompanyWebsiteEditorProps> = ({ 
  company, 
  onUpdate 
}) => {
  const [isLoading, setSaving] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'styles' | 'settings' | 'ai'>('header');
  const [aiCleanupType, setAiCleanupType] = useState<'basic' | 'advanced' | 'full'>('advanced');
  const [showPreview, setShowPreview] = useState(false);
  const [companyJobs, setCompanyJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  
  const [formData, setFormData] = useState({
    header: company.scrapedData?.header || '',
    footer: company.scrapedData?.footer || '',
    title: company.scrapedData?.title || company.companyName,
    favicon: company.scrapedData?.favicon || '',
    mainColor: company.scrapedData?.mainColor || '#3B82F6',
    cssLinks: company.scrapedData?.cssLinks || []
  });

  // Update form data when company data changes
  useEffect(() => {
    if (company.scrapedData) {
      setFormData({
        header: company.scrapedData.header || '',
        footer: company.scrapedData.footer || '',
        title: company.scrapedData.title || company.companyName,
        favicon: company.scrapedData.favicon || '',
        mainColor: company.scrapedData.mainColor || '#3B82F6',
        cssLinks: company.scrapedData.cssLinks || []
      });
    }
  }, [company.scrapedData, company.companyName]);

  const [newCssLink, setNewCssLink] = useState('');

  const refreshFromDatabase = async () => {
    if (!company.websiteUrl) {
      toast.error('No website URL found for this company');
      return;
    }

    try {
      setIsRefreshing(true);
      
      // Refresh all companies and find this one to get latest scraped data
      const companies = await ownerManagementService.getAllCompanies();
      const updatedCompany = companies.find(c => c.id === company.id);
      
      if (updatedCompany?.scrapedData) {
        setFormData({
          header: updatedCompany.scrapedData.header || '',
          footer: updatedCompany.scrapedData.footer || '',
          title: updatedCompany.scrapedData.title || updatedCompany.companyName,
          favicon: updatedCompany.scrapedData.favicon || '',
          mainColor: updatedCompany.scrapedData.mainColor || '#3B82F6',
          cssLinks: updatedCompany.scrapedData.cssLinks || []
        });
        
        toast.success('Data refreshed from database');
        onUpdate?.(updatedCompany);
      } else {
        toast.info('No scraped data found in database');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };


  const openPreview = async () => {
    try {
      setIsLoadingJobs(true);
      toast.info('Loading company jobs for preview...');
      
      // Fetch actual jobs for this company
      const jobs = await ownerManagementService.getCompanyJobs(company.id);
      setCompanyJobs(jobs);
      
      
        // Generate job cards HTML with standard design
        const generateJobCard = (job: any) => {
          const location = job.jobLocation 
            ? `${job.jobLocation.city}, ${job.jobLocation.state}`
            : job.workplaceType === 'remote' ? 'Remote' 
            : job.workplaceType === 'hybrid' ? 'Hybrid'
            : 'On-site';

        const formatSalary = (payRate: any) => {
          if (!payRate) return '';
          
          if (payRate.type === 'range' && payRate.min && payRate.max) {
            return `$${payRate.min.toLocaleString()} - $${payRate.max.toLocaleString()}`;
          }
          if (payRate.type === 'exact-amount' && payRate.min) {
            return `$${payRate.min.toLocaleString()}`;
          }
          if (payRate.type === 'starting-amount' && payRate.min) {
            return `Starting at $${payRate.min.toLocaleString()}`;
          }
          if (payRate.type === 'maximum-amount' && payRate.max) {
            return `Up to $${payRate.max.toLocaleString()}`;
          }
          return '';
        };

        const salary = formatSalary(job.payRate);
        const cleanDescription = job.jobDescription
          ?.replace(/<[^>]*>/g, '')
          ?.replace(/\n+/g, ' ')
          ?.trim() || '';
        
        const truncatedDescription = cleanDescription.length > 200 
          ? cleanDescription.substring(0, 200) + '...' 
          : cleanDescription;

        const formattedDate = job.endDate 
          ? new Date(job.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'Open';

        return `
          <div class="job-card">
            <div class="job-header">
              <div class="job-header-strip">
                <div class="job-meta-info">
                  <span class="job-type-badge">${job.employmentType || 'Full-time'}</span>
                  <span class="job-location-text">📍 ${location}</span>
                  <span class="job-deadline">📅 ${formattedDate}</span>
                </div>
              </div>
            </div>
            <div class="job-content">
              <div class="job-title">${job.jobTitle || job.jobBoardTitle || 'Job Position'}</div>
              ${salary ? `<div class="job-salary">💰 ${salary}</div>` : ''}
              <div class="job-description">${truncatedDescription}</div>
              ${job.qualifications && job.qualifications.length > 0 ? `
                <div class="job-requirements">
                  <div class="requirements-title">Key Requirements:</div>
                  <ul class="requirements-list">
                    ${job.qualifications.slice(0, 3).map((q: any) => `<li>${q.text || q}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              <button class="apply-button">Apply Now</button>
            </div>
          </div>
        `;
      };

      const jobsHtml = jobs.length > 0 
        ? jobs.slice(0, 6).map(generateJobCard).join('')
        : `
          <div class="no-jobs-message">
            <div class="no-jobs-icon">💼</div>
            <h3>No Job Openings Currently</h3>
            <p>This company doesn't have any active job postings at the moment. Check back later for new opportunities!</p>
          </div>
        `;

      // Create a complete HTML preview with the edited content
      const cssLinksHtml = formData.cssLinks.map(link => 
        `<link rel="stylesheet" href="${link}">`
      ).join('\n    ');

      const previewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formData.title || company.companyName}</title>
    ${formData.favicon ? `<link rel="icon" href="${formData.favicon}">` : ''}
    ${cssLinksHtml}
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            background-color: #f9fafb;
        }
        
        .preview-banner {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            font-size: 14px;
            text-align: center;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .content-container {
            background: white;
            min-height: calc(100vh - 44px);
            display: flex;
            flex-direction: column;
        }
        .careers-section {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .careers-title {
            font-size: 2.5rem;
            font-weight: bold;
            color: ${formData.mainColor || '#3B82F6'};
            margin-bottom: 16px;
            text-align: center;
        }
        .careers-subtitle {
            font-size: 1.25rem;
            color: #6b7280;
            margin-bottom: 40px;
            text-align: center;
        }
        .jobs-count {
            color: #6b7280;
            margin-bottom: 24px;
            text-align: center;
            font-size: 0.9rem;
        }
        .job-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: all 0.2s ease;
            text-align: left;
        }
        .job-card:hover {
            border-color: #d1d5db;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .job-header {
            background: linear-gradient(to right, #f9fafb, #f3f4f6);
            border-bottom: 1px solid #f3f4f6;
        }
        .job-header-strip {
            padding: 12px 24px;
        }
        .job-meta-info {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            align-items: center;
            font-size: 0.875rem;
        }
        .job-type-badge {
            background: ${formData.mainColor || '#3B82F6'};
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        .job-location-text, .job-deadline {
            color: #6b7280;
            font-size: 0.875rem;
        }
        .job-content {
            padding: 24px;
        }
        .job-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 12px;
        }
        .job-salary {
            color: #059669;
            font-weight: 500;
            margin-bottom: 16px;
            font-size: 1rem;
        }
        .job-description {
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .job-requirements {
            margin-bottom: 20px;
        }
        .requirements-title {
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            font-size: 0.9rem;
        }
        .requirements-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .requirements-list li {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 4px;
            padding-left: 16px;
            position: relative;
        }
        .requirements-list li:before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .apply-button {
            background: ${formData.mainColor || '#3B82F6'};
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            font-size: 0.875rem;
            transition: background-color 0.2s ease;
        }
        .apply-button:hover {
            opacity: 0.9;
        }
        .no-jobs-message {
            text-align: center;
            padding: 60px 20px;
            color: #6b7280;
        }
        .no-jobs-icon {
            font-size: 4rem;
            margin-bottom: 16px;
        }
        .no-jobs-message h3 {
            color: #374151;
            margin-bottom: 8px;
        }
        .no-jobs-message p {
            color: #6b7280;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="preview-banner">
        🔍 Preview Mode - Showing ${jobs.length} actual job${jobs.length !== 1 ? 's' : ''}
    </div>
    <div class="content-container">
        ${formData.header || ''}
        
        <div class="careers-section">
            <h1 class="careers-title">Join Our Team</h1>
            <p class="careers-subtitle">Build your career with ${company.companyName}</p>
            ${jobs.length > 0 ? `<div class="jobs-count">${jobs.length} position${jobs.length !== 1 ? 's' : ''} available</div>` : ''}
            
            ${jobsHtml}
        </div>
        
        ${formData.footer || ''}
    </div>
</body>
</html>`;

      // Open preview in new window
      const previewWindow = window.open('', '_blank', 'width=1200,height=800');
      if (previewWindow) {
        previewWindow.document.write(previewHtml);
        previewWindow.document.close();
        previewWindow.document.title = `Preview: ${company.companyName} Career Page (${jobs.length} Jobs)`;
        toast.success(`Preview opened with ${jobs.length} actual job${jobs.length !== 1 ? 's' : ''}!`);
      } else {
        toast.error('Could not open preview. Please allow popups for this site.');
      }
    } catch (error) {
      console.error('Error loading jobs for preview:', error);
      toast.error('Failed to load jobs. Showing preview without job data.');
      
      // Fallback to basic preview without jobs
      const cssLinksHtml = formData.cssLinks.map(link => 
        `<link rel="stylesheet" href="${link}">`
      ).join('\n    ');

      const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formData.title || company.companyName}</title>
    ${formData.favicon ? `<link rel="icon" href="${formData.favicon}">` : ''}
    ${cssLinksHtml}
</head>
<body>
    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 12px 20px; text-align: center;">
        ⚠️ Could not load job data - Preview shows header/footer only
    </div>
    ${formData.header || ''}
    <div style="padding: 40px 20px; text-align: center;">
        <h1 style="color: ${formData.mainColor || '#3B82F6'};">Join Our Team</h1>
        <p>Build your career with ${company.companyName}</p>
        <p style="color: #6b7280;">Job listings would appear here once loaded.</p>
    </div>
    ${formData.footer || ''}
</body>
</html>`;

      const previewWindow = window.open('', '_blank', 'width=1200,height=800');
      if (previewWindow) {
        previewWindow.document.write(fallbackHtml);
        previewWindow.document.close();
      }
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const dataToSave = {
        header: formData.header,
        footer: formData.footer,
        title: formData.title,
        favicon: formData.favicon,
        mainColor: formData.mainColor,
        cssLinks: formData.cssLinks,
      };
      
      console.log('💾 Saving company data:', {
        companyId: company.id,
        dataToSave: dataToSave,
        url: `/owner/management/companies/${company.id}/scraped-data`
      });
      
      await ownerManagementService.updateCompanyScrapedData(company.id, dataToSave);

      // Update the company object
      const updatedCompany = {
        ...company,
        scrapedData: {
          ...company.scrapedData,
          ...formData,
          scrapedAt: new Date().toISOString()
        }
      };

      onUpdate?.(updatedCompany);
      toast.success('Website settings updated successfully!');
    } catch (error) {
      console.error('Error updating scraped data:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      
      // Extract the actual error message from the response
      let errorMessage = 'Failed to update website settings';
      if (error && typeof error === 'object') {
        if ('response' in error && error.response && error.response.data) {
          const responseData = error.response.data;
          if (responseData.message) {
            errorMessage = `Save failed: ${responseData.message}`;
          } else if (responseData.error) {
            errorMessage = `Save failed: ${responseData.error}`;
          }
        } else if ('message' in error && error.message) {
          errorMessage = `Save failed: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const addCssLink = () => {
    if (newCssLink.trim() && !formData.cssLinks.includes(newCssLink.trim())) {
      setFormData({
        ...formData,
        cssLinks: [...formData.cssLinks, newCssLink.trim()]
      });
      setNewCssLink('');
    }
  };

  const removeCssLink = (index: number) => {
    setFormData({
      ...formData,
      cssLinks: formData.cssLinks.filter((_, i) => i !== index)
    });
  };

  const handleAICleanup = async () => {
    if (!company.websiteUrl) {
      toast.error('Company website URL is required for AI cleanup');
      return;
    }

    try {
      setIsAIProcessing(true);
      
      const response = await ownerManagementService.aiCleanupWebsite(company.id, {
        websiteUrl: company.websiteUrl,
        cleanupType: aiCleanupType,
        preserveExisting: true
      });

      if (response.success) {
        // Update form data with AI-cleaned results
        setFormData({
          header: response.data.header || formData.header,
          footer: response.data.footer || formData.footer,
          title: response.data.title || formData.title,
          favicon: response.data.favicon || formData.favicon,
          mainColor: response.data.mainColor || formData.mainColor,
          cssLinks: response.data.cssLinks || formData.cssLinks
        });

        toast.success(
          <div>
            <p className="font-semibold">AI Cleanup Complete! ✨</p>
            <p className="text-xs mt-1">{response.message}</p>
          </div>
        );
      }
    } catch (error: any) {
      console.error('AI cleanup failed:', error);
      toast.error('AI cleanup failed. Please try again or contact support.');
    } finally {
      setIsAIProcessing(false);
    }
  };

  const tabs = [
    { id: 'header', label: 'Header HTML', icon: Layout },
    { id: 'footer', label: 'Footer HTML', icon: Layout },
    { id: 'styles', label: 'CSS & Assets', icon: Palette },
    { id: 'settings', label: 'Settings', icon: Globe },
    { id: 'ai', label: 'AI Cleanup', icon: Sparkles }
  ];

  // Preview functionality now uses openPreview() function instead of redirecting to live site

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Website Editor</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Customize how {company.companyName}'s career page appears
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshFromDatabase}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              {isRefreshing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Loading</>
              ) : (
                <><RefreshCw className="h-4 w-4" /> Refresh</>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openPreview}
              disabled={isLoadingJobs}
              className="flex items-center gap-2 bg-blue-50 border-blue-200 hover:bg-blue-100"
              title="Preview your edited content with actual job listings"
            >
              {isLoadingJobs ? (
                <>
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  Loading Jobs...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 text-blue-600" />
                  Preview Edits
                </>
              )}
            </Button>
            {company.websiteUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(company.websiteUrl, '_blank')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                title="View the actual live website (original)"
              >
                <ExternalLink className="h-4 w-4" />
                Original Site
              </Button>
            )}
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'header' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="header" className="text-sm font-medium mb-2 block">
                  Header HTML
                </Label>
                <p className="text-xs text-gray-500 mb-3">
                  This HTML will be displayed at the top of the careers page (navigation, logo, etc.)
                </p>
                <Textarea
                  id="header"
                  value={formData.header}
                  onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                  placeholder="<header>&#10;  <nav>&#10;    <img src='logo.png' alt='Company Logo' />&#10;    <ul>&#10;      <li><a href='/'>Home</a></li>&#10;      <li><a href='/careers'>Careers</a></li>&#10;    </ul>&#10;  </nav>&#10;</header>"
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'footer' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="footer" className="text-sm font-medium mb-2 block">
                  Footer HTML
                </Label>
                <p className="text-xs text-gray-500 mb-3">
                  This HTML will be displayed at the bottom of the careers page
                </p>
                <Textarea
                  id="footer"
                  value={formData.footer}
                  onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                  placeholder="<footer>&#10;  <div>&#10;    <p>&copy; 2024 Your Company Name. All rights reserved.</p>&#10;    <ul>&#10;      <li><a href='/privacy'>Privacy Policy</a></li>&#10;      <li><a href='/terms'>Terms of Service</a></li>&#10;    </ul>&#10;  </div>&#10;</footer>"
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}

          {activeTab === 'styles' && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">CSS Stylesheets</Label>
                <p className="text-xs text-gray-500 mb-4">
                  Add CSS file URLs to style the header and footer elements
                </p>
                
                {/* Add new CSS link */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="https://yoursite.com/styles.css"
                    value={newCssLink}
                    onChange={(e) => setNewCssLink(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addCssLink} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* CSS Links List */}
                <div className="space-y-2">
                  {formData.cssLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FileCode className="h-4 w-4 text-gray-500" />
                      <span className="flex-1 text-sm font-mono break-all">{link}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(link, '_blank')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCssLink(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {formData.cssLinks.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No CSS files added yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                    Page Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Your Company - Careers"
                  />
                </div>

                <div>
                  <Label htmlFor="favicon" className="text-sm font-medium mb-2 block">
                    Favicon URL
                  </Label>
                  <Input
                    id="favicon"
                    value={formData.favicon}
                    onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                    placeholder="https://yoursite.com/favicon.ico"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mainColor" className="text-sm font-medium mb-2 block">
                  Brand Color
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="mainColor"
                    value={formData.mainColor}
                    onChange={(e) => setFormData({ ...formData, mainColor: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={formData.mainColor}
                    onChange={(e) => setFormData({ ...formData, mainColor: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>


              {/* Preview Section */}
              {company.scrapedData?.scrapedAt && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Last Updated</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {new Date(company.scrapedData.scrapedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* AI Cleanup Header */}
              <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Website Cleanup</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Let our AI scrape and clean up your website's HTML/CSS automatically. 
                  Perfect for fixing broken code, optimizing performance, and ensuring compatibility.
                </p>
              </div>

              {/* Cleanup Options */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Cleanup Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      type: 'basic' as const,
                      name: 'Basic Cleanup',
                      description: 'Fix HTML syntax, remove broken links, basic optimization',
                      icon: RefreshCw,
                      time: '~30 seconds'
                    },
                    {
                      type: 'advanced' as const, 
                      name: 'Advanced Cleanup',
                      description: 'Full HTML/CSS cleanup, performance optimization, mobile responsiveness',
                      icon: Wand2,
                      time: '~60 seconds'
                    },
                    {
                      type: 'full' as const,
                      name: 'Complete Rebuild', 
                      description: 'AI rewrites code for maximum performance and modern standards',
                      icon: Download,
                      time: '~90 seconds'
                    }
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = aiCleanupType === option.type;
                    return (
                      <button
                        key={option.type}
                        onClick={() => setAiCleanupType(option.type)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-blue-500' : 'bg-gray-400'
                          }`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium text-sm ${
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {option.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              {option.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                              {option.time}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Website URL Display */}
              {company.websiteUrl && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Target Website</span>
                  </div>
                  <p className="text-sm font-mono text-gray-900 break-all">{company.websiteUrl}</p>
                </div>
              )}

              {/* Warning */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Important Notes</p>
                  <ul className="text-xs text-amber-800 mt-1 space-y-1">
                    <li>• AI cleanup will preserve your existing customizations</li>
                    <li>• Always review changes before saving</li>
                    <li>• Make sure your website is publicly accessible</li>
                    <li>• Complex JavaScript functionality may not be preserved</li>
                  </ul>
                </div>
              </div>

              {/* AI Cleanup Action */}
              <div className="text-center pt-4">
                <Button
                  onClick={handleAICleanup}
                  disabled={isAIProcessing || !company.websiteUrl}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 hover:from-blue-700 hover:via-purple-700 hover:to-blue-900 text-white px-8 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  {isAIProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                      AI is processing your website...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-3" />
                      Start AI Cleanup ({aiCleanupType})
                    </>
                  )}
                </Button>
                
                {!company.websiteUrl && (
                  <p className="text-sm text-red-600 mt-2">
                    Please add a website URL in the company settings first
                  </p>
                )}
              </div>

              {/* Progress Indicator */}
              {isAIProcessing && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">AI Processing in Progress</p>
                      <p className="text-xs text-blue-700 mt-1">
                        {aiCleanupType === 'basic' ? 'Fixing HTML and removing broken elements...' :
                         aiCleanupType === 'advanced' ? 'Optimizing performance and mobile responsiveness...' :
                         'Completely rebuilding for modern standards...'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyWebsiteEditor;
