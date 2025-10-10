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
  Users,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  Mail,
  Calendar,
  Shield,
  Activity,
  X
} from 'lucide-react';
import { ownerManagementService, type User } from '@/http/owner';

const UsersContent: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await ownerManagementService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
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

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      'admin': 'bg-purple-100 text-purple-800',
      'recruiter': 'bg-blue-100 text-blue-800',
      'manager': 'bg-indigo-100 text-indigo-800',
      'user': 'bg-gray-100 text-gray-800'
    };
    
    return <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
  };

  const handleSuspendUser = async (user: User) => {
    try {
      await ownerManagementService.suspendUser(user.id, 'Suspended by owner');
      await fetchUsers();
      setShowSuspendDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleActivateUser = async (user: User) => {
    try {
      await ownerManagementService.activateUser(user.id);
      await fetchUsers();
      setShowActivateDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  const handleBulkSuspend = async () => {
    try {
      await ownerManagementService.bulkSuspendUsers(selectedUsers, 'Bulk suspended by owner');
      await fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error bulk suspending users:', error);
    }
  };

  const handleBulkActivate = async () => {
    try {
      await ownerManagementService.bulkActivateUsers(selectedUsers);
      await fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error bulk activating users:', error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage and monitor all platform users</p>
          </div>
          {selectedUsers.length > 0 && (
            <div className="flex space-x-2">
              <Badge variant="secondary" className="px-3 py-1">
                {selectedUsers.length} selected
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600"
                onClick={handleBulkSuspend}
              >
                Suspend Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600"
                onClick={handleBulkActivate}
              >
                Activate Selected
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {users.length > 0 ? Math.round((users.filter(u => u.status === 'active').length / users.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'suspended').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => {
                if (!u.lastLogin) return false;
                const lastLogin = new Date(u.lastLogin);
                const today = new Date();
                return lastLogin.toDateString() === today.toDateString();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Logged in today
            </p>
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
                  placeholder="Search users..."
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                        {user.company?.companyName || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailsDialog(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowSuspendDialog(true);
                            }}
                            title="Suspend User"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowActivateDialog(true);
                            }}
                            title="Activate User"
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
          )}
        </CardContent>
      </Card>

      {/* Suspend User Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Suspend User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend {selectedUser?.firstName} {selectedUser?.lastName}?
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> Suspending this user will:
              <ul className="list-disc ml-4 mt-2 space-y-1 text-sm">
                <li>Prevent login access to the platform</li>
                <li>Disable all assigned tasks</li>
                <li>Remove from active workflows</li>
              </ul>
            </AlertDescription>
          </Alert>
          <DialogFooter className="flex space-x-2 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuspendDialog(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => selectedUser && handleSuspendUser(selectedUser)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate User Dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-700">
              <CheckCircle className="w-5 h-5 mr-2" />
              Activate User
            </DialogTitle>
            <DialogDescription>
              Reactivate {selectedUser?.firstName} {selectedUser?.lastName}?
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              <strong>This will:</strong>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Restore login access</li>
                <li>Reactivate assigned tasks</li>
                <li>Add back to workflows</li>
              </ul>
            </p>
          </div>
          <DialogFooter className="flex space-x-2 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowActivateDialog(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => selectedUser && handleActivateUser(selectedUser)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Activate User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-500 flex items-center mb-2">
                <Building2 className="w-4 h-4 mr-2" />
                Company
              </label>
              <p className="font-medium">{selectedUser?.company?.companyName || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-500 flex items-center mb-2">
                <Shield className="w-4 h-4 mr-2" />
                Role
              </label>
              {selectedUser && getRoleBadge(selectedUser.role)}
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-500 mb-2 block">Status</label>
              {selectedUser && getStatusBadge(selectedUser.status)}
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-500 flex items-center mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Last Login
              </label>
              <p className="font-medium text-sm">
                {selectedUser?.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-500 flex items-center mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Created
              </label>
              <p className="font-medium text-sm">
                {selectedUser && new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDetailsDialog(false);
              setSelectedUser(null);
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersContent;
