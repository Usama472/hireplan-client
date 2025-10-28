import React, { useState } from 'react';
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
import { ownerManagementService } from '@/http/owner';
import { toast } from 'sonner';

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateCompanyDialog: React.FC<CreateCompanyDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    tempPassword: string;
    loginLink: string;
    companyName: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    websiteUrl: '',
    industry: '',
    companySize: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
  });

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.adminEmail || !formData.adminFirstName || !formData.adminLastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await ownerManagementService.createCompany(formData);
      
      setCredentials({
        email: result.credentials.email,
        tempPassword: result.credentials.tempPassword,
        loginLink: result.credentials.loginLink,
        companyName: result.company.companyName,
      });
      
      setShowCredentials(true);
      toast.success('Company created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create company:', error);
      toast.error(error.message || 'Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      companyName: '',
      websiteUrl: '',
      industry: '',
      companySize: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      adminEmail: '',
      adminFirstName: '',
      adminLastName: '',
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
              Company Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Share these credentials with the admin user. They can use these to log in and set up their company.
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
                <Label className="text-sm font-medium">Company:</Label>
                <p className="text-base font-semibold">{credentials.companyName}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Admin Email:</Label>
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
                The admin user should change this password after their first login.
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
          <DialogDescription>
            Create a new company and its admin user. An invitation will be sent with login credentials.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Company Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Company Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Acme Inc."
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Technology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Address (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="San Francisco"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="CA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="94102"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="US"
                />
              </div>
            </div>
          </div>

          {/* Admin User Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Admin User *</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminFirstName">First Name *</Label>
                <Input
                  id="adminFirstName"
                  value={formData.adminFirstName}
                  onChange={(e) => setFormData({ ...formData, adminFirstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminLastName">Last Name *</Label>
                <Input
                  id="adminLastName"
                  value={formData.adminLastName}
                  onChange={(e) => setFormData({ ...formData, adminLastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="adminEmail">Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Company'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCompanyDialog;

