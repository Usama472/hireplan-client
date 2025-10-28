import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Copy, Shield } from 'lucide-react';
import { ownerManagementService, type Company } from '@/http/owner';
import { toast } from 'sonner';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedCompanyId?: string;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  preSelectedCompanyId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    tempPassword: string;
    loginLink: string;
    userName: string;
    companyName: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    companyId: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'staff',
  });

  useEffect(() => {
    if (open) {
      loadCompanies();
      // Pre-select company if provided
      if (preSelectedCompanyId) {
        setFormData(prev => ({ ...prev, companyId: preSelectedCompanyId }));
      }
    }
  }, [open, preSelectedCompanyId]);

  const loadCompanies = async () => {
    try {
      setIsLoadingCompanies(true);
      const companiesData = await ownerManagementService.getAllCompanies();
      setCompanies(companiesData.filter(c => c.status === 'active'));
    } catch (error) {
      console.error('Failed to load companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.companyId || !formData.email || !formData.firstName || !formData.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await ownerManagementService.createUserForCompany(formData);
      
      setCredentials({
        email: result.credentials.email,
        tempPassword: result.credentials.tempPassword,
        loginLink: result.credentials.loginLink,
        userName: `${result.user.firstName} ${result.user.lastName}`,
        companyName: result.company.companyName,
      });
      
      setShowCredentials(true);
      toast.success('User created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      companyId: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'staff',
    });
    setShowCredentials(false);
    setCredentials(null);
    onOpenChange(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (showCredentials && credentials) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              User Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Share these credentials with the user. They can use these to log in.
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
                <Label className="text-sm font-medium">User:</Label>
                <p className="text-base font-semibold">{credentials.userName}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <Label className="text-sm font-medium">Company:</Label>
                <p className="text-base font-semibold">{credentials.companyName}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Email:</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(credentials.email, 'Email')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="block text-sm bg-white p-2 rounded border">
                  {credentials.email}
                </code>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Temporary Password:</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(credentials.tempPassword, 'Password')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="block text-sm bg-white p-2 rounded border font-mono">
                  {credentials.tempPassword}
                </code>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Login Link:</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(credentials.loginLink, 'Login link')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <code className="block text-xs bg-white p-2 rounded border break-all">
                  {credentials.loginLink}
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
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user for an existing company. An invitation will be sent with login credentials.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="companyId">Company *</Label>
            <Select
              value={formData.companyId}
              onValueChange={(value) => setFormData({ ...formData, companyId: value })}
              disabled={isLoadingCompanies}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingCompanies ? 'Loading companies...' : 'Select company'} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                <SelectItem value="staff">Staff (Limited Access)</SelectItem>
              </SelectContent>
            </Select>
            {formData.role === 'admin' && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Admin users have full access to manage the company and all its settings.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;

