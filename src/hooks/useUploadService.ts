import { useState, useCallback } from 'react';
import { 
  uploadFile, 
  getCurrentUploadService, 
  getUploadServiceConfig,
  UPLOAD_SERVICES,
  type UploadRequest,
  type UploadResponse,
  type UploadServiceType
} from '@/services/uploadService';

export const useUploadService = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastUploadResult, setLastUploadResult] = useState<UploadResponse | null>(null);

  // Get current service configuration
  const serviceConfig = getUploadServiceConfig();
  const currentService = getCurrentUploadService();

  // Upload function with progress tracking
  const upload = useCallback(async (request: UploadRequest): Promise<UploadResponse> => {
    setIsUploading(true);
    setUploadProgress(0);
    setLastUploadResult(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const result = await uploadFile(request);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setLastUploadResult(result);
      
      return result;
    } catch (error) {
      setLastUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
      throw error;
    } finally {
      setIsUploading(false);
      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  // Check if new service is available
  const isNewServiceAvailable = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('https://tbbnyplmp6.execute-api.us-east-2.amazonaws.com/dev/health', {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Test upload to new service
  const testNewService = useCallback(async (testFile: File): Promise<UploadResponse> => {
    const testRequest: UploadRequest = {
      file: testFile,
      kycCaseId: '1',
      documentType: 'test-document',
      userId: '1',
    };

    return await uploadFile(testRequest);
  }, []);

  return {
    // Upload functionality
    upload,
    isUploading,
    uploadProgress,
    lastUploadResult,
    
    // Service information
    currentService,
    serviceConfig,
    isNewService: currentService === UPLOAD_SERVICES.NEW,
    isExistingService: currentService === UPLOAD_SERVICES.EXISTING,
    
    // Utility functions
    isNewServiceAvailable,
    testNewService,
    
    // Service constants
    UPLOAD_SERVICES,
  };
}; 