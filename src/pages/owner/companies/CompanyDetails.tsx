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
  Loader2
} from 'lucide-react';
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
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setIsLoadingJobs(false);
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
