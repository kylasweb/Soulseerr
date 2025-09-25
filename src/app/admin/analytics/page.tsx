import { Suspense } from 'react';
import AdvancedAnalyticsDashboard from '@/components/admin/AdvancedAnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      }>
        <AdvancedAnalyticsDashboard />
      </Suspense>
    </div>
  );
}