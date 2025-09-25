'use client';

import { RoleGuard } from '@/components/auth/RoleGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import { SessionRecording } from '@/components/sessions/SessionRecording';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RecordingDemoPage() {
  return (
    <RoleGuard allowedRoles={['client', 'reader']}>
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-mystical-dark/5 via-purple-50 to-mystical-dark/5">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Session Recording System</h1>
                <p className="text-muted-foreground">
                  Advanced recording capabilities with privacy controls and secure storage
                </p>
              </div>

              {/* Demo Notice */}
              <Card className="mb-8 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Recording System Demo</h3>
                      <p className="text-blue-700 text-sm">
                        This demonstrates the advanced session recording system with secure storage, 
                        privacy controls, and playback capabilities. In a real implementation, recordings 
                        would be encrypted and stored with strict access controls.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recording Component */}
              <SessionRecording
                sessionId="demo-session-123"
                userRole="CLIENT"
                isRecordingEnabled={true}
              />

              {/* Features Overview */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Privacy First</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Recordings require explicit consent from all participants. 
                      Data is encrypted and stored securely with user-controlled access.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">High Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Support for multiple quality levels (720p, 1080p) with 
                      optimized compression for efficient storage and streaming.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Full Control</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Users can start/stop recording, download sessions, and 
                      delete recordings at any time. Complete ownership of data.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Secure Storage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Recordings are stored with enterprise-grade security, 
                      encrypted at rest and in transit with audit logging.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Easy Playback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Built-in video player with standard controls, seeking, 
                      volume adjustment, and fullscreen support.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">API Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      RESTful APIs for recording management, streaming, 
                      downloading, and deletion with proper authentication.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}