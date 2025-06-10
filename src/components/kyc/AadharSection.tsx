"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { 
  DocumentArrowUpIcon,
  FaceSmileIcon,
  IdentificationIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CameraIcon,
  VideoCameraIcon,
  StopIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentIcon,
  Bars3Icon,
  XMarkIcon as XMarkIconSolid,
} from '@heroicons/react/24/outline'

interface AadharSectionProps {
  kycCaseId: string;
  onComplete: () => void;
  onFileUploaded?: (type: string) => void;
}

type UploadStatus = {
  front: boolean;
  back: boolean;
};

type FileState = {
  file: File | null;
  preview: string | null;
};

export function AadharSection({ kycCaseId, onComplete, onFileUploaded }: AadharSectionProps) {
  const [uploading, setUploading] = useState<UploadStatus>({
    front: false,
    back: false,
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadStatus>({
    front: false,
    back: false,
  });
  const [selectedFiles, setSelectedFiles] = useState<Record<"front" | "back", FileState>>({
    front: { file: null, preview: null },
    back: { file: null, preview: null },
  });

  const onDrop = async (acceptedFiles: File[], type: "front" | "back") => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    // Create preview
    const preview = URL.createObjectURL(file);
    setSelectedFiles(prev => ({
      ...prev,
      [type]: { file, preview }
    }));
  };

  const handleUpload = async (type: "front" | "back") => {
    const fileState = selectedFiles[type];
    if (!fileState.file) return;

    const formData = new FormData();
    formData.append("file", fileState.file);
    formData.append("doc_type", `aadhar_${type}`);

    // Convert kycCaseId to number and validate
    const caseId = parseInt(kycCaseId, 10);
    if (isNaN(caseId)) {
      toast.error("Invalid KYC case ID");
      return;
    }
    formData.append("kyc_case_id", caseId.toString());

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(
        `${apiUrl}/kyc/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Failed to upload ${type} image`;
        console.error("Upload error:", errorData);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Upload success:", result);

      setUploadedFiles(prev => ({ ...prev, [type]: true }));
      toast.success(`Aadhar ${type} image uploaded successfully`);
      if (onFileUploaded) onFileUploaded(type === 'front' ? 'aadhar-front' : 'aadhar-back');
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to upload ${type} image. Please try again.`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleRetake = (type: "front" | "back") => {
    setSelectedFiles(prev => ({
      ...prev,
      [type]: { file: null, preview: null }
    }));
    setUploadedFiles(prev => ({
      ...prev,
      [type]: false
    }));
  };

  const { getRootProps: getFrontRootProps, getInputProps: getFrontInputProps } =
    useDropzone({
      onDrop: (files) => onDrop(files, "front"),
      accept: {
        "image/*": [".jpeg", ".jpg", ".png"],
      },
      maxFiles: 1,
      disabled: uploading.front || uploadedFiles.front,
    });

  const { getRootProps: getBackRootProps, getInputProps: getBackInputProps } =
    useDropzone({
      onDrop: (files) => onDrop(files, "back"),
      accept: {
        "image/*": [".jpeg", ".jpg", ".png"],
      },
      maxFiles: 1,
      disabled: uploading.back || uploadedFiles.back,
    });

  const handleNext = () => {
    if (!uploadedFiles.front || !uploadedFiles.back) {
      toast.error("Please upload both front and back images of your Aadhar card");
      return;
    }
    onComplete();
  };

  const renderUploadArea = (type: "front" | "back") => {
    const isUploading = uploading[type];
    const isUploaded = uploadedFiles[type];
    const fileState = selectedFiles[type];
    const getRootProps = type === "front" ? getFrontRootProps : getBackRootProps;
    const getInputProps = type === "front" ? getFrontInputProps : getBackInputProps;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Aadhar {type === "front" ? "Front" : "Back"}</h3>
        {!fileState.file && !isUploaded ? (
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400"
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-gray-500">
                Supports JPG, JPEG, PNG
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {fileState.preview && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border">
                <img
                  src={fileState.preview}
                  alt={`Aadhar ${type}`}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <div className="flex gap-2">
              {!isUploaded && (
                <>
                  <Button
                    onClick={() => handleRetake(type)}
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <X className="h-5 w-5" /> Cancel
                  </Button>
                  <Button
                    onClick={() => handleUpload(type)}
                    type="button"
                    disabled={isUploading || isUploaded}
                    className="flex items-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                    {isUploaded ? "Uploaded" : "Upload"}
                  </Button>
                </>
              )}
              {isUploaded && (
                <div className="flex items-center gap-2 text-green-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Uploaded successfully</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Front Image Upload */}
        <Card className="p-6">
          {renderUploadArea("front")}
        </Card>

        {/* Back Image Upload */}
        <Card className="p-6">
          {renderUploadArea("back")}
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!uploadedFiles.front || !uploadedFiles.back}
          className="min-w-[120px]"
        >
          Next
        </Button>
      </div>
    </div>
  );
} 