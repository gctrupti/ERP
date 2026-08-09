import { useEffect, useState } from "react";
import { usersService } from "@/services/users-service";
import { UserManagement } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function UsersTab() {
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getUsers();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, isDeleted: boolean) => {
    try {
      await usersService.updateUserStatus(id, isDeleted);
      setUsers(users.map(u => u.id === id ? { ...u, isDeleted } : u));
      toast.success(`User ${isDeleted ? 'deactivated' : 'activated'} successfully`);
    } catch {
      toast.error("Failed to update user status");
    }
  };

  return (
    <div className="surface-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-sm font-semibold">User Management</h2>
          <p className="text-xs text-muted-foreground">Manage system users, roles, and access.</p>
        </div>
        <Button size="sm">Add User</Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">No users found.</TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                  <TableCell>{u.department || "-"}</TableCell>
                  <TableCell>
                    <Switch checked={!u.isDeleted} onCheckedChange={(c) => handleStatusChange(u.id, !c)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
