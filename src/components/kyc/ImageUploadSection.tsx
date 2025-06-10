import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useState } from "react";
import { LucideIcon } from "lucide-react";
import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface ImageUploadSectionProps {
  kycCaseId: string;
  docType: string;
  title: string;
  icon: LucideIcon;
  onFileUploaded: (type: string) => void;
  onUploadStatusChange?: (status: 'idle' | 'success' | 'error') => void;
  accept?: Record<string, string[]>;
  previewWidth?: number;
  previewHeight?: number;
}

export function ImageUploadSection({
  kycCaseId,
  docType,
  title,
  icon: Icon,
  onFileUploaded,
  onUploadStatusChange,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png'],
    'application/pdf': ['.pdf']
  },
  previewWidth = 300,
  previewHeight = 400
}: ImageUploadSectionProps) {
  const [selectedFile, setSelectedFile] = useState<{ file: File; preview: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Notify parent component of upload status changes
  const updateUploadStatus = (status: 'idle' | 'success' | 'error') => {
    setUploadStatus(status);
    onUploadStatusChange?.(status);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles: 1,
    multiple: false,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        // Create preview URL
        const preview = URL.createObjectURL(file);
        setSelectedFile({ file, preview });
        updateUploadStatus('idle');
      }
    }
  });

  const handleCancel = () => {
    if (selectedFile?.preview) {
      URL.revokeObjectURL(selectedFile.preview);
    }
    setSelectedFile(null);
    updateUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    updateUploadStatus('idle');

    const formData = new FormData();
    formData.append('file', selectedFile.file);
    formData.append('kyc_case_id', kycCaseId);
    formData.append('doc_type', docType);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/kyc/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      updateUploadStatus('success');
      onFileUploaded(docType);
      toast.success(`${title} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      updateUploadStatus('error');
      toast.error(`Failed to upload ${title.toLowerCase()}. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Icon className="h-6 w-6 text-gray-600" />
            <h2 className="text-lg font-semibold">{title} Upload</h2>
          </div>
          
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input {...getInputProps()} />
              <Icon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isDragActive
                  ? `Drop the ${title.toLowerCase()} here`
                  : `Drag and drop your ${title.toLowerCase()}, or click to select`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: {Object.values(accept).flat().join(', ').replace(/\./g, '')}
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <div className="relative w-full max-w-[300px] mx-auto" style={{ height: previewHeight }}>
                <Image
                  src={selectedFile.preview}
                  alt={`${title} preview`}
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 300px) 100vw, 300px"
                  priority
                />
              </div>
              <div className="mt-4 flex flex-col items-center gap-4">
                {uploadStatus === 'success' && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircleIcon className="h-4 w-4" />
                    Uploaded successfully
                  </div>
                )}
                <div className="flex justify-center gap-4">
                  {uploadStatus !== 'success' && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                  {uploadStatus === 'idle' && (
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="flex items-center gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <DocumentArrowUpIcon className="h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <p className="text-sm text-red-600 text-center">
              Failed to upload {title.toLowerCase()}. Please try again.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
} 