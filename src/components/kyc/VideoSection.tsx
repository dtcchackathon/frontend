"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Video, RefreshCw, Upload, Play, StopCircle } from "lucide-react";
import { ArrowPathIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { useUploadService } from "@/hooks/useUploadService";

interface VideoSectionProps {
  kycCaseId: string;
  onComplete: () => void;
  onFileUploaded?: (type: string) => void;
}

const MIN_DURATION = 5;
const MAX_DURATION = 10;

export function VideoSection({ kycCaseId, onComplete, onFileUploaded }: VideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoValid, setIsVideoValid] = useState(false);
  const [isTestingPlayback, setIsTestingPlayback] = useState(false);

  // Upload service hook
  const { 
    upload, 
    isUploading, 
    uploadProgress, 
    lastUploadResult,
    currentService,
    isNewService 
  } = useUploadService();

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Could not access camera/microphone. Please allow access.");
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  const validateVideo = async (blob: Blob): Promise<{ isValid: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const cleanup = () => {
        URL.revokeObjectURL(video.src);
      };

      video.onloadedmetadata = () => {
        const duration = video.duration;
        if (duration < MIN_DURATION) {
          cleanup();
          resolve({ isValid: false, error: `Video must be at least ${MIN_DURATION} seconds long` });
        } else if (duration > MAX_DURATION) {
          cleanup();
          resolve({ isValid: false, error: `Video must be no longer than ${MAX_DURATION} seconds` });
        } else {
          cleanup();
          resolve({ isValid: true });
        }
      };

      video.onerror = () => {
        cleanup();
        resolve({ isValid: false, error: 'Invalid video file' });
      };

      video.src = URL.createObjectURL(blob);
    });
  };

  const testVideoPlayback = async (blob: Blob): Promise<{ canPlay: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const cleanup = () => {
        URL.revokeObjectURL(video.src);
      };

      const handlePlay = () => {
        cleanup();
        resolve({ canPlay: true });
      };

      const handleError = (e: Event | string) => {
        cleanup();
        resolve({ canPlay: false, error: 'Video cannot be played' });
      };

      video.oncanplay = handlePlay;
      video.onerror = handleError;
      video.src = URL.createObjectURL(blob);
      
      // Set a timeout in case the video doesn't load
      setTimeout(() => {
        cleanup();
        resolve({ canPlay: false, error: 'Video loading timeout' });
      }, 5000);
    });
  };

  const startRecording = () => {
    if (!mediaStream) {
      setError("No camera access. Please allow camera access.");
      return;
    }

    try {
      // Check for supported MIME types
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
      ];
      
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

      const options = {
        mimeType: supportedMimeType
      };

      const recorder = new MediaRecorder(mediaStream, options);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        setRecordedChunks(chunks);
        
        // Validate video
        const validation = await validateVideo(blob);
        if (!validation.isValid) {
          setError(validation.error || 'Invalid video');
          return;
        }

        // Test playback
        setIsTestingPlayback(true);
        const playbackTest = await testVideoPlayback(blob);
        setIsTestingPlayback(false);

        if (!playbackTest.canPlay) {
          setError(playbackTest.error || 'Video cannot be played');
          return;
        }

        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setIsVideoValid(true);
      };

      recorder.onerror = (event) => {
        setError('Recording error: ' + event.error);
      };

      setMediaRecorder(recorder);
      recorder.start(1000);
      setRecording(true);
      setTimer(0);
      
      // Start timer
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev >= MAX_DURATION) {
            stopRecordingHandler(recorder, interval);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      setTimerInterval(interval);
    } catch (error) {
      setError('Failed to start recording: ' + error);
    }
  };

  const stopRecordingHandler = (recorder: MediaRecorder | null, interval: NodeJS.Timeout | null) => {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    if (interval) {
      clearInterval(interval);
    }
    setRecording(false);
  };

  const handleStopRecording = () => {
    if (timer < MIN_DURATION) {
      toast.error(`Please record at least ${MIN_DURATION} seconds.`);
      return;
    }
    stopRecordingHandler(mediaRecorder, timerInterval);
  };

  const handleRetake = () => {
    setRecordedChunks([]);
    setVideoUrl(null);
    setUploaded(false);
    setError(null);
    setTimer(0);
    startCamera();
  };

  const handleUpload = async () => {
    if (!recordedChunks.length || !mediaRecorder) {
      setError('No video recorded. Please record a video first.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Create a blob with the appropriate mime type
      const blob = new Blob(recordedChunks, { 
        type: mediaRecorder.mimeType.startsWith('video/mp4') ? 'video/mp4' : 'video/webm'
      });

      // Convert blob to File
      const file = new File([blob], 'verification.mp4', { 
        type: mediaRecorder.mimeType.startsWith('video/mp4') ? 'video/mp4' : 'video/webm'
      });

      // Use the new upload service with proper payload structure
      const uploadResult = await upload({
        file,
        kycCaseId: kycCaseId,
        documentType: "video",
        userId: '1'
      });

      if (uploadResult.success) {
        setUploaded(true);
        setUploading(false);
        toast.success(`Video uploaded successfully using ${isNewService ? 'Lambda service' : 'existing service'}`);
        console.log("Video upload result:", uploadResult);
        
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
        
        if (onFileUploaded) {
          onFileUploaded('video');
        }
        onComplete();
      } else {
        throw new Error(uploadResult.error || 'Failed to upload video');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload video. Please try again.');
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!mediaStream && !videoUrl) {
      startCamera();
    }
    return () => {
      stopCamera();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    if (!uploaded) {
      toast.error("Please upload your video");
      return;
    }
    onComplete();
  };

  const renderVideoPreview = () => {
    if (!videoUrl) return null;

    return (
      <div className="mt-4">
        <video
          ref={previewVideoRef}
          src={videoUrl}
          controls
          playsInline
          className="w-full rounded-lg"
          style={{ maxHeight: '400px' }}
        />
        <div className="mt-2 flex justify-center gap-4">
          <button
            onClick={handleRetake}
            className="flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Retake
          </button>
          <button
            onClick={handleUpload}
            disabled={!isVideoValid || uploading}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="h-5 w-5" />
                Upload Video
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Video Verification</h3>
          
          {/* Upload Service Status */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Using: {isNewService ? 'New Lambda Service' : 'Existing Service'}
          </div>
          
          {/* Upload Progress */}
          {isUploading && (
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

          {!videoUrl ? (
            <div className="flex flex-col items-center gap-4">
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="rounded-lg border w-full max-w-xs aspect-video object-cover bg-black"
                style={{ minHeight: 180 }}
              />
              <div className="flex flex-col items-center gap-2">
                <div className="text-sm text-gray-600">
                  Please record a short video (5-10 seconds) of yourself saying "I confirm this is my identity verification"
                </div>
                <div className="flex gap-2 items-center">
                  {!recording ? (
                    <Button 
                      onClick={startRecording} 
                      type="button" 
                      className="flex items-center gap-2" 
                      disabled={!!mediaRecorder || !mediaStream || isTestingPlayback}
                    >
                      {isTestingPlayback ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Video className="h-5 w-5" />
                      )}
                      {isTestingPlayback ? 'Testing Video...' : 'Start Recording'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleStopRecording} 
                      type="button" 
                      variant="destructive" 
                      className="flex items-center gap-2"
                    >
                      <StopCircle className="h-5 w-5" /> Stop Recording ({timer}s)
                    </Button>
                  )}
                </div>
                {recording && (
                  <div className="text-xs text-gray-500">
                    Recording... (min {MIN_DURATION}s, max {MAX_DURATION}s)
                  </div>
                )}
              </div>
            </div>
          ) : (
            renderVideoPreview()
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
        </div>
      </Card>
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!uploaded}
          className="min-w-[120px]"
        >
          Next
        </Button>
      </div>
    </div>
  );
} 