import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { APP_NAME, NAV_ITEMS } from "@/constants";
import { useAuth } from "@/contexts/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { can, logout, user, roleLabel } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const items = NAV_ITEMS.filter((item) => can(item.permission));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex min-w-0 items-center gap-2.5 px-1 py-1.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <img src="/favicon.ico" alt="Logo" className="h-6 w-6 object-contain" />
          </span>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{APP_NAME}</p>
              <p className="truncate text-xs text-muted-foreground">Operations Portal</p>
            </div>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.to || pathname.startsWith(`${item.to}/`)}
                    tooltip={item.label}
                  >
                    <Link to={item.to} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profile">
              <Link to="/profile" className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sidebar-accent text-[10px] font-semibold text-sidebar-accent-foreground">
                  {user?.avatarInitials}
                </span>
                <span className="min-w-0 truncate">
                  <span className="block truncate text-xs font-medium">{user?.name}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {roleLabel}
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Sign out">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
