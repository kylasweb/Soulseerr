'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
// import { Switch } from '../ui/switch';
// import { Progress } from '../ui/progress';
import { 
  Play,
  Pause,
  Square,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  RotateCcw,
  FastForward,
  Rewind,
  Settings,
  Clock,
  FileVideo,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface SessionRecordingProps {
  sessionId: string;
  userRole: 'CLIENT' | 'READER';
  isRecordingEnabled?: boolean;
  onRecordingToggle?: (enabled: boolean) => void;
}

interface RecordingData {
  id: string;
  sessionId: string;
  filename: string;
  duration: number;
  size: number;
  createdAt: Date;
  isPrivate: boolean;
  hasAudio: boolean;
  hasVideo: boolean;
  quality: 'low' | 'medium' | 'high';
  status: 'recording' | 'processing' | 'ready' | 'error';
}

export function SessionRecording({ 
  sessionId, 
  userRole, 
  isRecordingEnabled = false,
  onRecordingToggle 
}: SessionRecordingProps) {
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [currentRecording, setCurrentRecording] = useState<RecordingData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [volume, setVolume] = useState(1);
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchRecordings();
  }, [sessionId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const fetchRecordings = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/recordings`);
      if (response.ok) {
        const data = await response.json();
        setRecordings(data.recordings || []);
      }
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
    }
  };

  const startRecording = async () => {
    if (!recordingConsent) {
      alert('Recording consent is required before starting');
      return;
    }

    try {
      setLoading(true);
      
      // Get user media for recording
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        await uploadRecording(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      
      setIsRecording(true);
      setRecordingTime(0);
      onRecordingToggle?.(true);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check camera and microphone permissions.');
    } finally {
      setLoading(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      onRecordingToggle?.(false);
    }
  };

  const uploadRecording = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('recording', blob, `session-${sessionId}-${Date.now()}.webm`);
      formData.append('sessionId', sessionId);
      formData.append('duration', recordingTime.toString());
      
      const response = await fetch('/api/sessions/recordings/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentRecording(data.recording);
        fetchRecordings(); // Refresh the list
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload recording:', error);
      alert('Failed to save recording. Please try again.');
    }
  };

  const playRecording = async (recording: RecordingData) => {
    if (playingRecording === recording.id) {
      setPlayingRecording(null);
      if (videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }

    try {
      const response = await fetch(`/api/sessions/recordings/${recording.id}/stream`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        if (videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.play();
          setPlayingRecording(recording.id);
        }
      }
    } catch (error) {
      console.error('Failed to play recording:', error);
    }
  };

  const deleteRecording = async (recordingId: string) => {
    if (!confirm('Are you sure you want to delete this recording? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions/recordings/${recordingId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRecordings(prev => prev.filter(r => r.id !== recordingId));
      }
    } catch (error) {
      console.error('Failed to delete recording:', error);
    }
  };

  const downloadRecording = async (recording: RecordingData) => {
    try {
      const response = await fetch(`/api/sessions/recordings/${recording.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = recording.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download recording:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileVideo className="h-5 w-5" />
                Session Recording
              </CardTitle>
              <CardDescription>
                Record and manage session recordings with privacy controls
              </CardDescription>
            </div>
            <Badge variant={isRecording ? "default" : "secondary"}>
              {isRecording ? "Recording" : "Not Recording"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Privacy Notice */}
          <Alert className="border-amber-200 bg-amber-50">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Notice:</strong> Recording requires consent from all participants. 
              Recordings are encrypted and stored securely. You can delete recordings at any time.
            </AlertDescription>
          </Alert>

          {/* Recording Consent */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <input
              type="checkbox"
              checked={recordingConsent}
              onChange={(e) => setRecordingConsent(e.target.checked)}
              id="recording-consent"
              className="h-4 w-4 text-mystical-pink"
            />
            <div className="flex-1">
              <label htmlFor="recording-consent" className="font-medium cursor-pointer">
                I consent to recording this session
              </label>
              <p className="text-sm text-muted-foreground">
                Both participants must consent before recording can begin
              </p>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            {!isRecording ? (
              <Button 
                onClick={startRecording}
                disabled={!recordingConsent || loading}
                className="bg-red-600 hover:bg-red-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                variant="outline"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}

            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-lg">
                  {formatDuration(recordingTime)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recordings List */}
      <Card>
        <CardHeader>
          <CardTitle>Session Recordings</CardTitle>
          <CardDescription>
            View, play, and manage your recorded sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recordings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileVideo className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recordings available for this session</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{recording.filename}</h4>
                      <Badge variant="outline" className="text-xs">
                        {recording.quality}
                      </Badge>
                      {recording.isPrivate && (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(recording.duration)}
                      </span>
                      <span>{formatFileSize(recording.size)}</span>
                      <span>{new Date(recording.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => playRecording(recording)}
                      disabled={recording.status !== 'ready'}
                    >
                      {playingRecording === recording.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadRecording(recording)}
                      disabled={recording.status !== 'ready'}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteRecording(recording.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Player */}
      {playingRecording && (
        <Card>
          <CardHeader>
            <CardTitle>Recording Playback</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              ref={videoRef}
              controls
              className="w-full max-w-4xl mx-auto rounded-lg"
              onEnded={() => setPlayingRecording(null)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}