"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Video, RefreshCw, Upload, Play, StopCircle } from "lucide-react";
import { ArrowPathIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface VideoSectionProps {
  kycCaseId: string;
  onComplete: () => void;
  onFileUploaded?: (type: string) => void;
}

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

  const MIN_DURATION = 5; // seconds
  const MAX_DURATION = 10; // seconds

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
      let blobUrl: string | null = null;
      
      const cleanup = () => {
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
          blobUrl = null;
        }
      };
      
      video.onloadedmetadata = () => {
        try {
          // Check if video has valid duration
          if (video.duration < MIN_DURATION) {
            cleanup();
            resolve({ isValid: false, error: `Video is too short. Minimum duration is ${MIN_DURATION} seconds.` });
            return;
          }
          if (video.duration > MAX_DURATION) {
            cleanup();
            resolve({ isValid: false, error: `Video is too long. Maximum duration is ${MAX_DURATION} seconds.` });
            return;
          }
          
          // Check if video has video track
          const hasVideoTrack = video.videoWidth > 0 && video.videoHeight > 0;
          if (!hasVideoTrack) {
            cleanup();
            resolve({ isValid: false, error: 'No video track detected. Please ensure your camera is working.' });
            return;
          }
          
          // Check for audio track - more lenient check
          const hasAudioTrack = 'audioTracks' in video && 
            typeof (video as any).audioTracks === 'object' && 
            (video as any).audioTracks.length > 0;
          
          if (!hasAudioTrack) {
            cleanup();
            resolve({ isValid: false, error: 'No audio track detected. Please ensure your microphone is enabled and working.' });
            return;
          }
          
          cleanup();
          resolve({ isValid: true });
        } catch (error) {
          console.error('Error in video validation:', error);
          cleanup();
          resolve({ isValid: false, error: 'Error validating video. Please try recording again.' });
        }
      };
      
      video.onerror = (e) => {
        console.error('Video validation error:', e);
        cleanup();
        resolve({ isValid: false, error: 'Failed to load video for validation. Please try recording again.' });
      };
      
      try {
        blobUrl = URL.createObjectURL(blob);
        video.src = blobUrl;
      } catch (error) {
        console.error('Error creating blob URL:', error);
        cleanup();
        resolve({ isValid: false, error: 'Error processing video. Please try recording again.' });
      }
    });
  };

  const testVideoPlayback = async (blob: Blob): Promise<{ canPlay: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!previewVideoRef.current) {
        resolve({ canPlay: false, error: 'Video preview element not found.' });
        return;
      }

      const video = previewVideoRef.current;
      let hasPlayed = false;
      let hasError = false;
      let errorMessage = '';
      let blobUrl: string | null = null;

      const cleanup = () => {
        if (blobUrl) {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (e) {
            console.error('Error revoking blob URL:', e);
          }
          blobUrl = null;
        }
        // Reset video element
        video.removeAttribute('src');
        video.load();
      };

      const handlePlay = () => {
        hasPlayed = true;
      };

      const handleError = (e: Event) => {
        hasError = true;
        const videoError = (e.target as HTMLVideoElement).error;
        if (videoError) {
          switch (videoError.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'Video playback was aborted.';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error occurred while loading video.';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Video format is not supported.';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Video format is not supported by your browser.';
              break;
            default:
              errorMessage = 'An error occurred while playing the video.';
          }
        }
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('error', handleError);
        cleanup();
        resolve({ canPlay: false, error: errorMessage });
      };

      const handleTimeUpdate = () => {
        // If video has played for at least 1 second without errors, consider it valid
        if (video.currentTime >= 1) {
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('error', handleError);
          video.removeEventListener('timeupdate', handleTimeUpdate);
          cleanup();
          resolve({ canPlay: true });
        }
      };

      video.addEventListener('play', handlePlay);
      video.addEventListener('error', handleError);
      video.addEventListener('timeupdate', handleTimeUpdate);

      // Set a timeout in case the video doesn't start playing
      const timeoutId = setTimeout(() => {
        if (!hasPlayed || hasError) {
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('error', handleError);
          video.removeEventListener('timeupdate', handleTimeUpdate);
          cleanup();
          resolve({ 
            canPlay: false, 
            error: hasError ? errorMessage : 'Video failed to start playing within 5 seconds.' 
          });
        }
      }, 5000);

      try {
        // Create a new blob with explicit type
        const videoBlob = new Blob([blob], { type: blob.type || 'video/webm' });
        blobUrl = URL.createObjectURL(videoBlob);
        
        // Set video properties before setting src
        video.preload = 'auto';
        video.crossOrigin = 'anonymous';
        
        // Use a data URL instead of blob URL for more reliable playback
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            video.src = reader.result;
            video.play().catch((error) => {
              console.error('Error playing video:', error);
              clearTimeout(timeoutId);
              cleanup();
              resolve({ canPlay: false, error: 'Failed to start video playback. Please try again.' });
            });
          } else {
            clearTimeout(timeoutId);
            cleanup();
            resolve({ canPlay: false, error: 'Failed to process video data. Please try again.' });
          }
        };
        reader.onerror = () => {
          clearTimeout(timeoutId);
          cleanup();
          resolve({ canPlay: false, error: 'Failed to read video data. Please try again.' });
        };
        reader.readAsDataURL(videoBlob);
      } catch (error) {
        console.error('Error processing video for playback:', error);
        clearTimeout(timeoutId);
        cleanup();
        resolve({ canPlay: false, error: 'Error processing video for playback. Please try again.' });
      }
    });
  };

  const startRecording = () => {
    if (!mediaStream) return;
    setError(null);
    setRecording(true);
    setRecordedChunks([]);
    setVideoUrl(null);
    setIsVideoValid(false);
    
    try {
      // Check if we have both video and audio tracks in the stream
      const videoTrack = mediaStream.getVideoTracks()[0];
      const audioTrack = mediaStream.getAudioTracks()[0];
      
      if (!videoTrack) {
        setError('No video track available. Please ensure your camera is working.');
        setRecording(false);
        return;
      }
      
      if (!audioTrack) {
        setError('No audio track available. Please ensure your microphone is enabled and working.');
        setRecording(false);
        return;
      }

      // Check for MP4 support with different codecs
      const mimeTypes = [
        'video/mp4;codecs=h264,aac',
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=h264,opus', // Fallback to WebM with H.264
        'video/webm' // Last resort fallback
      ];

      // Find the first supported mime type
      const selectedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/mp4';
      
      if (!MediaRecorder.isTypeSupported(selectedMimeType)) {
        setError('Your browser does not support video recording. Please try a different browser.');
        setRecording(false);
        return;
      }

      console.log('Using mime type:', selectedMimeType);
      
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps for better quality
      });
      
      setMediaRecorder(recorder);
      let seconds = 0;
      const interval = setInterval(() => {
        seconds += 1;
        setTimer(seconds);
        if (seconds >= MAX_DURATION) {
          stopRecordingHandler(recorder, interval);
        }
      }, 1000);
      setTimerInterval(interval);
      setTimer(0);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks((prev) => [...prev, e.data]);
        }
      };
      
      recorder.onstop = async () => {
        clearInterval(interval);
        setTimerInterval(null);
        setRecording(false);
        setTimer(0);
        
        try {
          // Create a new blob with explicit type
          const blob = new Blob(recordedChunks, { 
            type: selectedMimeType.startsWith('video/mp4') ? 'video/mp4' : 'video/webm'
          });
          
          // Validate video
          setIsTestingPlayback(true);
          const validationResult = await validateVideo(blob);
          if (!validationResult.isValid) {
            setError(validationResult.error || 'Video validation failed. Please try recording again.');
            setIsTestingPlayback(false);
            return;
          }
          
          // Test playback
          const playbackResult = await testVideoPlayback(blob);
          if (!playbackResult.canPlay) {
            setError(playbackResult.error || 'Video playback test failed. The video may be corrupted. Please try recording again.');
            setIsTestingPlayback(false);
            return;
          }
          
          // Create a data URL for the video preview
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setIsVideoValid(true);
              setIsTestingPlayback(false);
              setVideoUrl(reader.result);
              stopCamera();
            } else {
              setError('Failed to process video data. Please try recording again.');
              setIsTestingPlayback(false);
            }
          };
          reader.onerror = () => {
            setError('Failed to process video data. Please try recording again.');
            setIsTestingPlayback(false);
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error processing recorded video:', error);
          setError('Error processing recorded video. Please try recording again.');
          setIsTestingPlayback(false);
        }
      };
      
      recorder.start(100); // Collect data every 100ms
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please try again.');
      setRecording(false);
    }
  };

  const stopRecordingHandler = (recorder: MediaRecorder | null, interval: NodeJS.Timeout | null) => {
    if (recorder && recorder.state !== "inactive") {
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

      const formData = new FormData();
      formData.append('file', blob, 'verification.mp4');
      formData.append('kyc_case_id', kycCaseId);
      formData.append('doc_type', 'video');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/kyc/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to upload video');
      }

      const result = await response.json();
      setUploaded(true);
      setUploading(false);
      toast.success('Video uploaded successfully!');
      if (onFileUploaded) {
        onFileUploaded('video');
      }
      onComplete();
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