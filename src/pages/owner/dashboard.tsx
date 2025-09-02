import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Lock, 
  Unlock,
  Crown,
  Search,
  Filter,
  MoreVertical,
  Ban,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  suspendedUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  monthlyRevenue: number;
  planDistribution: {
    starter: number;
    professional: number;
    enterprise: number;
  };
  recentSignups: number;
  churnRate: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  companyName: string;
  subscription?: {
    planId: string;
    planName: string;
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  };
  lastLogin?: Date;
  createdAt: Date;
}

const OwnerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const ownerToken = localStorage.getItem('ownerToken');

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, [page, statusFilter]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('https://hireplan.co/api/v1/owner/platform/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      });

      const response = await fetch(`https://hireplan.co/api/v1/owner/platform/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async (userId: string, lock: boolean) => {
    try {
      const action = lock ? 'lock' : 'unlock';
      const response = await fetch(`https://hireplan.co/api/v1/owner/platform/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Owner action from dashboard' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`User ${lock ? 'locked' : 'unlocked'} successfully`);
        fetchUsers();
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(`Failed to ${lock ? 'lock' : 'unlock'} user`);
    }
  };

  const handleCancelSubscription = async (userId: string) => {
    try {
      const response = await fetch(`https://hireplan.co/api/v1/owner/platform/users/${userId}/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ownerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Owner cancellation from dashboard' }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Subscription cancelled successfully');
        fetchUsers();
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      locked: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getPlanBadge = (planId: string) => {
    const variants = {
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-gold-100 text-gold-800',
    };
    return variants[planId as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading owner dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HirePlan Owner Portal</h1>
                <p className="text-sm text-gray-500">Platform Management Dashboard</p>
              </div>
            </div>
            <Button
              onClick={() => {
                localStorage.removeItem('ownerToken');
                window.location.href = '/owner/login';
              }}
              variant="outline"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} active, {stats.lockedUsers} locked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeSubscriptions} active subscriptions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentSignups}</div>
                <p className="text-xs text-muted-foreground">
                  New signups (7 days)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.churnRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Monthly churn rate
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>User Management</CardTitle>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="locked">Locked</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Company</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Plan</th>
                    <th className="text-left py-3 px-4">Last Login</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">{user.companyName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusBadge(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.subscription ? (
                          <Badge className={getPlanBadge(user.subscription.planId)}>
                            {user.subscription.planName}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">No plan</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {user.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLockUser(user._id, true)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLockUser(user._id, false)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                          {user.subscription && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelSubscription(user._id)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;
