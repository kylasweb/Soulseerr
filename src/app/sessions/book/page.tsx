'use client';

import { RoleGuard } from '@/components/auth/RoleGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdvancedSessionBooking } from '@/components/sessions/AdvancedSessionBooking';

export default function SessionBookingPage() {
  return (
    <RoleGuard allowedRoles={['CLIENT']}>
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-mystical-dark/5 via-purple-50 to-mystical-dark/5">
          <AdvancedSessionBooking />
        </div>
      </MainLayout>
    </RoleGuard>
  );
}
