import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Eye, Download, Code, Globe, Palette, Monitor, Book } from 'lucide-react';
import { toast } from 'sonner';
import useAuthSessionContext from '@/lib/context/AuthSessionContext';
import WidgetDocumentation from './WidgetDocumentation';

interface WidgetConfig {
  companyId: string;
  theme: 'light' | 'dark' | 'auto';
  limit: number;
  categories: string[];
  width: string;
  height: string;
  customColors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  borderRadius: string;
  fontFamily: string;
  showCompanyLogo: boolean;
  showPoweredBy: boolean;
}

interface EmbedCode {
  type: string;
  embedCode: string;
  instructions: string;
}

const WidgetSettings: React.FC = () => {
  const { data: authSession } = useAuthSessionContext();
  const [config, setConfig] = useState<WidgetConfig>({
    companyId: authSession?.user?.company?.slug || authSession?.user?.company?.id || '',
    theme: 'light',
    limit: 10,
    categories: [],
    width: '100%',
    height: 'auto',
    customColors: {
      primary: authSession?.user?.company?.scrapedData?.mainColor || '#2563eb',
      secondary: '#64748b',
      background: '#ffffff',
      text: '#1e293b'
    },
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
    showCompanyLogo: true,
    showPoweredBy: true
  });

  const [embedCodes, setEmbedCodes] = useState<Record<string, EmbedCode>>({});
  const [activeTab, setActiveTab] = useState('configure');
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(authSession?.user?.company?.scrapedData || null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const embedTypes = [
    { id: 'auto', name: 'Auto-Initialize', description: 'Simple copy-paste solution', icon: Code },
    { id: 'manual', name: 'Manual Setup', description: 'Full control over initialization', icon: Monitor },
    { id: 'iframe', name: 'iframe Embed', description: 'Maximum isolation', icon: Globe },
    { id: 'react', name: 'React Component', description: 'For React applications', icon: Code },
    { id: 'vue', name: 'Vue Component', description: 'For Vue.js applications', icon: Code },
    { id: 'wordpress', name: 'WordPress', description: 'Shortcode for WordPress', icon: Code }
  ];

  useEffect(() => {
    if (config.companyId) {
      generateEmbedCodes();
      fetchAvailableCategories();
    }
  }, [config.companyId]);

  useEffect(() => {
    if (config.companyId) {
      generateEmbedCodes();
    }
  }, [config]);

  const generateEmbedCodes = async () => {
    setLoading(true);
    try {
      const promises = embedTypes.map(async (type) => {
        const params = new URLSearchParams({
          companyId: config.companyId,
          type: type.id,
          theme: config.theme,
          limit: config.limit.toString(),
          ...(config.categories.length > 0 && { categories: config.categories.join(',') }),
          ...(config.width !== '100%' && { width: config.width }),
          ...(config.height !== 'auto' && { height: config.height }),
          customColors: JSON.stringify(config.customColors)
        });

        const response = await fetch(`/api/v1/widget/embed?${params}`);
        const data = await response.json();
        return { [type.id]: data };
      });

      const results = await Promise.all(promises);
      const embedCodesMap = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setEmbedCodes(embedCodesMap);
    } catch (error) {
      toast.error('Failed to generate embed codes');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied to clipboard!');
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateConfig = (key: keyof WidgetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (category: string) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const scrapeWebsite = async () => {
    const company = authSession?.user?.company;
    const companyId = company?.id || company?._id || (typeof company === 'string' ? company : null);
    console.log('Auth session user company:', company);
    console.log('Using company ID:', companyId);
    
    if (!companyId) {
      toast.error('Company information not found');
      return;
    }

    setScraping(true);
    try {
      const response = await fetch('/api/v1/scraper/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: companyId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to scrape website');
      }

      const data = await response.json();
      setScrapedData(data);
      
      // Update config with scraped colors
      if (data.mainColor) {
        setConfig(prev => ({
          ...prev,
          customColors: {
            ...prev.customColors,
            primary: data.mainColor
          }
        }));
      }

      toast.success('Website scraped successfully! Header and footer extracted.');
    } catch (error) {
      console.error('Scraping error:', error);
      toast.error('Failed to scrape website. Please check the URL and try again.');
    } finally {
      setScraping(false);
    }
  };

  const fetchAvailableCategories = async () => {
    if (!config.companyId) return;

    try {
      const response = await fetch(`/api/v1/widget/categories?companyId=${config.companyId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to empty array if error
      setAvailableCategories([]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Embeddable Job Widget</h3>
        <p className="text-gray-600 text-sm">Create and customize your embeddable job listings widget for external websites</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configure" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Configure
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="embed" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Embed Code
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Docs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6">
          {/* Website Scraping */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Website Scraping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Company Website</p>
                  <p className="text-xs text-gray-500">{authSession?.user?.company?.websiteUrl || 'No website URL configured'}</p>
                </div>
                <Button
                  onClick={scrapeWebsite}
                  disabled={scraping}
                  className="flex items-center gap-2"
                >
                  {scraping ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4" />
                      Scrape Website
                    </>
                  )}
                </Button>
              </div>
              
              {scrapedData && (
                <div className="space-y-3 mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Website data extracted successfully</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-600">Header:</span>
                      <span className="ml-2 text-green-700">{scrapedData.header ? '✓ Found' : '✗ Not found'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Footer:</span>
                      <span className="ml-2 text-green-700">{scrapedData.footer ? '✓ Found' : '✗ Not found'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Colors:</span>
                      <span className="ml-2 text-green-700">{scrapedData.mainColor ? '✓ Found' : '✗ Not found'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Favicon:</span>
                      <span className="ml-2 text-green-700">{scrapedData.favicon ? '✓ Found' : '✗ Not found'}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyId">Company ID</Label>
                  <Input
                    id="companyId"
                    value={config.companyId}
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your company's unique identifier (auto-generated from company name)</p>
                </div>

                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={config.theme} onValueChange={(value: any) => updateConfig('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="limit">Job Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={config.limit}
                    onChange={(e) => updateConfig('limit', parseInt(e.target.value) || 10)}
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <Label>Job Categories</Label>
                  {availableCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableCategories.map(category => (
                        <Badge
                          key={category}
                          variant={config.categories.includes(category) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleCategory(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 p-3 bg-gray-50 rounded border text-center">
                      <p className="text-xs text-gray-500">No departments found in your jobs</p>
                      <p className="text-xs text-gray-400">Categories will appear here once you create jobs with departments</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Filter jobs by department (optional)</p>
                </div>
              </CardContent>
            </Card>

            {/* Styling */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      value={config.width}
                      onChange={(e) => updateConfig('width', e.target.value)}
                      placeholder="100%"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={config.height}
                      onChange={(e) => updateConfig('height', e.target.value)}
                      placeholder="auto"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={config.customColors.primary}
                        onChange={(e) => updateConfig('customColors', { ...config.customColors, primary: e.target.value })}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={config.customColors.primary}
                        onChange={(e) => updateConfig('customColors', { ...config.customColors, primary: e.target.value })}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={config.customColors.secondary}
                        onChange={(e) => updateConfig('customColors', { ...config.customColors, secondary: e.target.value })}
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        value={config.customColors.secondary}
                        onChange={(e) => updateConfig('customColors', { ...config.customColors, secondary: e.target.value })}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Select value={config.fontFamily} onValueChange={(value) => updateConfig('fontFamily', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                      <SelectItem value="-apple-system, BlinkMacSystemFont, sans-serif">System Default</SelectItem>
                      <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                      <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                      <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showLogo">Show Company Logo</Label>
                    <Switch
                      id="showLogo"
                      checked={config.showCompanyLogo}
                      onCheckedChange={(checked) => updateConfig('showCompanyLogo', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showPowered">Show "Powered by HirePlan"</Label>
                    <Switch
                      id="showPowered"
                      checked={config.showPoweredBy}
                      onCheckedChange={(checked) => updateConfig('showPoweredBy', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {config.companyId ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <iframe
                    src={`/api/v1/widget/preview?companyId=${config.companyId}&theme=${config.theme}&limit=${config.limit}`}
                    width="100%"
                    height="600"
                    frameBorder="0"
                    className="rounded-lg"
                    title="Widget Preview"
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configure your widget settings to see the preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {embedTypes.map(type => {
              const IconComponent = type.icon;
              return (
                <Card key={type.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <div>
                          <CardTitle className="text-sm">{type.name}</CardTitle>
                          <p className="text-xs text-gray-600">{type.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(embedCodes[type.id]?.embedCode || '')}
                          disabled={!embedCodes[type.id]}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadCode(
                            embedCodes[type.id]?.embedCode || '',
                            `hireplan-widget-${type.id}.${type.id === 'react' ? 'jsx' : type.id === 'vue' ? 'vue' : 'html'}`
                          )}
                          disabled={!embedCodes[type.id]}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {embedCodes[type.id] ? (
                      <Textarea
                        value={embedCodes[type.id].embedCode}
                        readOnly
                        className="font-mono text-xs bg-gray-50 resize-none"
                        rows={6}
                      />
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-xs">
                        {loading ? 'Generating...' : 'Configure widget to generate code'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integration Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <h4 className="font-medium">Quick Start:</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Copy the "Auto-Initialize" embed code above</li>
                  <li>Paste it into your HTML where you want jobs to appear</li>
                  <li>The widget will automatically load and display your job listings</li>
                </ol>
              </div>
              
              <div className="text-sm space-y-2">
                <h4 className="font-medium">Advanced Options:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li><strong>Manual Setup:</strong> For full programmatic control</li>
                  <li><strong>iframe Embed:</strong> Maximum isolation from your site's CSS</li>
                  <li><strong>Framework Components:</strong> Ready-to-use React and Vue components</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <WidgetDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WidgetSettings;
