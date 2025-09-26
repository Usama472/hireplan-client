import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  MessageSquare,
  Hash,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import API from '@/http';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import {
  SMS_CATEGORIES,
  type SMSTemplate,
  type SMSTemplateListResponse,
} from '@/interfaces/sms';

interface SMSTemplateListProps {
  onSelectTemplate?: (template: SMSTemplate) => void;
  selectionMode?: boolean;
  className?: string;
}

export default function SMSTemplateList({
  onSelectTemplate,
  selectionMode = false,
  className,
}: SMSTemplateListProps) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<SMSTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SMSTemplate | null>(null);

  const limit = 20;

  useEffect(() => {
    fetchTemplates();
  }, [page, searchTerm, categoryFilter, statusFilter]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
        sortBy: 'createdAt:desc',
      };

      if (searchTerm) {
        // Note: Backend would need to support search
        params.search = searchTerm;
      }
      
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      
      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active';
      }

      const response: SMSTemplateListResponse = await API.sms.getSMSTemplates(params);
      setTemplates(response.results);
      setTotalPages(response.totalPages);
      setTotalResults(response.totalResults);
    } catch (error) {
      console.error('Error fetching SMS templates:', error);
      toast.error('Failed to load SMS templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    navigate(ROUTES.DASHBOARD.CREATE_SMS_TEMPLATE);
  };

  const handleEditTemplate = (template: SMSTemplate) => {
    navigate(`${ROUTES.DASHBOARD.EDIT_SMS_TEMPLATE}/${template._id}`);
  };


  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await API.sms.deleteSMSTemplate(templateToDelete._id);
      toast.success('Template deleted successfully');
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async (template: SMSTemplate) => {
    try {
      const duplicateData = {
        name: `${template.name} (Copy)`,
        category: template.category,
        message: template.message,
        description: template.description,
        maxLength: template.maxLength,
        variables: template.variables,
      };
      await API.sms.createSMSTemplate(duplicateData);
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const handleToggleStatus = async (template: SMSTemplate) => {
    try {
      await API.sms.updateSMSTemplate(template._id, {
        isActive: !template.isActive,
      });
      toast.success(`Template ${template.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template status:', error);
      toast.error('Failed to update template status');
    }
  };

  const handleCreateDefaults = async () => {
    try {
      await API.sms.createDefaultSMSTemplates();
      toast.success('Default templates created successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error creating default templates:', error);
      toast.error('Failed to create default templates');
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryInfo = SMS_CATEGORIES.find(c => c.value === category);
    return (
      <Badge variant="outline">
        {categoryInfo?.label || category}
      </Badge>
    );
  };

  const getCharacterInfo = (template: SMSTemplate) => {
    const segmentCount = template.characterCount <= 160 ? 1 : Math.ceil(template.characterCount / 153);
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Hash className="h-3 w-3" />
          {template.characterCount}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {segmentCount}
        </span>
      </div>
    );
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Templates
              <Badge variant="secondary">{totalResults}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateDefaults}
                className="hidden md:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                Import Defaults
              </Button>
              <Button onClick={handleCreateTemplate} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {SMS_CATEGORIES.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchTemplates}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Templates Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Length</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse w-20" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse w-16" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse w-16" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse w-20" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No SMS templates found</p>
                        <Button onClick={handleCreateTemplate} size="sm">
                          Create your first template
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => (
                    <TableRow 
                      key={template._id}
                      className={selectionMode ? 'cursor-pointer hover:bg-muted/50' : ''}
                      onClick={selectionMode ? () => onSelectTemplate?.(template) : undefined}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCategoryBadge(template.category)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate font-mono text-sm">
                          {template.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getCharacterInfo(template)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {template.updatedAt ? format(new Date(template.updatedAt), 'MMM d, yyyy') : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {!selectionMode && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setPreviewTemplate(template)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(template)}>
                                {template.isActive ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setTemplateToDelete(template);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalResults)} of {totalResults} templates
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete SMS Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{previewTemplate.name}</DialogTitle>
              <DialogDescription>
                {getCategoryBadge(previewTemplate.category)} • {getCharacterInfo(previewTemplate)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Message Template</label>
                <div className="mt-1 p-3 bg-muted rounded-lg font-mono text-sm">
                  {previewTemplate.message}
                </div>
              </div>
              {previewTemplate.variables && previewTemplate.variables.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Variables</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {previewTemplate.variables.map((variable) => (
                      <Badge key={variable.key} variant="outline">
                        {variable.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
