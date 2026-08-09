import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { settingsService } from "@/services/settings-service";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function NotificationsTab() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState({
    notifyLowStock: user?.notifyLowStock ?? true,
    notifyFollowUps: user?.notifyFollowUps ?? true,
    notifyChallans: user?.notifyChallans ?? true,
    notifySystem: user?.notifySystem ?? true,
  });

  const handleChange = async (key: keyof typeof prefs, checked: boolean) => {
    const newPrefs = { ...prefs, [key]: checked };
    setPrefs(newPrefs);
    try {
      await settingsService.updateNotifications(newPrefs);
      toast.success("Notification preferences updated");
    } catch {
      toast.error("Failed to update notification preferences");
      // revert
      setPrefs(prefs);
    }
  };

  return (
    <div className="surface-card p-6 max-w-2xl">
      <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Control what alerts and emails you receive.
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b">
          <div className="space-y-0.5">
            <Label className="text-base">Low Stock Alerts</Label>
            <p className="text-xs text-muted-foreground">Receive notifications when product stock falls below minimum threshold.</p>
          </div>
          <Switch checked={prefs.notifyLowStock} onCheckedChange={(c) => handleChange('notifyLowStock', c)} />
        </div>
        <div className="flex items-center justify-between py-2 border-b">
          <div className="space-y-0.5">
            <Label className="text-base">Customer Follow-ups</Label>
            <p className="text-xs text-muted-foreground">Get reminded of pending customer follow-ups.</p>
          </div>
          <Switch checked={prefs.notifyFollowUps} onCheckedChange={(c) => handleChange('notifyFollowUps', c)} />
        </div>
        <div className="flex items-center justify-between py-2 border-b">
          <div className="space-y-0.5">
            <Label className="text-base">Challan Updates</Label>
            <p className="text-xs text-muted-foreground">Notifications for challan confirmations and cancellations.</p>
          </div>
          <Switch checked={prefs.notifyChallans} onCheckedChange={(c) => handleChange('notifyChallans', c)} />
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label className="text-base">System Announcements</Label>
            <p className="text-xs text-muted-foreground">Important updates and maintenance notices.</p>
          </div>
          <Switch checked={prefs.notifySystem} onCheckedChange={(c) => handleChange('notifySystem', c)} />
        </div>
      </div>
    </div>
  );
}
