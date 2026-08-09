import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { settingsService } from "@/services/settings-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ProfileTab() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsService.updateProfile({ name, department, phone });
      toast.success("Profile updated successfully. Please re-login to see changes globally.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="surface-card p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-xl bg-primary/10 text-primary">
            {user?.avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Email (Read-only)</Label>
            <Input value={user?.email} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Role (Read-only)</Label>
            <Input value={user?.role} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Sales" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone Number</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
