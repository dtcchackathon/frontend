"use client";

import { CameraIcon, ArrowRightIcon } from "lucide-react";
import { ImageUploadSection } from "./ImageUploadSection";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface PhotoSectionProps {
  kycCaseId: string;
  onComplete: () => void;
  onFileUploaded: (type: string) => void;
}

export function PhotoSection({ kycCaseId, onComplete, onFileUploaded }: PhotoSectionProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleNext = () => {
    if (uploadStatus !== 'success') {
      toast.error('Please upload your photo first');
      return;
    }
    onComplete();
  };

  return (
    <div className="space-y-6">
      <ImageUploadSection
        kycCaseId={kycCaseId}
        docType="photo"
        title="Photo"
        icon={CameraIcon}
        onFileUploaded={onFileUploaded}
        onUploadStatusChange={setUploadStatus}
        accept={{
          'image/*': ['.jpeg', '.jpg', '.png']
        }}
        previewWidth={200}
        previewHeight={200}
      />
      
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={uploadStatus !== 'success'}
          className="flex items-center gap-2"
        >
          Next
          <ArrowRightIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
} 