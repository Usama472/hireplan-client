import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { UserPlus, Shield, Mail, Check, X, Loader2, UserCircle, Trash2 } from 'lucide-react';
import { ownerAccountsService, type OwnerAccount } from '@/http/owner/accounts';
import { toast } from 'sonner';

const AccountsContentNew: React.FC = () => {
  const [accounts, setAccounts] = useState<OwnerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ email: '', firstName: '', lastName: '', role: 'tech-support' as const });
  const [isCreating, setIsCreating] = useState(false);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newAccount.email || !newAccount.firstName || !newAccount.lastName) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsCreating(true);
      await ownerAccountsService.createAccount(newAccount);
      toast.success('Account created and invitation sent!');
      await loadAccounts();
      setShowCreateForm(false);
      setNewAccount({ email: '', firstName: '', lastName: '', role: 'tech-support' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ownerAccountsService.deleteAccount(id);
      toast.success('Account deleted');
      await loadAccounts();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Owner Accounts</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <UserPlus className="w-4 h-4 mr-2" />New Account
        </Button>
      </div>

      {showCreateForm && (
        <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Create Owner Account</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs">First Name *</Label><Input value={newAccount.firstName} onChange={(e) => setNewAccount({ ...newAccount, firstName: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Last Name *</Label><Input value={newAccount.lastName} onChange={(e) => setNewAccount({ ...newAccount, lastName: e.target.value })} className="mt-1" /></div>
              <div className="col-span-2"><Label className="text-xs">Email *</Label><Input type="email" value={newAccount.email} onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })} className="mt-1" /></div>
              <div className="col-span-2"><Label className="text-xs">Role</Label>
                <select value={newAccount.role} onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value as any })} className="w-full mt-1 px-3 py-2 border rounded-md">
                  <option value="tech-support">Tech Support</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={isCreating}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isCreating} className="bg-gradient-to-r from-blue-600 to-purple-600">
                {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : <><Check className="w-4 h-4 mr-2" />Create</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card key={account.id} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{account.firstName[0]}{account.lastName[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{account.firstName} {account.lastName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{account.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(account.id)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Badge className={`${account.role === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} border-0`}>
                {account.role === 'owner' ? 'Owner' : 'Tech Support'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AccountsContentNew;

