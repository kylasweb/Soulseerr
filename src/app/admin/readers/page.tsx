'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import ReaderManagementDashboard from '@/components/admin/ReaderManagementDashboard';

export default function AdminReadersPage() {
  return (
    <AdminLayout>
      <ReaderManagementDashboard />
    </AdminLayout>
  );
}