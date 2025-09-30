import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Star, 
  CheckCircle, 
  Mail, 
  Video, 
  MessageSquare, 
  Brain, 
  Calendar,
  Bell,
  XCircle,
  Zap,
  Filter,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import API from '@/http';
import type { AutomationTemplate, TemplateCategory } from '@/types/automation-templates';

const iconMap = {
  Mail,
  Video,
  MessageSquare,
  Brain,
  Calendar,
  Bell,
  CheckCircle,
  XCircle,
  Zap
};

const colorMap = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  orange: 'bg-orange-500 text-white',
  purple: 'bg-purple-500 text-white',
  red: 'bg-red-500 text-white',
  indigo: 'bg-indigo-500 text-white',
  teal: 'bg-teal-500 text-white',
  yellow: 'bg-yellow-500 text-white'
};

interface AutomationTemplateLibraryProps {
  onTemplateActivated?: () => void;
}

export function AutomationTemplateLibrary({ onTemplateActivated }: AutomationTemplateLibraryProps) {
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null);
  const [activatingTemplate, setActivatingTemplate] = useState<string | null>(null);
  const [templateStatuses, setTemplateStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = selectedCategory === 'all' ? {} : { category: selectedCategory };
      const response = await API.automationTemplates.getTemplates(params);
      console.log('Templates API response:', response);
      
      if (response.success) {
        setTemplates(response.data.templates);
        setCategories(response.data.categories);
        console.log('Templates loaded:', response.data.templates.length);
        
        // Load status for each template
        const statuses: Record<string, boolean> = {};
        await Promise.all(
          response.data.templates.map(async (template) => {
            try {
              const statusResponse = await API.automationTemplates.getTemplateStatus(template.id);
              if (statusResponse.success) {
                statuses[template.id] = statusResponse.data.isActive;
              }
            } catch (error) {
              console.error(`Error loading status for template ${template.id}:`, error);
              statuses[template.id] = false;
            }
          })
        );
        setTemplateStatuses(statuses);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load automation templates');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTemplate = async (template: AutomationTemplate) => {
    try {
      setActivatingTemplate(template.id);
      
      const response = await API.automationTemplates.createFromTemplate(template.id);
      
      if (response.success) {
        toast.success(`${template.name} automation activated successfully!`);
        setTemplateStatuses(prev => ({ ...prev, [template.id]: true }));
        onTemplateActivated?.();
      }
    } catch (error: any) {
      console.error('Error activating template:', error);
      
      if (error.response?.status === 409) {
        toast.error('This automation is already active for your company');
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message || error.message || 'Invalid request data';
        toast.error(`Failed to activate template: ${message}`);
      } else {
        const message = error.response?.data?.message || error.message || 'Unknown error occurred';
        toast.error(`Failed to activate automation template: ${message}`);
      }
    } finally {
      setActivatingTemplate(null);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const popularTemplates = templates.filter(t => t.isPopular);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <Zap className="h-5 w-5" />;
  };

  const getColorClass = (color: string) => {
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-500 text-white';
  };

  const TemplateCard = ({ template }: { template: AutomationTemplate }) => {
    const isActive = templateStatuses[template.id];
    const isActivating = activatingTemplate === template.id;

    return (
      <Card className={`cursor-pointer transition-all hover:shadow-md ${isActive ? 'ring-2 ring-green-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getColorClass(template.color)}`}>
                {getIcon(template.icon)}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {template.name}
                  {template.isPopular && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {isActive && (
                    <Badge variant="default" className="text-xs bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {template.description}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1 mb-4">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {template.estimatedUsage && (
            <div className="text-sm text-gray-600 mb-3">
              Usage: {template.estimatedUsage}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTemplate(template)}
              className="flex-1"
            >
              View Details
            </Button>
            
            {!isActive ? (
              <Button
                size="sm"
                onClick={() => handleActivateTemplate(template)}
                disabled={isActivating}
                className="flex-1"
              >
                {isActivating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Activating...
                  </>
                ) : (
                  'Activate'
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                disabled
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Active
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading automation templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automation Template Library</h2>
          <p className="text-gray-600">Choose from pre-built automation workflows to get started quickly</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Popular Templates Section */}
      {popularTemplates.length > 0 && selectedCategory === 'all' && !searchTerm && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Popular Templates</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({templates.length})</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.category} value={category.category}>
              {category.label} ({category.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'No templates available in this category'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Detail Modal */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getColorClass(selectedTemplate.color)}`}>
                    {getIcon(selectedTemplate.icon)}
                  </div>
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      {selectedTemplate.name}
                      {selectedTemplate.isPopular && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription>{selectedTemplate.description}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <ScrollArea className="max-h-96">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Category</h4>
                    <Badge variant="outline">{selectedTemplate.category}</Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {selectedTemplate.estimatedUsage && (
                    <div>
                      <h4 className="font-medium mb-2">Estimated Usage</h4>
                      <p className="text-sm text-gray-600">{selectedTemplate.estimatedUsage}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium mb-2">Trigger</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">{selectedTemplate.trigger.type}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Actions ({selectedTemplate.actions.length})</h4>
                    <div className="space-y-2">
                      {selectedTemplate.actions.map((action, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium">{action.type}</p>
                          {action.conditions && action.conditions.length > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                              Conditions: {action.conditions.length} rule(s)
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedTemplate(null)} className="flex-1">
                  Close
                </Button>
                
                {!templateStatuses[selectedTemplate.id] ? (
                  <Button
                    onClick={() => {
                      handleActivateTemplate(selectedTemplate);
                      setSelectedTemplate(null);
                    }}
                    disabled={activatingTemplate === selectedTemplate.id}
                    className="flex-1"
                  >
                    {activatingTemplate === selectedTemplate.id ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      'Activate Template'
                    )}
                  </Button>
                ) : (
                  <Button variant="secondary" disabled className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Already Active
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
