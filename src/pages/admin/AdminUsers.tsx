import { useEffect, useState } from 'react';
import { AdminLayout, DataTable, PageHeader } from '@/components/admin';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Search, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
}

export default function AdminUsers() {
  const [users, setUsers] = useState<(UserProfile & { role: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          toast({ title: 'Loading timeout', description: 'Data is taking too long to load. Please try refreshing.', variant: 'destructive' });
        }
        return false;
      });
    }, 15000);
    return () => clearTimeout(timeout);
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.get('/api/admin/users');
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: 'Error', description: 'Failed to load users.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      toast({ title: 'User role updated' });
      fetchUsers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.phone?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (user: UserProfile & { role: string }) => (
        <div>
          <p className="font-medium">{user.full_name || 'Unnamed'}</p>
          <p className="text-sm text-muted-foreground">{user.email || '-'}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (user: UserProfile & { role: string }) => (
        <p className="text-sm">{user.phone || '-'}</p>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user: UserProfile & { role: string }) => (
        <p className="text-sm text-muted-foreground">
          {format(new Date(user.created_at), 'MMM d, yyyy')}
        </p>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: UserProfile & { role: string }) => (
        <Select
          value={user.role}
          onValueChange={(value) => updateUserRole(user.user_id, value)}
        >
          <SelectTrigger className="w-32">
            <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {user.role}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Users"
        description="Manage user accounts and roles"
      />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyMessage="No users found"
      />
    </AdminLayout>
  );
}
