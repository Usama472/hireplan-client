import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Users,
  Plus,
  Brain,
  Briefcase
} from 'lucide-react';
import { ownerManagementService } from '@/http/owner';
import type { Company } from '@/http/owner';
import CompanyDetails from './CompanyDetails';
import CreateCompanyDialog from './CreateCompanyDialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CompaniesContent: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [maxActiveJobs, setMaxActiveJobs] = useState<number | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, []);

  // Pre-populate settings dialog when company is selected
  useEffect(() => {
    if (selectedCompany && showSettingsDialog) {
      setSelectedPlan(selectedCompany.planId || 'professional');
      setCustomPrice(selectedCompany.customMonthlyPrice !== null && selectedCompany.customMonthlyPrice !== undefined 
        ? selectedCompany.customMonthlyPrice 
        : null);
      setMaxActiveJobs(selectedCompany.maxJobPostings !== null && selectedCompany.maxJobPostings !== undefined
        ? selectedCompany.maxJobPostings
        : null);
    }
  }, [selectedCompany, showSettingsDialog]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const companiesData = await ownerManagementService.getAllCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await ownerManagementService.getAllUsers();
      setTotalUsers(usersData.length);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedCompany) return;

    setIsSavingSettings(true);
    try {
      await ownerManagementService.updateCompanySettings(selectedCompany.id, {
        planId: selectedPlan,
        customMonthlyPrice: customPrice,
        maxJobPostings: maxActiveJobs,
      });
      
      toast.success('Company settings updated successfully!');
      setShowSettingsDialog(false);
      await fetchCompanies();
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Companies</h1>
          <p className="text-slate-600">Manage and monitor all companies</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Company
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{companies.length}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">All registered</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {companies.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-green-600 font-medium mt-1">
              {companies.length > 0 ? Math.round((companies.filter(c => c.status === 'active').length / companies.length) * 100) : 0}% active
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Suspended</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {companies.filter(c => c.status === 'suspended').length}
            </div>
            <p className="text-xs text-red-600 font-medium mt-1">Need review</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalUsers}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">Platform-wide</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <CardDescription>
            {filteredCompanies.length} of {companies.length} companies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{company.companyName}</div>
                      <div className="text-sm text-gray-500">ID: {company.organizationId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{company.industry || 'N/A'}</TableCell>
                  <TableCell>{company.companySize || 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(company.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowDetailsDialog(true);
                        }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCompany(company);
                          setSelectedPlan((company as any).planId || 'professional');
                          setCustomPrice((company as any).customMonthlyPrice || null);
                          setMaxActiveJobs((company as any).maxJobPostings || null);
                          setShowSettingsDialog(true);
                        }}
                        title="Manage Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Company Details Dialog */}
      {showDetailsDialog && selectedCompany && (
        <CompanyDetails
          company={selectedCompany}
          onClose={() => {
            setShowDetailsDialog(false);
            setSelectedCompany(null);
          }}
        />
      )}

      {/* Create Company Dialog */}
      <CreateCompanyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          fetchCompanies();
          fetchUsers();
        }}
      />

      {/* Company Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Company Settings</DialogTitle>
            <DialogDescription>
              Manage AI features and custom pricing for {selectedCompany?.companyName}
            </DialogDescription>
          </DialogHeader>

          {/* Current Settings Display */}
          {selectedCompany && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-700 mb-3">Current Settings:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-md p-3">
                  <p className="text-xs text-gray-500 mb-1">Plan</p>
                  <p className="font-semibold text-sm text-purple-600 capitalize">
                    {selectedCompany.planId || 'Starter'}
                  </p>
                </div>
                <div className="bg-white rounded-md p-3">
                  <p className="text-xs text-gray-500 mb-1">Monthly Price</p>
                  <p className="font-semibold text-sm text-green-600">
                    {selectedCompany.customMonthlyPrice !== null && selectedCompany.customMonthlyPrice !== undefined
                      ? `$${selectedCompany.customMonthlyPrice}/mo`
                      : 'Free'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6 py-4">
            {/* Plan Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <Label className="text-base font-semibold">Subscription Plan</Label>
              </div>
              <Select value={selectedPlan} onValueChange={(value: any) => setSelectedPlan(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">
                    <div className="flex flex-col items-start py-1">
                      <span className="font-semibold">Starter</span>
                      <span className="text-xs text-gray-500">Basic features only</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="professional">
                    <div className="flex flex-col items-start py-1">
                      <span className="font-semibold">Professional</span>
                      <span className="text-xs text-gray-500">Includes AI features</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="enterprise">
                    <div className="flex flex-col items-start py-1">
                      <span className="font-semibold">Enterprise</span>
                      <span className="text-xs text-gray-500">Full platform access</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Plan determines feature access (set custom price below)
              </p>
            </div>

            {/* Monthly Billing Rate */}
            <div className="space-y-2">
              <Label htmlFor="custom-price" className="text-base font-semibold">
                Monthly Billing Rate (Stripe)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-semibold">$</span>
                <Input
                  id="custom-price"
                  type="number"
                  min="0"
                  step="1"
                  value={customPrice || ''}
                  onChange={(e) => setCustomPrice(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="149"
                  className="flex-1"
                />
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-xs text-gray-500">
                User will be auto-billed this amount monthly via Stripe (0 = no billing)
              </p>
            </div>

            {/* Max Active Jobs */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <Label htmlFor="max-jobs" className="text-base font-semibold">Max Active Jobs</Label>
              </div>
              <Input
                id="max-jobs"
                type="number"
                min="0"
                step="1"
                value={maxActiveJobs || ''}
                onChange={(e) => setMaxActiveJobs(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Unlimited"
              />
              <p className="text-xs text-gray-500">
                Maximum active job postings allowed (0 or blank = unlimited)
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">How It Works</p>
                  <ul className="space-y-1">
                    <li>• Plan determines feature access (Starter/Professional/Enterprise)</li>
                    <li>• Set custom monthly rate for this company</li>
                    <li>• User adds payment method in their profile</li>
                    <li>• Stripe auto-bills monthly at your custom rate</li>
                    {selectedCompany && selectedCompany.customMonthlyPrice && selectedCompany.customMonthlyPrice > 0 && (
                      <li className="font-semibold text-blue-900 mt-2">
                        💳 Currently: {selectedCompany.companyName} will be billed ${selectedCompany.customMonthlyPrice}/month
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSettingsDialog(false);
                // Reset to current values on cancel
                if (selectedCompany) {
                  setSelectedPlan(selectedCompany.planId || 'professional');
                  setCustomPrice(selectedCompany.customMonthlyPrice !== null && selectedCompany.customMonthlyPrice !== undefined 
                    ? selectedCompany.customMonthlyPrice 
                    : null);
                  setMaxActiveJobs(selectedCompany.maxJobPostings !== null && selectedCompany.maxJobPostings !== undefined
                    ? selectedCompany.maxJobPostings
                    : null);
                }
              }}
              disabled={isSavingSettings}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
            >
              {isSavingSettings ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompaniesContent;
