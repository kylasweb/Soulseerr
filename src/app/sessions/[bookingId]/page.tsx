'use client';

import { useEffect, useState } from 'react';
import { SessionRoom } from '@/components/sessions/SessionRoom';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface SessionPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default function SessionPage({ params }: SessionPageProps) {
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setBookingId(resolvedParams.bookingId);
    });
  }, [params]);

  if (!bookingId) {
    return <div>Loading...</div>;
  }

  return (
    <RoleGuard allowedRoles={['client', 'reader']}>
      <SessionRoom bookingId={bookingId} />
    </RoleGuard>
  );
}