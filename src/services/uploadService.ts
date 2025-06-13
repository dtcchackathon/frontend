// Upload Service with switch mechanism between existing and new services

export interface UploadResponse {
  success: boolean;
  documentId?: number;
  s3Url?: string;
  s3Key?: string;
  originalFilename?: string;
  fileSize?: number;
  contentType?: string;
  uploadedAt?: string;
  error?: string;
}

export interface UploadRequest {
  file: File;
  kycCaseId: string;
  documentType: string;
  userId?: string;
}

// Configuration for upload services
export const UPLOAD_SERVICES = {
  EXISTING: 'existing',
  NEW: 'new'
} as const;

export type UploadServiceType = typeof UPLOAD_SERVICES[keyof typeof UPLOAD_SERVICES];

// Get the active upload service from environment variable
const getActiveUploadService = (): UploadServiceType => {
  return (process.env.NEXT_PUBLIC_UPLOAD_SERVICE as UploadServiceType) || UPLOAD_SERVICES.EXISTING;
};

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const base64 = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64Data = base64.split(',')[1];
        
        if (!base64Data) {
          reject(new Error('Failed to convert file to base64: no data found'));
          return;
        }
        
        console.log(`File converted to base64: ${file.name}, size: ${file.size}, base64 length: ${base64Data.length}`);
        resolve(base64Data);
      } catch (error) {
        reject(new Error(`Failed to process base64 data: ${error}`));
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error(`Failed to read file: ${error}`));
    };
    
    reader.onabort = () => {
      reject(new Error('File reading was aborted'));
    };
    
    // Read file as data URL
    reader.readAsDataURL(file);
  });
};

// New Upload Service (Lambda API Gateway)
export const uploadToNewService = async (request: UploadRequest): Promise<UploadResponse> => {
  try {
    const { file, kycCaseId, documentType, userId = '1' } = request;
    
    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Clean up content type for video files - remove codec information
    let cleanContentType = file.type;
    if (file.type.startsWith('video/')) {
      // Remove codec information from video content type
      cleanContentType = file.type.split(';')[0];
    }
    
    // Prepare payload for new service
    const payload = {
      fileBuffer: base64Data,
      originalFilename: file.name,
      contentType: cleanContentType,
      kycCaseId: parseInt(kycCaseId),
      docType: documentType,
      userId: parseInt(userId)
    };

    console.log('Upload payload:', {
      ...payload,
      fileBuffer: payload.fileBuffer.substring(0, 50) + '...' // Log first 50 chars of base64
    });

    const response = await fetch(process.env.NEXT_PUBLIC_UPLOAD_API_URL || 'https://tbbnyplmp6.execute-api.us-east-2.amazonaws.com/dev/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload response error:', errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: result.success,
      documentId: result.documentId,
      s3Url: result.s3Url,
      s3Key: result.s3Key,
      originalFilename: result.originalFilename,
      fileSize: result.fileSize,
      contentType: result.contentType,
      uploadedAt: result.uploadedAt,
    };
  } catch (error) {
    console.error('New upload service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Existing Upload Service (your current implementation)
export const uploadToExistingService = async (request: UploadRequest): Promise<UploadResponse> => {
  try {
    const { file, kycCaseId, documentType } = request;
    
    // Create FormData for existing service
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kycCaseId', kycCaseId);
    formData.append('documentType', documentType);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Use your existing API endpoint
    const response = await fetch(`${apiUrl}/kyc/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: result.success,
      documentId: result.documentId,
      s3Url: result.s3Url,
      error: result.error,
    };
  } catch (error) {
    console.error('Existing upload service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Main upload function with service switching
export const uploadFile = async (request: UploadRequest): Promise<UploadResponse> => {
  const activeService = getActiveUploadService();
  
  console.log(`Using upload service: ${activeService}`);
  
  switch (activeService) {
    case UPLOAD_SERVICES.NEW:
      return await uploadToNewService(request);
    case UPLOAD_SERVICES.EXISTING:
    default:
      return await uploadToExistingService(request);
  }
};

// Utility function to check which service is active
export const getCurrentUploadService = (): UploadServiceType => {
  return getActiveUploadService();
};

// Utility function to get service configuration
export const getUploadServiceConfig = () => {
  const activeService = getActiveUploadService();
  
  return {
    activeService,
    newServiceUrl: 'https://tbbnyplmp6.execute-api.us-east-2.amazonaws.com/dev/upload',
    existingServiceUrl: '/api/upload',
    isNewService: activeService === UPLOAD_SERVICES.NEW,
    isExistingService: activeService === UPLOAD_SERVICES.EXISTING,
  };
}; 