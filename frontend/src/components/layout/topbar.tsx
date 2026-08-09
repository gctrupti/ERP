import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Moon, Search, Sun, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { GlobalSearch } from "@/components/search/global-search";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, roleLabel, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="shrink-0" />
          <div className="min-w-0">
            <Breadcrumbs />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="hidden rounded-xl text-muted-foreground sm:inline-flex"
          >
            <Search className="mr-2 h-3.5 w-3.5" />
            Search everything
            <kbd className="ml-4 rounded border border-border px-1.5 text-[10px]">⌘K</kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/inventory" })}>
                <div>
                  <p className="text-sm font-medium">Low stock alert</p>
                  <p className="text-xs text-muted-foreground">
                    Items have crossed the minimum stock level.
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/challans" })}>
                <div>
                  <p className="text-sm font-medium">Draft challans pending</p>
                  <p className="text-xs text-muted-foreground">
                    Drafts awaiting confirmation do not affect stock.
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 rounded-xl px-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-accent-foreground">
                  {user?.avatarInitials}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-medium leading-tight">{user?.name}</span>
                  <span className="block text-[10px] leading-tight text-muted-foreground">
                    {roleLabel}
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center justify-between gap-2">
                My account
                <Badge variant="secondary" className="text-[10px]">
                  {user?.role}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <UserIcon className="mr-2 h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
