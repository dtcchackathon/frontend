import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { VideoCameraIcon, StopIcon, ArrowPathIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

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
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isVideoValid, setIsVideoValid] = useState(false);
  const [isTestingPlayback, setIsTestingPlayback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'recording' | 'stopped'>('idle');
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function for preview URLs
  const cleanupPreviewUrl = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Function to start the recording timer
  const startTimer = useCallback(() => {
    console.log('Starting timer...');
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Reset recording time
    setRecordingTime(0);
    // Start new timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        console.log('Timer tick:', newTime);
        if (newTime >= maxDuration) {
          console.log('Max duration reached, stopping recording');
          handleStopRecording();
          return prev;
        }
        return newTime;
      });
    }, 1000);
  }, [maxDuration]);

  // Function to stop the timer
  const stopTimer = useCallback(() => {
    console.log('Stopping timer...');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Function to test video playback
  const testVideoPlayback = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error('Video element not found'));
        return;
      }

      setIsTestingPlayback(true);
      const video = videoRef.current;
      const url = URL.createObjectURL(file);

      const handleError = (e: Event) => {
        URL.revokeObjectURL(url);
        video.removeEventListener('error', handleError);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('canplaythrough', handleCanPlay);
        setIsTestingPlayback(false);
        reject(new Error('Video playback test failed'));
      };

      const handleTimeUpdate = () => {
        if (video.currentTime >= 1) {
          URL.revokeObjectURL(url);
          video.removeEventListener('error', handleError);
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('canplaythrough', handleCanPlay);
          video.pause();
          video.src = '';
          setIsTestingPlayback(false);
          resolve();
        }
      };

      const handleCanPlay = () => {
        video.play().catch(handleError);
      };

      video.addEventListener('error', handleError);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('canplaythrough', handleCanPlay);
      video.src = url;
    });
  };

  // Function to get supported mime type
  const getSupportedMimeType = () => {
    console.log('Checking supported MIME types...');
    const types = [
      'video/webm',
      'video/mp4',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/mp4;codecs=h264,aac'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Found supported MIME type:', type);
        return type;
      }
    }
    console.log('No specific MIME type supported, using default webm');
    return 'video/webm';
  };

  // Function to start recording
  const handleStartRecording = async () => {
    console.log('Starting recording...');
    if (status !== 'idle') {
      console.log('Cannot start recording: not in idle state');
      return;
    }

    try {
      // Reset states
      cleanupPreviewUrl();
      setRecordedFile(null);
      setError(null);
      setRecordingTime(0);

      console.log('Requesting media permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      console.log('Media permissions granted');

      // Set up video preview
      if (videoRef.current) {
        console.log('Setting up video preview');
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
          console.log('Video preview started');
        } catch (e) {
          console.error('Error playing video preview:', e);
        }
      }

      setMediaStream(stream);

      // Create MediaRecorder
      const mimeType = getSupportedMimeType();
      console.log('Creating MediaRecorder with type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000
      });
      console.log('MediaRecorder created successfully');

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        console.log('Data available:', e.data.size, 'bytes');
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing chunks...');
        // Stop the timer first
        stopTimer();
        
        try {
          const blob = new Blob(chunks, { type: mimeType });
          console.log('Created blob:', blob.size, 'bytes');
          
          const file = new File([blob], `video.${mimeType.split('/')[1].split(';')[0]}`, {
            type: mimeType
          });
          console.log('Created file:', file.name, file.size, 'bytes');

          // Update state and UI
          setRecordedFile(file);
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          
          if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.src = url;
            videoRef.current.controls = true;
            try {
              await videoRef.current.play();
              console.log('Preview playback started');
            } catch (e) {
              console.error('Error playing preview:', e);
            }
          }

          onRecordingComplete(file);
          setStatus('stopped');
          console.log('Recording processing complete');
        } catch (error) {
          console.error('Error processing recording:', error);
          onError(error instanceof Error ? error.message : 'Failed to process recording');
          setStatus('idle');
        }
      };

      // Start recording
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
    if (!uploadUrl || !recordedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', recordedFile);
    formData.append('doc_type', 'video');
    formData.append('kyc_case_id', kycCaseId);

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      if (onUploadComplete) {
        onUploadComplete();
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
            {uploadUrl && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:bg-gray-400"
              >
                <ArrowUpTrayIcon className="h-6 w-6" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
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