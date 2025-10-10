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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Users
} from 'lucide-react';
import { ownerManagementService } from '@/http/owner';
import type { Company } from '@/http/owner';
import CompanyDetails from './CompanyDetails';

const CompaniesContent: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, []);

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

  const handleSuspendCompany = async (company: Company) => {
    try {
      await ownerManagementService.suspendCompany(company.id, 'Suspended by owner');
      await fetchCompanies();
      setShowSuspendDialog(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error('Error suspending company:', error);
    }
  };

  const handleActivateCompany = async (company: Company) => {
    try {
      await ownerManagementService.activateCompany(company.id);
      await fetchCompanies();
      setShowActivateDialog(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error('Error activating company:', error);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Companies</h1>
        <p className="text-slate-600">Manage and monitor all companies</p>
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
                      {company.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowSuspendDialog(true);
                          }}
                          title="Suspend Company"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => {
                            setSelectedCompany(company);
                            setShowActivateDialog(true);
                          }}
                          title="Activate Company"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Suspend Company
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend {selectedCompany?.companyName}?
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> Suspending this company will:
              <ul className="list-disc ml-4 mt-2 space-y-1 text-sm">
                <li>Prevent all users from accessing the platform</li>
                <li>Pause all active jobs</li>
                <li>Disable all automated processes</li>
              </ul>
            </AlertDescription>
          </Alert>
          <DialogFooter className="flex space-x-2 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuspendDialog(false);
                setSelectedCompany(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => selectedCompany && handleSuspendCompany(selectedCompany)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Suspend Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate Confirmation Dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              Activate Company
            </DialogTitle>
            <DialogDescription>
              Reactivate {selectedCompany?.companyName}?
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              <strong>This will:</strong>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Restore access for all users</li>
                <li>Reactivate all jobs</li>
                <li>Resume automated processes</li>
              </ul>
            </p>
          </div>
          <DialogFooter className="flex space-x-2 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowActivateDialog(false);
                setSelectedCompany(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => selectedCompany && handleActivateCompany(selectedCompany)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Activate Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </>
  );
};

export default CompaniesContent;
