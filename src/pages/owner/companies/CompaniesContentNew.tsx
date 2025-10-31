import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Building2,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Users,
  Briefcase,
  Award,
  CreditCard,
  Shield,
  Globe,
  MapPin,
  Calendar,
  Check,
  X,
  Edit2,
  Save,
  Loader2,
  Mail,
  Sparkles
} from 'lucide-react';
import { ownerManagementService } from '@/http/owner';
import type { Company, User as CompanyUser } from '@/http/owner';
import { toast } from 'sonner';

const CompaniesContentNew: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<{ companyId: string; field: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Company users cache
  const [companyUsers, setCompanyUsers] = useState<Record<string, CompanyUser[]>>({});
  const [companyJobs, setCompanyJobs] = useState<Record<string, any[]>>({});

  // Create form state
  const [newCompany, setNewCompany] = useState({
    companyName: '',
    websiteUrl: '',
    industry: '',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    planId: 'professional' as 'starter' | 'professional' | 'enterprise',
    customMonthlyPrice: 149,
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const data = await ownerManagementService.getAllCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanyUsers = async (companyId: string) => {
    if (companyUsers[companyId]) return; // Already loaded
    
    try {
      const users = await ownerManagementService.getAllUsers(companyId);
      setCompanyUsers(prev => ({ ...prev, [companyId]: users }));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCompanyJobs = async (companyId: string) => {
    if (companyJobs[companyId]) return; // Already loaded
    
    try {
      const jobs = await ownerManagementService.getCompanyJobs(companyId);
      setCompanyJobs(prev => ({ ...prev, [companyId]: jobs }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const toggleExpand = (companyId: string) => {
    const newExpandedId = expandedCompanyId === companyId ? null : companyId;
    setExpandedCompanyId(newExpandedId);
    
    if (newExpandedId) {
      fetchCompanyUsers(newExpandedId);
      fetchCompanyJobs(newExpandedId);
    }
  };

  const handleUpdateCompany = async (companyId: string, field: string, value: any) => {
    try {
      await ownerManagementService.updateCompanySettings(companyId, {
        [field]: value
      });
      
      // Update local state
      setCompanies(companies.map(c => 
        c.id === companyId ? { ...c, [field]: value } : c
      ));
      
      setEditingField(null);
      toast.success('Updated successfully');
    } catch (error: any) {
      console.error('Error updating company:', error);
      toast.error('Failed to update');
    }
  };

  const handleCreateCompany = async () => {
    if (!newCompany.companyName || !newCompany.adminEmail || !newCompany.adminFirstName || !newCompany.adminLastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);
      const result = await ownerManagementService.createCompany(newCompany);
      
      toast.success(
        <div>
          <p className="font-semibold">Company created!</p>
          <p className="text-xs mt-1">Invitation sent to {result.admin.email}</p>
        </div>
      );
      
      await fetchCompanies();
      setShowCreateForm(false);
      setNewCompany({
        companyName: '',
        websiteUrl: '',
        industry: '',
        adminEmail: '',
        adminFirstName: '',
        adminLastName: '',
        planId: 'professional',
        customMonthlyPrice: 149,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create company');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Companies
          </h1>
          <p className="text-slate-600 mt-1">Manage organizations and their settings</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Company
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Companies</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{companies.length}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Active</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {companies.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Paid Plans</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {companies.filter(c => c.customMonthlyPrice && c.customMonthlyPrice > 0).length}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-xl">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search companies by name or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base border-gray-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Company Inline Form */}
      {showCreateForm && (
        <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create New Company</h3>
                  <p className="text-sm text-gray-600">Add a new organization to the platform</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Info */}
              <div className="space-y-4 bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company Information
                </h4>
                <div>
                  <Label className="text-xs">Company Name *</Label>
                  <Input
                    value={newCompany.companyName}
                    onChange={(e) => setNewCompany({ ...newCompany, companyName: e.target.value })}
                    placeholder="Acme Inc."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Website URL</Label>
                  <Input
                    value={newCompany.websiteUrl}
                    onChange={(e) => setNewCompany({ ...newCompany, websiteUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Industry</Label>
                  <Input
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                    placeholder="Technology"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Admin User */}
              <div className="space-y-4 bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Admin User *
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">First Name *</Label>
                    <Input
                      value={newCompany.adminFirstName}
                      onChange={(e) => setNewCompany({ ...newCompany, adminFirstName: e.target.value })}
                      placeholder="John"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Last Name *</Label>
                    <Input
                      value={newCompany.adminLastName}
                      onChange={(e) => setNewCompany({ ...newCompany, adminLastName: e.target.value })}
                      placeholder="Doe"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Email *</Label>
                  <Input
                    type="email"
                    value={newCompany.adminEmail}
                    onChange={(e) => setNewCompany({ ...newCompany, adminEmail: e.target.value })}
                    placeholder="john@example.com"
                    className="mt-1"
                  />
                </div>
                
                {/* Plan & Pricing */}
                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Plan
                      </Label>
                      <select
                        value={newCompany.planId}
                        onChange={(e) => setNewCompany({ ...newCompany, planId: e.target.value as any })}
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="starter">Starter</option>
                        <option value="professional">Professional</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Monthly Price
                      </Label>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm text-gray-500">$</span>
                        <Input
                          type="number"
                          value={newCompany.customMonthlyPrice || ''}
                          onChange={(e) => setNewCompany({ ...newCompany, customMonthlyPrice: e.target.value ? parseFloat(e.target.value) : 0 })}
                          placeholder="149"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCompany}
                disabled={isCreating}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create Company
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Companies List */}
      <div className="space-y-3">
        {filteredCompanies.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No companies found</p>
            </CardContent>
          </Card>
        ) : (
          filteredCompanies.map((company) => {
            const isExpanded = expandedCompanyId === company.id;
            const users = companyUsers[company.id] || [];
            const jobs = companyJobs[company.id] || [];

            return (
              <Card 
                key={company.id} 
                className={`border-0 shadow-md hover:shadow-lg transition-all duration-200 ${
                  isExpanded ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <CardContent className="p-0">
                  {/* Company Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(company.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {company.companyName}
                            </h3>
                            {company.status === 'active' && (
                              <Badge className="bg-green-100 text-green-800 border-0">
                                Active
                              </Badge>
                            )}
                            {company.planId && (
                              <Badge className="bg-purple-100 text-purple-800 border-0 capitalize">
                                {company.planId}
                              </Badge>
                            )}
                            {company.customMonthlyPrice && company.customMonthlyPrice > 0 && (
                              <Badge className="bg-blue-100 text-blue-800 border-0">
                                ${company.customMonthlyPrice}/mo
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {company.industry && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {company.industry}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              ID: {company.organizationId}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50">
                      <div className="p-6 space-y-6">
                        {/* Plan & Billing Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Plan */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-purple-600" />
                                <span className="font-semibold text-sm">Plan Tier</span>
                              </div>
                              {editingField?.companyId === company.id && editingField?.field === 'planId' ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingField(null)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingField({ companyId: company.id, field: 'planId' });
                                  }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            
                            {editingField?.companyId === company.id && editingField?.field === 'planId' ? (
                              <select
                                defaultValue={company.planId || 'starter'}
                                onChange={(e) => handleUpdateCompany(company.id, 'planId', e.target.value)}
                                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500"
                                autoFocus
                              >
                                <option value="starter">Starter</option>
                                <option value="professional">Professional</option>
                                <option value="enterprise">Enterprise</option>
                              </select>
                            ) : (
                              <div>
                                <p className="text-2xl font-bold text-purple-600 capitalize">
                                  {company.planId || 'Starter'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {company.planId === 'enterprise' && 'Full feature access'}
                                  {company.planId === 'professional' && 'AI features enabled'}
                                  {(!company.planId || company.planId === 'starter') && 'Basic features'}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Monthly Price */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-green-600" />
                                <span className="font-semibold text-sm">Monthly Billing</span>
                              </div>
                              {editingField?.companyId === company.id && editingField?.field === 'customMonthlyPrice' ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingField(null)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingField({ companyId: company.id, field: 'customMonthlyPrice' });
                                  }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            
                            {editingField?.companyId === company.id && editingField?.field === 'customMonthlyPrice' ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">$</span>
                                <Input
                                  type="number"
                                  defaultValue={company.customMonthlyPrice || ''}
                                  onBlur={(e) => {
                                    const value = e.target.value ? parseFloat(e.target.value) : null;
                                    handleUpdateCompany(company.id, 'customMonthlyPrice', value);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const value = (e.target as HTMLInputElement).value;
                                      handleUpdateCompany(company.id, 'customMonthlyPrice', value ? parseFloat(value) : null);
                                    }
                                  }}
                                  placeholder="149"
                                  className="border-green-300 focus:ring-green-500"
                                  autoFocus
                                />
                                <span className="text-sm text-gray-500">/mo</span>
                              </div>
                            ) : (
                              <div>
                                <p className="text-2xl font-bold text-green-600">
                                  {company.customMonthlyPrice && company.customMonthlyPrice > 0
                                    ? `$${company.customMonthlyPrice}/mo`
                                    : 'Free'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {company.customMonthlyPrice && company.customMonthlyPrice > 0
                                    ? 'Billed via Stripe'
                                    : 'No billing'}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Max Jobs */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold text-sm">Job Limit</span>
                              </div>
                              {editingField?.companyId === company.id && editingField?.field === 'maxJobPostings' ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingField(null)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingField({ companyId: company.id, field: 'maxJobPostings' });
                                  }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            
                            {editingField?.companyId === company.id && editingField?.field === 'maxJobPostings' ? (
                              <Input
                                type="number"
                                defaultValue={company.maxJobPostings || ''}
                                onBlur={(e) => {
                                  const value = e.target.value ? parseInt(e.target.value) : null;
                                  handleUpdateCompany(company.id, 'maxJobPostings', value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const value = (e.target as HTMLInputElement).value;
                                    handleUpdateCompany(company.id, 'maxJobPostings', value ? parseInt(value) : null);
                                  }
                                }}
                                placeholder="Unlimited"
                                className="border-blue-300 focus:ring-blue-500"
                                autoFocus
                              />
                            ) : (
                              <div>
                                <p className="text-2xl font-bold text-blue-600">
                                  {company.maxJobPostings || '∞'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {company.maxJobPostings ? 'jobs/month' : 'Unlimited'}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Users className="w-4 h-4 text-indigo-600" />
                                  <span className="font-semibold text-sm text-indigo-900">Team Members</span>
                                </div>
                                <p className="text-2xl font-bold text-indigo-600">{users.length}</p>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Briefcase className="w-4 h-4 text-indigo-600" />
                                  <span className="font-semibold text-sm text-indigo-900">Active Jobs</span>
                                </div>
                                <p className="text-2xl font-bold text-indigo-600">{jobs.length}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Users Table */}
                        {users.length > 0 && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Team Members
                            </h4>
                            <div className="space-y-2">
                              {users.map((user) => (
                                <div 
                                  key={user.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-semibold">
                                        {user.firstName[0]}{user.lastName[0]}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm text-gray-900">
                                        {user.firstName} {user.lastName}
                                      </p>
                                      <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {user.email}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {user.role}
                                    </Badge>
                                    {user.status === 'active' && (
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Jobs Preview */}
                        {jobs.length > 0 && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              Active Jobs
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {jobs.slice(0, 6).map((job) => (
                                <div 
                                  key={job.id}
                                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <p className="font-medium text-sm text-gray-900 truncate">
                                    {job.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {job.status}
                                    </Badge>
                                    {job.location && (
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {job.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {jobs.length > 6 && (
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                +{jobs.length - 6} more jobs
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CompaniesContentNew;

