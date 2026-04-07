import React from 'react';
import { Outlet } from 'react-router-dom';
import { AccessibleHeader } from './AccessibleHeader';
import { AccessibleSidebar } from './AccessibleSidebar';
import { MainContentArea } from './MainContentArea';
import { StatusBar, useStatusMessages } from './StatusBar';

export function AppLayout() {
  const { messages, dismissMessage } = useStatusMessages();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-secondary-50">
      {/* Header */}
      <AccessibleHeader />

      {/* Body: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <AccessibleSidebar />

        {/* Main Content Area with nested route rendering */}
        <MainContentArea>
          <Outlet />
        </MainContentArea>
      </div>

      {/* Status Bar for notifications */}
      <StatusBar
        messages={messages}
        onDismiss={dismissMessage}
        autoDismissTimeout={5000}
      />
    </div>
  );
}

export default AppLayout;