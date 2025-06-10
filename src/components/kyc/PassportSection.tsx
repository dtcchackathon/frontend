"use client";

import { FileIcon, ArrowRightIcon } from "lucide-react";
import { ImageUploadSection } from "./ImageUploadSection";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface PassportSectionProps {
  kycCaseId: string;
  onComplete: () => void;
  onFileUploaded: (type: string) => void;
}

export function PassportSection({ kycCaseId, onComplete, onFileUploaded }: PassportSectionProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleNext = () => {
    if (uploadStatus !== 'success') {
      toast.error('Please upload your passport first');
      return;
    }
    onComplete();
  };

  return (
    <div className="space-y-6">
      <ImageUploadSection
        kycCaseId={kycCaseId}
        docType="passport"
        title="Passport"
        icon={FileIcon}
        onFileUploaded={onFileUploaded}
        onUploadStatusChange={setUploadStatus}
        accept={{
          'image/*': ['.jpeg', '.jpg', '.png'],
          'application/pdf': ['.pdf']
        }}
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