import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./components/profile-tab";
import { SecurityTab } from "./components/security-tab";
import { AppearanceTab } from "./components/appearance-tab";
import { NotificationsTab } from "./components/notifications-tab";
import { UsersTab } from "./components/users-tab";
import { PermissionsTab } from "./components/permissions-tab";
import { ActivityTab } from "./components/activity-tab";
import { AppInfoTab } from "./components/app-info-tab";

export function SettingsPage() {
  const { can } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, preferences, and workspace settings."
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex w-full flex-wrap justify-start h-auto gap-1 bg-transparent p-0">
          <TabsTrigger value="profile" className="data-[state=active]:bg-muted">Profile</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-muted">Security</TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-muted">Appearance</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-muted">Notifications</TabsTrigger>
          {can("users.manage") && <TabsTrigger value="users" className="data-[state=active]:bg-muted">Users</TabsTrigger>}
          <TabsTrigger value="permissions" className="data-[state=active]:bg-muted">Permissions</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-muted">Activity Logs</TabsTrigger>
          <TabsTrigger value="app-info" className="data-[state=active]:bg-muted">App Info</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="m-0"><ProfileTab /></TabsContent>
        <TabsContent value="security" className="m-0"><SecurityTab /></TabsContent>
        <TabsContent value="appearance" className="m-0"><AppearanceTab /></TabsContent>
        <TabsContent value="notifications" className="m-0"><NotificationsTab /></TabsContent>
        {can("users.manage") && <TabsContent value="users" className="m-0"><UsersTab /></TabsContent>}
        <TabsContent value="permissions" className="m-0"><PermissionsTab /></TabsContent>
        <TabsContent value="activity" className="m-0"><ActivityTab /></TabsContent>
        <TabsContent value="app-info" className="m-0"><AppInfoTab /></TabsContent>
      </Tabs>
    </div>
  );
}
