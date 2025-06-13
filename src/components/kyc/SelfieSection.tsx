"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Camera, RefreshCw, Upload } from "lucide-react";
import { useUploadService } from "@/hooks/useUploadService";

interface SelfieSectionProps {
  kycCaseId: string;
  onComplete: () => void;
  onFileUploaded?: (type: string) => void;
}

export function SelfieSection({ kycCaseId, onComplete, onFileUploaded }: SelfieSectionProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload service hook
  const { 
    upload, 
    isUploading, 
    uploadProgress, 
    lastUploadResult,
    currentService,
    isNewService 
  } = useUploadService();

  useEffect(() => {
    if (!captured) {
      // Start camera
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch((err) => {
          setError("Could not access camera. Please allow camera access.");
        });
    }
    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captured]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setCaptured(dataUrl);
      // Stop the camera
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  };

  const handleRetake = () => {
    setCaptured(null);
    setUploaded(false);
    setError(null);
  };

  const handleUpload = async () => {
    if (!captured) return;
    setUploading(true);
    setError(null);
    try {
      // Convert dataURL to Blob
      const res = await fetch(captured);
      const blob = await res.blob();
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });

      // Use the new upload service with proper payload structure
      const uploadResult = await upload({
        file,
        kycCaseId: kycCaseId,
        documentType: "photo", // Using "photo" as doctype as per working example
        userId: '1'
      });

      if (uploadResult.success) {
        setUploaded(true);
        if (onFileUploaded) onFileUploaded('selfie');
        toast.success(`Selfie uploaded successfully using ${isNewService ? 'Lambda service' : 'existing service'}`);
        console.log("Selfie upload result:", uploadResult);
        
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
      } else {
        throw new Error(uploadResult.error || "Failed to upload selfie");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload selfie");
      toast.error(err.message || "Failed to upload selfie. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (!uploaded) {
      toast.error("Please upload your selfie");
      return;
    }
    onComplete();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Selfie Capture</h3>
          
          {/* Upload Service Status */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Using: {isNewService ? 'New Lambda Service' : 'Existing Service'}
          </div>
          
          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Uploading selfie...
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

          {!captured ? (
            <div className="flex flex-col items-center gap-4">
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="rounded-lg border w-full max-w-xs aspect-square object-cover bg-black"
                style={{ minHeight: 240 }}
              />
              <Button onClick={handleCapture} type="button" className="flex items-center gap-2">
                <Camera className="h-5 w-5" /> Capture Selfie
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <img
                src={captured}
                alt="Selfie preview"
                className="rounded-lg border w-full max-w-xs aspect-square object-cover"
                style={{ minHeight: 240 }}
              />
              <div className="flex gap-2">
                <Button onClick={handleRetake} type="button" variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" /> Retake
                </Button>
                <Button
                  onClick={handleUpload}
                  type="button"
                  disabled={uploading || uploaded}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                  {uploaded ? "Uploaded" : "Upload"}
                </Button>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
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
          
          <canvas ref={canvasRef} style={{ display: "none" }} />
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