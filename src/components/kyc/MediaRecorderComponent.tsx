import React, { useRef, useState, useEffect } from 'react';
import { VideoCameraIcon, StopIcon, ArrowPathIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { useUploadService } from '@/hooks/useUploadService';

interface MediaRecorderComponentProps {
  onRecordingComplete: (file: File) => void;
  onError: (error: string) => void;
  uploadUrl?: string;
  onUploadComplete?: () => void;
  maxDuration?: number;
  minDuration?: number;
  kycCaseId: string;
}

export const MediaRecorderComponent: React.FC<MediaRecorderComponentProps> = ({
  onRecordingComplete,
  onError,
  uploadUrl,
  onUploadComplete,
  maxDuration = 10,
  minDuration = 5,
  kycCaseId
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTestingPlayback, setIsTestingPlayback] = useState(false);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [status, setStatus] = useState<'idle' | 'recording' | 'stopped'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Upload service hook
  const { 
    upload, 
    isUploading: serviceUploading, 
    uploadProgress, 
    lastUploadResult,
    currentService,
    isNewService 
  } = useUploadService();

  const cleanupPreviewUrl = () => {
    if (videoRef.current && videoRef.current.src) {
      URL.revokeObjectURL(videoRef.current.src);
      videoRef.current.src = '';
    }
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= maxDuration) {
          handleStopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const testVideoPlayback = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error('Video element not found'));
        return;
      }

      const video = videoRef.current;
      let hasPlayed = false;
      let hasError = false;

      const cleanup = () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('error', handleError);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        URL.revokeObjectURL(video.src);
      };

      const handlePlay = () => {
        hasPlayed = true;
      };

      const handleError = (e: Event) => {
        hasError = true;
        cleanup();
        reject(new Error('Video playback error'));
      };

      const handleTimeUpdate = () => {
        if (video.currentTime >= 1) {
          cleanup();
          resolve();
        }
      };

      video.addEventListener('play', handlePlay);
      video.addEventListener('error', handleError);
      video.addEventListener('timeupdate', handleTimeUpdate);

      const url = URL.createObjectURL(file);
      video.src = url;
      video.controls = true;

      setTimeout(() => {
        if (!hasPlayed || hasError) {
          cleanup();
          reject(new Error('Video playback timeout'));
        }
      }, 5000);
    });
  };

  const getSupportedMimeType = () => {
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    return 'video/webm';
  };

  const handleStartRecording = async () => {
    try {
      console.log('Starting recording...');
      setError(null);
      setStatus('recording');
      setRecordingTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setMediaStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mimeType = getSupportedMimeType();
      console.log('Using MIME type:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing...');
        const blob = new Blob(chunks, { type: mimeType });
        const file = new File([blob], 'verification.mp4', { type: mimeType });

        setRecordedFile(file);
        setStatus('stopped');

        // Test playback
        setIsTestingPlayback(true);
        try {
          await testVideoPlayback(file);
          console.log('Video playback test passed');
          onRecordingComplete(file);
        } catch (error) {
          console.error('Video playback test failed:', error);
          setError('Video playback test failed. Please try recording again.');
          setStatus('idle');
        } finally {
          setIsTestingPlayback(false);
        }
      };

      console.log('Starting MediaRecorder...');
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      console.log('MediaRecorder started');
      
      setIsRecording(true);
      setStatus('recording');
      startTimer(); // Start the timer after everything else is set up
      console.log('Recording started successfully');

    } catch (error) {
      console.error('Error in handleStartRecording:', error);
      onError(error instanceof Error ? error.message : 'Failed to start recording');
      setStatus('idle');
      stopTimer(); // Stop timer if there's an error
      
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
    }
  };

  // Function to stop recording
  const handleStopRecording = () => {
    console.log('Stopping recording...');
    if (!mediaRecorderRef.current || !isRecording) {
      console.log('Cannot stop: no active recording');
      return;
    }

    if (recordingTime < minDuration) {
      console.log('Recording too short:', recordingTime, 'seconds');
      toast.error(`Recording must be at least ${minDuration} seconds`);
      return;
    }

    try {
      // Stop the timer first
      stopTimer();

      // Stop recording
      console.log('Stopping MediaRecorder...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks
      if (mediaStream) {
        console.log('Stopping media tracks...');
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }

      console.log('Recording stopped successfully');
    } catch (error) {
      console.error('Error stopping recording:', error);
      onError(error instanceof Error ? error.message : 'Failed to stop recording');
      setStatus('idle');
      stopTimer(); // Stop timer if there's an error
    }
  };

  // Function to retake video
  const handleRetake = () => {
    console.log('Retaking video...');
    cleanupPreviewUrl();
    setRecordedFile(null);
    setStatus('idle');
    stopTimer(); // Stop timer when retaking
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.controls = false;
    }
  };

  // Function to handle upload
  const handleUpload = async () => {
    if (!recordedFile) return;

    setIsUploading(true);
    
    try {
      // Use the new upload service with proper payload structure
      const uploadResult = await upload({
        file: recordedFile,
        kycCaseId: kycCaseId,
        documentType: "video",
        userId: '1'
      });

      if (uploadResult.success) {
        console.log('Upload successful:', uploadResult);
        toast.success(`Video uploaded successfully using ${isNewService ? 'Lambda service' : 'existing service'}`);
        
        // Log additional details for debugging
        if (uploadResult.documentId) {
          console.log(`Document ID: ${uploadResult.documentId}`);
        }
        if (uploadResult.s3Url) {
          console.log(`S3 URL: ${uploadResult.s3Url}`);
        }
        if (uploadResult.originalFilename) {
          console.log(`Original filename: ${uploadResult.originalFilename}`);
        }
        if (uploadResult.fileSize) {
          console.log(`File size: ${uploadResult.fileSize} bytes`);
        }
        
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError(error instanceof Error ? error.message : 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Service Status */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        Using: {isNewService ? 'New Lambda Service' : 'Existing Service'}
      </div>
      
      {/* Upload Progress */}
      {serviceUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Uploading video...
            </span>
            <span className="text-sm text-blue-700">
              {Math.round(uploadProgress)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isRecording}
          className="h-full w-full object-cover"
        />
        {isTestingPlayback && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white">Testing video playback...</div>
          </div>
        )}
        {isRecording && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full">
            {formatTime(recordingTime)}
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        {status === 'idle' && (
          <button
            onClick={handleStartRecording}
            disabled={isUploading || isTestingPlayback}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            <VideoCameraIcon className="h-6 w-6" />
            Start Recording
          </button>
        )}
        {status === 'recording' && (
          <button
            onClick={handleStopRecording}
            disabled={recordingTime < minDuration}
            className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-white hover:bg-red-700 disabled:bg-gray-400"
          >
            <StopIcon className="h-6 w-6" />
            Stop Recording ({formatTime(recordingTime)})
          </button>
        )}
        {status === 'stopped' && recordedFile && (
          <div className="flex gap-4">
            <button
              onClick={handleRetake}
              disabled={isUploading}
              className="flex items-center gap-2 rounded-full bg-gray-600 px-6 py-3 text-white hover:bg-gray-700 disabled:bg-gray-400"
            >
              <ArrowPathIcon className="h-6 w-6" />
              Retake
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:bg-gray-400"
            >
              <ArrowUpTrayIcon className="h-6 w-6" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Upload Details */}
      {lastUploadResult && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
          <div className="font-medium mb-1">Upload Details:</div>
          <div>Service: {isNewService ? 'Lambda' : 'Existing'}</div>
          <div>Document ID: {lastUploadResult.documentId}</div>
          {lastUploadResult.s3Url && (
            <div className="truncate">S3 URL: {lastUploadResult.s3Url}</div>
          )}
          {lastUploadResult.originalFilename && (
            <div>File: {lastUploadResult.originalFilename}</div>
          )}
          {lastUploadResult.fileSize && (
            <div>Size: {(lastUploadResult.fileSize / 1024 / 1024).toFixed(2)} MB</div>
          )}
        </div>
      )}

      {status === 'idle' && (
        <div className="text-center text-sm text-gray-500">
          Please record a short video ({minDuration}-{maxDuration} seconds) of yourself saying "I confirm this is my identity verification"
        </div>
      )}
      {status === 'recording' && recordingTime < minDuration && (
        <div className="text-center text-sm text-yellow-600">
          Please record for at least {minDuration} seconds
        </div>
      )}
    </div>
  );
}; 