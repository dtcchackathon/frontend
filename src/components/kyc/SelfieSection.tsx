"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Camera, RefreshCw, Upload } from "lucide-react";

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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", "selfie");
      const caseId = parseInt(kycCaseId, 10);
      if (isNaN(caseId)) {
        toast.error("Invalid KYC case ID");
        setUploading(false);
        return;
      }
      formData.append("kyc_case_id", caseId.toString());
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/kyc/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || "Failed to upload selfie";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      setUploaded(true);
      if (onFileUploaded) onFileUploaded('selfie');
      toast.success("Selfie uploaded successfully");
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