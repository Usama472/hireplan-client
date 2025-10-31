import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Users,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Mail,
  Building2,
  Shield,
  Calendar,
  Activity,
  Check,
  X,
  Loader2,
  UserCircle,
  Sparkles,
  Ban,
  CheckCircle
} from 'lucide-react';
import { ownerManagementService, type User } from '@/http/owner';
import { toast } from 'sonner';

const UsersContentNew: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyId: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersData, companiesData] = await Promise.all([
        ownerManagementService.getAllUsers(),
        ownerManagementService.getAllCompanies()
      ]);
      setUsers(usersData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await ownerManagementService.suspendUser(userId, 'Suspended by admin');
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'suspended' } : u));
      toast.success('User suspended');
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await ownerManagementService.activateUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'active' } : u));
      toast.success('User activated');
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.companyId || !newUser.firstName || !newUser.lastName || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);
      const result = await ownerManagementService.createUserForCompany(newUser);
      
      toast.success(
        <div>
          <p className="font-semibold">User created!</p>
          <p className="text-xs mt-1">Invitation sent to {result.user.email}</p>
        </div>
      );
      
      await fetchData();
      setShowCreateForm(false);
      setNewUser({ firstName: '', lastName: '', email: '', companyId: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const groupedByCompany = filteredUsers.reduce((acc, user) => {
    const companyName = user.company?.companyName || 'Unknown Company';
    if (!acc[companyName]) {
      acc[companyName] = [];
    }
    acc[companyName].push(user);
    return acc;
  }, {} as Record<string, User[]>);

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
            Users
          </h1>
          <p className="text-slate-600 mt-1">Manage all platform users</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New User
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Users</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Active</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Suspended</p>
                <p className="text-3xl font-bold text-red-900 mt-2">
                  {users.filter(u => u.status === 'suspended').length}
                </p>
              </div>
              <div className="p-3 bg-red-500 rounded-xl">
                <Ban className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Companies</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {new Set(users.map(u => u.company?.companyName)).size}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base border-gray-200"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 h-12 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 text-base"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Create User Inline Form */}
      {showCreateForm && (
        <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
                  <p className="text-sm text-gray-600">Add a user to an existing company</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">First Name *</Label>
                  <Input
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    placeholder="John"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Last Name *</Label>
                  <Input
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    placeholder="Doe"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Email *</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Company *</Label>
                  <select
                    value={newUser.companyId}
                    onChange={(e) => setNewUser({ ...newUser, companyId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select company...</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateUser}
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
                    Create User
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Grouped by Company */}
      <div className="space-y-4">
        {Object.keys(groupedByCompany).length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No users found</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedByCompany).map(([companyName, companyUsers]) => (
            <Card key={companyName} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{companyName}</h3>
                      <p className="text-sm text-gray-500">{companyUsers.length} user{companyUsers.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companyUsers.map((user) => (
                    <div 
                      key={user.id}
                      className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {user.status === 'active' ? (
                            <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 border-0 text-xs">
                              {user.status}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        
                        {user.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSuspendUser(user.id)}
                            className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleActivateUser(user.id)}
                            className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>

                      {user.lastLogin && (
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Last login: {new Date(user.lastLogin).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default UsersContentNew;

