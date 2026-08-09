import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { settingsService } from "@/services/settings-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export function SecurityTab() {
  const { logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema)
  });

  const onSubmit = async (data: PasswordForm) => {
    setLoading(true);
    try {
      await settingsService.changePassword({ 
        currentPassword: data.currentPassword, 
        newPassword: data.newPassword 
      });
      toast.success("Password changed successfully");
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await settingsService.logoutAll();
      toast.success("Logged out from all devices");
      logout();
    } catch {
      toast.error("Failed to logout from all devices");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="surface-card p-6">
        <h3 className="text-lg font-medium mb-4">Change Password</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Current Password</Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} {...register("currentPassword")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input type={showPassword ? "text" : "password"} {...register("newPassword")} />
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Confirm New Password</Label>
            <Input type={showPassword ? "text" : "password"} {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </div>
        </form>
      </div>

      <div className="surface-card p-6">
        <h3 className="text-lg font-medium mb-4">Session Management</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manage your active sessions and log out from your devices.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => logout()}>Logout from this device</Button>
          <Button variant="destructive" onClick={handleLogoutAll}>Logout from all devices</Button>
        </div>
      </div>
    </div>
  );
}
