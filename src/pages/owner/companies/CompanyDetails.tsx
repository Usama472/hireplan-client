import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Users,
  Calendar,
  Briefcase,
  X,
  Loader2,
  Shield,
  Save,
  Edit
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import type { Company, User } from '@/http/owner';
import { ownerManagementService } from '@/http/owner';

interface CompanyDetailsProps {
  company: Company;
  onClose: () => void;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({ company, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'users' | 'jobs'>('info');
  
  // Max Job Postings state
  const [maxJobPostings, setMaxJobPostings] = useState<string>(
    company.maxJobPostings !== null && company.maxJobPostings !== undefined 
      ? company.maxJobPostings.toString() 
      : ''
  );
  const [isEditingMaxJobs, setIsEditingMaxJobs] = useState(false);
  const [isSavingMaxJobs, setIsSavingMaxJobs] = useState(false);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchCompanyUsers();
    } else if (activeTab === 'jobs') {
      fetchCompanyJobs();
    }
  }, [activeTab]);

  const fetchCompanyUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const usersData = await ownerManagementService.getAllUsers(company.id);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchCompanyJobs = async () => {
    try {
      setIsLoadingJobs(true);
      const jobsData = await ownerManagementService.getCompanyJobs(company.id);
      setJobs(jobsData);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleSaveMaxJobPostings = async () => {
    try {
      setIsSavingMaxJobs(true);
      
      // Convert to number or null
      const value = maxJobPostings === '' ? null : parseInt(maxJobPostings, 10);
      
      if (value !== null && (isNaN(value) || value < 0)) {
        toast.error('Please enter a valid number (0 or greater) or leave empty for unlimited');
        return;
      }
      
      // Make API call to update
      const apiUrl = import.meta.env.VITE_API_URL || 'https://hireplan.co/api/v1';
      const token = localStorage.getItem('access_token');
      
      await axios.put(
        `${apiUrl}/company/${company.id}/max-job-postings`,
        { maxJobPostings: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Job posting limit ${value === null ? 'removed (unlimited)' : `set to ${value}`}`);
      setIsEditingMaxJobs(false);
      
      // Update local company data
      company.maxJobPostings = value;
    } catch (error: any) {
      console.error('Error updating max job postings:', error);
      toast.error(error?.response?.data?.message || 'Failed to update job posting limit');
    } finally {
      setIsSavingMaxJobs(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Building2 className="w-6 h-6 mr-3 text-blue-600" />
                {company.companyName}
              </CardTitle>
              <CardDescription className="mt-2">
                Organization ID: {company.organizationId} • Created {new Date(company.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <Button
              variant={activeTab === 'info' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('info')}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Company Info
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-4 h-4 mr-2" />
              Users {users.length > 0 && `(${users.length})`}
            </Button>
            <Button
              variant={activeTab === 'jobs' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('jobs')}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Jobs {jobs.length > 0 && `(${jobs.length})`}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-6">
          {/* Company Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-500 flex items-center mb-2">
                    <Building2 className="w-4 h-4 mr-2" />
                    Industry
                  </label>
                  <p className="font-medium text-lg">{company.industry || 'Not specified'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-500 flex items-center mb-2">
                    <Users className="w-4 h-4 mr-2" />
                    Company Size
                  </label>
                  <p className="font-medium text-lg">{company.companySize || 'Not specified'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-500 flex items-center mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created Date
                  </label>
                  <p className="font-medium text-lg">
                    {new Date(company.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Status</label>
                  {company.status === 'active' && (
                    <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">Active</Badge>
                  )}
                  {company.status === 'suspended' && (
                    <Badge className="bg-red-100 text-red-800 text-sm px-3 py-1">Suspended</Badge>
                  )}
                  {company.status === 'inactive' && (
                    <Badge className="bg-gray-100 text-gray-800 text-sm px-3 py-1">Inactive</Badge>
                  )}
                </div>
              </div>

              {/* Max Job Postings Section */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Monthly Job Posting Limit</h3>
                      <p className="text-sm text-gray-600">Control maximum job postings per month for this company</p>
                    </div>
                  </div>
                  {!isEditingMaxJobs && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingMaxJobs(true)}
                      className="flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Limit
                    </Button>
                  )}
                </div>

                {isEditingMaxJobs ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Input
                        type="number"
                        min="0"
                        placeholder="Leave empty for unlimited"
                        value={maxJobPostings}
                        onChange={(e) => setMaxJobPostings(e.target.value)}
                        className="h-10"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Set monthly limit (resets on 1st of each month) or leave empty for unlimited
                      </p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveMaxJobPostings}
                      disabled={isSavingMaxJobs}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSavingMaxJobs ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingMaxJobs(false);
                        setMaxJobPostings(
                          company.maxJobPostings !== null && company.maxJobPostings !== undefined
                            ? company.maxJobPostings.toString()
                            : ''
                        );
                      }}
                      disabled={isSavingMaxJobs}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Current Limit:</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {company.maxJobPostings !== null && company.maxJobPostings !== undefined
                          ? company.maxJobPostings
                          : '∞'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {company.maxJobPostings !== null && company.maxJobPostings !== undefined
                          ? `${company.maxJobPostings} job posting${company.maxJobPostings !== 1 ? 's' : ''} per month`
                          : 'Unlimited job postings'}
                      </p>
                    </div>
                    {jobs.length > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">Total Jobs:</p>
                        <p className="text-xl font-semibold text-gray-900">{jobs.length}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          All time
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No users found for this company</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.status === 'active' && (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          )}
                          {user.status === 'suspended' && (
                            <Badge className="bg-red-100 text-red-800">Suspended</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div>
              {isLoadingJobs ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No jobs posted by this company yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Employment Type</TableHead>
                      <TableHead>Experience Level</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>
                          {job.status === 'active' && (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          )}
                          {job.status === 'paused' && (
                            <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
                          )}
                          {job.status === 'closed' && (
                            <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
                          )}
                          {job.status === 'draft' && (
                            <Badge className="bg-blue-100 text-blue-800">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {job.priority === 'urgent' && (
                            <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                          )}
                          {job.priority === 'high' && (
                            <Badge className="bg-orange-100 text-orange-800">High</Badge>
                          )}
                          {job.priority === 'medium' && (
                            <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                          )}
                          {job.priority === 'low' && (
                            <Badge className="bg-green-100 text-green-800">Low</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{job.location || 'Remote'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.employmentType || 'Full-time'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.experienceLevel || 'Mid'}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>

        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompanyDetails;
