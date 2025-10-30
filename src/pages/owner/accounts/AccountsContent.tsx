import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  UserPlus,
  Shield,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ownerAccountsService, type OwnerAccount, type CreateOwnerAccountRequest } from '@/http/owner/accounts';
import { toast } from 'sonner';

const AccountsContent: React.FC = () => {
  const [accounts, setAccounts] = useState<OwnerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteData, setInviteData] = useState<{ link: string; password: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<OwnerAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateOwnerAccountRequest>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'tech-support',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const data = await ownerAccountsService.getAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('Failed to load admin accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await ownerAccountsService.createAccount(formData);
      
      setInviteData({
        link: result.inviteLink,
        password: result.tempPassword,
      });
      
      setShowCreateDialog(false);
      setShowInviteDialog(true);
      
      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'tech-support',
      });
      
      // Reload accounts
      await loadAccounts();
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Failed to create account:', error);
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvite = async (account: OwnerAccount) => {
    try {
      const result = await ownerAccountsService.resendInvitation(account.id);
      setInviteData({
        link: result.inviteLink,
        password: result.tempPassword,
      });
      setShowInviteDialog(true);
      toast.success('Invitation resent successfully!');
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      toast.error('Failed to resend invitation');
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;

    try {
      await ownerAccountsService.deleteAccount(selectedAccount.id);
      setShowDeleteDialog(false);
      setSelectedAccount(null);
      await loadAccounts();
      toast.success('Account deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'owner') {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Owner</Badge>;
    }
    return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Tech Support</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>;
    }
    if (status === 'suspended') {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Suspended</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Inactive</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Accounts</h1>
          <p className="text-gray-600 mt-1">Manage owner and tech support accounts</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <UserPlus className="h-4 w-4 mr-2" />
          Create Account
        </Button>
      </div>

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading accounts...</p>
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-gray-600 mb-4">Create your first owner or tech support account</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {account.firstName} {account.lastName}
                    </CardTitle>
                    <CardDescription className="mt-1">{account.email}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleResendInvite(account)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Invite
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    {getRoleBadge(account.role)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    {getStatusBadge(account.status)}
                  </div>
                  {account.lastLogin && (
                    <div className="text-sm text-gray-600">
                      Last login: {new Date(account.lastLogin).toLocaleDateString()}
                    </div>
                  )}
                  {account.invitedBy && (
                    <div className="text-sm text-gray-600">
                      Invited by: {account.invitedBy.firstName} {account.invitedBy.lastName}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Account Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              Create a new owner or tech support account. An invitation will be sent with login credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'owner' | 'tech-support') =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner (Full Access)</SelectItem>
                  <SelectItem value="tech-support">Tech Support (No Finance Access)</SelectItem>
                </SelectContent>
              </Select>
              {formData.role === 'tech-support' && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Tech Support accounts can manage users and companies but cannot access financial data or subscriptions.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAccount} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invitation Details Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Account Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Share these credentials with the new user. They can use these to log in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Save these credentials now. The temporary password won't be shown again.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Invitation Link:</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(inviteData?.link || '', 'Invitation link')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="block text-xs bg-white p-2 rounded border break-all">
                  {inviteData?.link}
                </code>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Temporary Password:</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(inviteData?.password || '', 'Password')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="block text-sm bg-white p-2 rounded border font-mono">
                  {inviteData?.password}
                </code>
              </div>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                The user should change this password after their first login.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInviteDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account for{' '}
              <strong>
                {selectedAccount?.firstName} {selectedAccount?.lastName}
              </strong>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountsContent;

