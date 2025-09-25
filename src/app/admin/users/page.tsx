'use client';

import { Suspense } from 'react';
import UserManagementDashboard from '@/components/admin/UserManagementDashboard';

export default function AdminUsersPage() {
  return (
    <Suspense 
      fallback={
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      }
    >
      <UserManagementDashboard />
    </Suspense>
  );
}