import { useTheme } from "@/contexts/theme-context";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function AppearanceTab() {
  const { theme, toggle } = useTheme();

  return (
    <div className="surface-card p-6 max-w-2xl">
      <h3 className="text-lg font-medium mb-4">Appearance</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Customize how Nexora ERP looks on your device.
      </p>

      <div className="flex items-center justify-between py-4 border-b">
        <div>
          <h4 className="font-medium text-sm">Theme</h4>
          <p className="text-xs text-muted-foreground">Current theme: {theme === "dark" ? "Dark mode" : "Light mode"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={toggle} className="w-32">
          {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>
    </div>
  );
}
