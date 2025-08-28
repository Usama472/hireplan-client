"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Copy, 
  RefreshCw, 
  ExternalLink, 
  Eye, 
  EyeOff,
  Download
} from "lucide-react";
import { useState, useEffect } from "react";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { toast } from "sonner";

interface EmbedData {
  htmlSnippet: string;
  jobs: any[];
  scrapedData: any;
  companyName: string;
  instructions: string[];
}

export function EmbedCodeSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [embedData, setEmbedData] = useState<EmbedData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { data: authSession } = useAuthSessionContext();

  const company = authSession?.user?.company;
  const companyId = company?.id;
  const websiteUrl = company?.websiteUrl;

  const fetchEmbedCode = async () => {
    if (!companyId) {
      toast.error("Company ID not found");
      return;
    }

    try {
      setIsLoading(true);
      
      const url = `${
        import.meta.env.VITE_API_URL || "https://hireplan.co/api/v1"
      }/embed/${companyId}/html-snippet${websiteUrl ? `?websiteUrl=${encodeURIComponent(websiteUrl)}` : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setEmbedData(data.data);
        toast.success("Embed code generated successfully!");
      } else {
        throw new Error(data.message || "Failed to generate embed code");
      }
    } catch (error) {
      console.error("Error fetching embed code:", error);
      toast.error("Failed to generate embed code", {
        description: "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!embedData?.htmlSnippet) return;
    
    try {
      await navigator.clipboard.writeText(embedData.htmlSnippet);
      toast.success("Embed code copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy code:", error);
      toast.error("Failed to copy code");
    }
  };

  const handleDownloadCode = () => {
    if (!embedData?.htmlSnippet) return;
    
    const blob = new Blob([embedData.htmlSnippet], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company?.companyName || 'company'}-jobs-widget.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Embed code downloaded!");
  };

  const handleOpenCompanyPage = () => {
    if (!company?.slug) return;
    
    const url = `${window.location.origin}/company/${company.slug}`;
    window.open(url, '_blank');
  };

  // Auto-fetch on component mount if company data is available
  useEffect(() => {
    if (companyId && !embedData) {
      fetchEmbedCode();
    }
  }, [companyId]);

  return (
    <Card className="border-0 shadow-lg shadow-gray-100/50">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Code className="h-5 w-5 text-purple-600" />
          </div>
          Embed Jobs Widget
        </CardTitle>
        <CardDescription className="text-base">
          Get HTML code to embed your job listings on your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={fetchEmbedCode}
            disabled={isLoading || !companyId}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Generating..." : "Generate/Refresh Code"}
          </Button>
          
          {company?.slug && (
            <Button
              variant="outline"
              onClick={handleOpenCompanyPage}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Company Page
            </Button>
          )}
        </div>

        {embedData && (
          <>
            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-sm">
                {embedData.jobs.length} Active Job{embedData.jobs.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Last Updated: {new Date().toLocaleDateString()}
              </Badge>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                {embedData.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            {/* Code Actions */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCopyCode} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              
              <Button onClick={handleDownloadCode} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download HTML
              </Button>
              
              <Button 
                onClick={() => setShowPreview(!showPreview)} 
                variant="outline" 
                size="sm"
              >
                {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
            </div>

            {/* Code Display */}
            <div className="bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between p-3 border-b">
                <span className="text-sm font-medium text-gray-700">HTML Embed Code</span>
                <Badge variant="outline" className="text-xs">
                  {(embedData.htmlSnippet.length / 1024).toFixed(1)}KB
                </Badge>
              </div>
              <div className="relative">
                <pre className="p-4 text-xs bg-gray-900 text-green-400 overflow-x-auto max-h-64 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  <code>{embedData.htmlSnippet}</code>
                </pre>
                <Button
                  onClick={handleCopyCode}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Live Preview */}
            {showPreview && (
              <div className="bg-white rounded-lg border">
                <div className="flex items-center justify-between p-3 border-b">
                  <span className="text-sm font-medium text-gray-700">Live Preview</span>
                  <Badge variant="outline" className="text-xs">Preview</Badge>
                </div>
                <div className="p-4 bg-gray-50">
                  <div 
                    className="bg-white rounded-lg border max-h-96 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: embedData.htmlSnippet }}
                  />
                </div>
              </div>
            )}

            {/* Scraped Data Info */}
            {embedData.scrapedData && (
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-900 mb-2">Extracted from your website:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  {embedData.scrapedData.brand?.logoUrl && (
                    <div>✓ Logo found and included</div>
                  )}
                  {embedData.scrapedData.brand?.navItems?.length > 0 && (
                    <div>✓ Navigation menu ({embedData.scrapedData.brand.navItems.length} items): {embedData.scrapedData.brand.navItems.map((item: any) => item.text).join(', ')}</div>
                  )}
                  {embedData.scrapedData.mainColor && (
                    <div>✓ Brand color: <span style={{backgroundColor: embedData.scrapedData.mainColor, color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '11px'}}>{embedData.scrapedData.mainColor}</span></div>
                  )}
                  {embedData.scrapedData.designTokens?.typography?.fontFamily && (
                    <div>✓ Font family: {embedData.scrapedData.designTokens.typography.fontFamily}</div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <h4 className="font-semibold text-yellow-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• The widget will always show your latest active job postings</li>
                <li>• Jobs link back to your HirePlan application pages</li>
                <li>• The widget automatically matches your website's branding</li>
                <li>• Refresh the code after making significant website changes</li>
                <li>• Navigation and styling are extracted fresh each time you generate the code</li>
              </ul>
            </div>
          </>
        )}

        {!embedData && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <Code className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Click "Generate Code" to create your embed widget</p>
            <p className="text-sm mt-1">Make sure to save your website URL first</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
