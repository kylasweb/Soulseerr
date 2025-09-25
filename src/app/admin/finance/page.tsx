'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import FinancialManagementDashboard from '@/components/admin/FinancialManagementDashboard';

export default function AdminFinancePage() {
  return (
    <AdminLayout>
      <FinancialManagementDashboard />
    </AdminLayout>
  );
}