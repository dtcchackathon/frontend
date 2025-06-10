'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Navigation from '@/components/Navigation'
import { useDropzone } from 'react-dropzone'
import { 
  DocumentArrowUpIcon,
  FaceSmileIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CameraIcon,
  VideoCameraIcon,
  StopIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentIcon,
  Bars3Icon,
  XMarkIcon as XMarkIconSolid
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import KycReviewForm, { KycFormData as ReviewFormData } from '@/components/KycReviewForm'
import SecuritySetup, { SecurityData } from '@/components/SecuritySetup'
import OtpVerification, { VerificationData } from '@/components/OtpVerification'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import UserRegistration, { UserRegistrationData } from '@/components/UserRegistration'
import { useParams } from 'next/navigation'
import { AadharSection } from '@/components/kyc/AadharSection'
import { PanCardSection } from '@/components/kyc/PanCardSection'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { RegistrationSection } from "@/components/kyc/RegistrationSection"
import { PassportSection } from '@/components/kyc/PassportSection'
import { PhotoSection } from '@/components/kyc/PhotoSection'
import { SelfieSection } from '@/components/kyc/SelfieSection'
import { VideoSection } from '@/components/kyc/VideoSection'
import { MediaRecorderComponent } from '@/components/kyc/MediaRecorderComponent'
import { RiskAnalysisSection } from '@/components/kyc/RiskAnalysisSection'
import { StepLoader, ReviewLoader } from '@/components/ui/loader'

type StepId = "registration" | "aadhar" | "pancard" | "passport" | "photo" | "selfie" | "video" | "review" | "kyc_submitted"

interface Step {
  id: StepId
  title: string
  description: string
}

const steps: Step[] = [
  {
    id: "registration",
    title: "Registration",
    description: "Enter your personal details",
  },
  {
    id: "aadhar",
    title: "Aadhar Card",
    description: "Upload your Aadhar card",
  },
  {
    id: "pancard",
    title: "PAN Card",
    description: "Upload your PAN card",
  },
  {
    id: "passport",
    title: "Passport",
    description: "Upload your passport",
  },
  {
    id: "photo",
    title: "Photo",
    description: "Upload your photo",
  },
  {
    id: "selfie",
    title: "Selfie",
    description: "Take a selfie",
  },
  {
    id: "video",
    title: "Video",
    description: "Record a video",
  },
  {
    id: "review",
    title: "Review",
    description: "Review your information",
  },
  {
    id: "kyc_submitted",
    title: "KYC Submitted",
    description: "Your KYC has been submitted.",
  },
]

const stepOrder: StepId[] = [ "registration", "aadhar", "pancard", "passport", "photo", "selfie", "video", "review", "kyc_submitted" ]

type DocumentType =
  | 'aadhar'
  | 'aadhar-front'
  | 'aadhar-back'
  | 'pancard'
  | 'passport'
  | 'photo'
  | 'selfie'
  | 'video'
type UploadStatus = 'pending' | 'uploading' | 'success' | 'error'
type CameraMode = 'photo' | 'video' | null

interface UploadState {
  type: 'image' | 'pdf' | 'video'
  file: File | null
  preview: string | null
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  side?: 'front' | 'back' // For Aadhar card
}

interface KycFormData {
  // Auto-populated fields
  name: string
  dateOfBirth: string
  gender: string
  address: {
    street: string
    city: string
    state: string
    pincode: string
  }
  fatherName: string
  aadharNumber: string
  panNumber: string
  
  // User input fields
  email: string
  phone: string
  occupation: string
  sourceOfFunds: string
  businessType: string
  isPep: boolean
  pepDetails: string
  annualIncome: string
  purposeOfAccount: string
  
  // Additional fields
  nationality: string
  maritalStatus: string
  nomineeName: string
  nomineeRelation: string
  nomineeContact: string
}

// Helper to transform review data to backend format
function transformKycPayload(data: Record<string, any>) {
  return {
    name: data.name,
    dob: data.dateOfBirth,
    gender: data.gender,
    address: data.address && typeof data.address === 'object'
      ? `${data.address.street}, ${data.address.city}, ${data.address.state}, ${data.address.pincode}`
      : data.address,
    father_name: data.fatherName,
    aadhar_number: data.aadharNumber,
    pan_number: data.panNumber,
    email: data.email,
    phone: data.phone,
    occupation: data.occupation,
    source_of_funds: data.sourceOfFunds,
    is_pep: data.isPep,
    annual_income: data.annualIncome,
    employer: data.employer,
    alternate_phone: data.alternatePhone,
    business_type: data.businessType,
    pep_details: data.pepDetails,
    kyc_case_id: data.kyc_case_id,
  };
}

// Add type for backend progress API
interface BackendStepStatus {
  id: string;
  status: 'not_started' | 'pending' | 'completed';
}
interface BackendProgressResponse {
  steps: BackendStepStatus[];
  current_step: string;
}

// Add type for backend screen data
interface BackendScreenData {
  case: any;
  details: any;
  documents: any[];
  status: any;
  kyc_submitted?: { status: string };
}

// Map backend step IDs to frontend step IDs
const backendToFrontendStep: Record<string, StepId> = {
  registration: 'registration',
  aadhar_upload: 'aadhar',
  pan_upload: 'pancard',
  passport_upload: 'passport',
  photo_upload: 'photo',
  selfie_upload: 'selfie',
  video_upload: 'video',
  review: 'review',
  kyc_submitted: 'kyc_submitted',
};

export default function SelfKycPage() {
  const [currentStep, setCurrentStep] = useState<StepId>('registration')
  const [showReview, setShowReview] = useState(false)
  const [formData, setFormData] = useState<KycFormData>({
    // Auto-populated fields (will be filled from documents)
    name: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    fatherName: '',
    aadharNumber: '',
    panNumber: '',
    
    // User input fields
    email: '',
    phone: '',
    occupation: '',
    sourceOfFunds: '',
    businessType: '',
    isPep: false,
    pepDetails: '',
    annualIncome: '',
    purposeOfAccount: '',
    
    // Additional fields
    nationality: '',
    maritalStatus: '',
    nomineeName: '',
    nomineeRelation: '',
    nomineeContact: ''
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [securityData, setSecurityData] = useState<SecurityData | null>(null)
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null)
  const [uploads, setUploads] = useState<Record<DocumentType, UploadState>>({
    aadhar: {
      type: 'image',
      file: null,
      preview: null,
      status: 'pending',
      side: 'front',
    },
    'aadhar-front': {
      type: 'image',
      file: null,
      preview: null,
      status: 'pending',
      side: 'front',
    },
    'aadhar-back': {
      type: 'image',
      file: null,
      preview: null,
      status: 'pending',
      side: 'back',
    },
    pancard: {
      type: 'pdf',
      file: null,
      preview: null,
      status: 'pending',
    },
    passport: {
      type: 'pdf',
      file: null,
      preview: null,
      status: 'pending',
    },
    photo: {
      type: 'image',
      file: null,
      preview: null,
      status: 'pending',
    },
    selfie: {
      type: 'image',
      file: null,
      preview: null,
      status: 'pending',
    },
    video: {
      type: 'video',
      file: null,
      preview: null,
      status: 'pending',
    },
  })
  const [aadharSides, setAadharSides] = useState<{
    front: UploadState
    back: UploadState
  }>({
    front: { type: 'image', file: null, preview: null, status: 'pending', side: 'front' },
    back: { type: 'image', file: null, preview: null, status: 'pending', side: 'back' }
  })
  const [userData, setUserData] = useState<UserRegistrationData | null>(null)
  const [isKycCaseLoading, setIsKycCaseLoading] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([])
  const [isProgressLoading, setIsProgressLoading] = useState(false)
  const [isScreenDataLoading, setIsScreenDataLoading] = useState(false)

  // Camera related states
  const [cameraMode, setCameraMode] = useState<CameraMode>(null)

  const params = useParams()
  const kycCaseId = params.id as string

  // Fetch progress and set current step
  const fetchProgress = useCallback(async () => {
    setIsProgressLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/kyc/progress/${kycCaseId}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Progress response:', data); // Debug log
        
        // Set current step
        if (backendToFrontendStep[data.current_step]) {
          setCurrentStep(backendToFrontendStep[data.current_step]);
        }
        
        // Set completed steps from backend
        if (Array.isArray(data.steps)) {
          const completed = data.steps
            .filter((step: any) => step.status === "completed")
            .map((step: any) => backendToFrontendStep[step.id])
            .filter((id: StepId | undefined): id is StepId => !!id);
          setCompletedSteps(completed);
          
          // Check if kyc_submitted step is completed
          const kycSubmittedStep = data.steps.find((step: any) => step.id === "kyc_submitted");
          if (kycSubmittedStep && kycSubmittedStep.status === "completed") {
            setCompletedSteps(prev => [...prev, "kyc_submitted"]);
            setCurrentStep('kyc_submitted');
          }
        }
        
        // Also check the separate kyc_submitted field if it exists
        if (data.kyc_submitted && data.kyc_submitted.status === "completed") {
          setCompletedSteps(prev => [...prev, "kyc_submitted"]);
          setCurrentStep('kyc_submitted');
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setIsProgressLoading(false)
    }
  }, [kycCaseId]);

  useEffect(() => {
    if (kycCaseId) fetchProgress();
  }, [kycCaseId, fetchProgress]);

  useEffect(() => {
    setIsKycCaseLoading(false);
  }, []);

  // Remove camera initialization effect since MediaRecorderComponent handles this
  useEffect(() => {
    if (currentStep === 'photo') {
      // Only initialize camera for photo step
      initializeCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [currentStep])

  // Remove camera initialization and cleanup functions since they're no longer needed
  const initializeCamera = async () => {
    // This is now handled by MediaRecorderComponent
  }

  const stopCamera = () => {
    // This is now handled by MediaRecorderComponent
  }

  const handleSecuritySubmit = (data: SecurityData) => {
    setSecurityData(data)
    handleNext()
  }

  const handleVerificationSubmit = (data: VerificationData) => {
    setVerificationData(data)
    handleNext()
  }

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingReviewData, setPendingReviewData] = useState<ReviewFormData | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [kycDetails, setKycDetails] = useState<any>(null);
  const [backendScreenData, setBackendScreenData] = useState<BackendScreenData | null>(null);

  const handleOpenConfirm = (reviewData: ReviewFormData) => {
    setPendingReviewData(reviewData);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingReviewData) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const payload = transformKycPayload({
        ...pendingReviewData,
        kyc_case_id: parseInt(kycCaseId, 10),
      });
      const response = await fetch(`${apiUrl}/kyc/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || "Failed to submit KYC";
        toast.error(errorMessage);
        return;
      }
      const result = await response.json();
      setKycDetails(result);
      setShowConfirmDialog(false);
      setShowSuccessModal(true);
      // Fetch updated progress and update UI
      await fetchProgress();
      // Force current step to kyc_submitted since we know it's completed
      setCurrentStep('kyc_submitted');
      // Fetch updated screen data
      const screenDataRes = await fetch(`${apiUrl}/kyc/screen-data/${kycCaseId}`);
      if (screenDataRes.ok) {
        const screenData = await screenDataRes.json();
        setBackendScreenData(screenData);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit KYC. Please try again.");
    }
  };

  const getCurrentStepIndex = (step: StepId): number => {
    return stepOrder.indexOf(step);
  };

  const getNextStep = (current: StepId): StepId => {
    const currentIndex = getCurrentStepIndex(current);
    return stepOrder[currentIndex + 1] || current;
  };

  const getPreviousStep = (current: StepId): StepId => {
    const currentIndex = getCurrentStepIndex(current);
    return stepOrder[currentIndex - 1] || current;
  };

  const handleBack = () => {
    if (currentStep !== "registration") {
      setCurrentStep(getPreviousStep(currentStep));
      setShowReview(false);
    }
  };

  const handleNext = () => {
    if (currentStep !== "review") {
      setCurrentStep(getNextStep(currentStep));
    }
  };

  const removeUpload = (type: DocumentType) => {
    setUploads(prev => ({
      ...prev,
      [type]: { type, file: null, preview: null, status: 'pending' }
    }))
  }

  const isStepComplete = (stepId: StepId): boolean => {
    return completedSteps.includes(stepId);
  };

  const isCurrentStep = (stepId: StepId): boolean => {
    return currentStep === stepId;
  };

  const renderCameraInterface = () => {
    if (currentStep === 'photo') {
      return (
        <SelfieSection
          kycCaseId={kycCaseId}
          onComplete={() => {
            setCompletedSteps(prev => [...prev, "selfie"]);
            setCurrentStep("video");
          }}
          onFileUploaded={handleFileUploaded}
        />
      );
    }
    return null;
  }

  const [isStepperVisible, setIsStepperVisible] = useState(true)
  const [isMobileStepperOpen, setIsMobileStepperOpen] = useState(false)

  const handleRegistrationComplete = async (data: UserRegistrationData) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/kyc/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...data,
          kyc_case_id: parseInt(kycCaseId, 10),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || "Failed to register user";
        toast.error(errorMessage);
        return;
      }
      setCompletedSteps(prev => [...prev, "registration"]);
      setCurrentStep("aadhar");
      toast.success("Registration successful!");
      await fetchProgress();
    } catch (error: any) {
      toast.error(error.message || "Failed to register. Please try again.");
    }
  };

  const handleAadharComplete = async () => {
    setCompletedSteps(prev => [...prev, "aadhar"]);
    setCurrentStep("pancard");
    await fetchProgress();
  };

  const handlePanCardComplete = async () => {
    setCompletedSteps(prev => [...prev, "pancard"]);
    setCurrentStep("passport");
    await fetchProgress();
  };

  const handleSubmitKyc = async (reviewData: ReviewFormData) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const payload = transformKycPayload({
        ...reviewData,
        kyc_case_id: parseInt(kycCaseId, 10),
      });
      const response = await fetch(`${apiUrl}/kyc/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || "Failed to submit KYC";
        toast.error(errorMessage);
        return;
      }
      // Fetch the submitted details (assuming you want to show them)
      const detailsResponse = await fetch(`${apiUrl}/kyc/details?kyc_case_id=${payload.kyc_case_id}`);
      const details = await detailsResponse.json();
      setKycDetails(details);
      setShowSuccessModal(true);
      await fetchProgress();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit KYC. Please try again.");
    }
  };

  const handleFileUploaded = (type: string) => {
    setUploads(prev => ({
      ...prev,
      [type as DocumentType]: {
        ...prev[type as DocumentType],
        status: 'success'
      }
    }));
  };

  // Fetch backend screen data when entering review step
  useEffect(() => {
    async function fetchScreenData() {
      setIsScreenDataLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/kyc/screen-data/${kycCaseId}`);
        if (res.ok) {
          const data: BackendScreenData = await res.json();
          setBackendScreenData(data);
        }
      } catch (err) {
        console.error('Failed to fetch KYC screen data', err);
      } finally {
        setIsScreenDataLoading(false)
      }
    }
    if (currentStep === 'review' || currentStep === 'kyc_submitted' && kycCaseId) {
      fetchScreenData();
    }
  }, [currentStep, kycCaseId]);

  // Helper to map backend details to review form fields
  function mapBackendDetailsToForm(details: any): Partial<KycFormData> {
    console.log('Mapping backend details:', details);
    if (!details) return {};
    return {
      name: details.name || '',
      dateOfBirth: details.dob || '',
      gender: details.gender || '',
      address: details.address ? (() => {
        const [street, city, state, pincode] = details.address.split(',').map((s: string) => s.trim());
        return { street, city, state, pincode };
      })() : { street: '', city: '', state: '', pincode: '' },
      fatherName: details.father_name || '',
      aadharNumber: details.aadhar_number || '',
      panNumber: details.pan_number || '',
      email: details.email || '',
      phone: details.phone || '',
      occupation: details.occupation || '',
      sourceOfFunds: details.source_of_funds || '',
      businessType: details.business_type || '',
      isPep: details.is_pep || false,
      pepDetails: details.pep_details || '',
      annualIncome: details.annual_income || '',
      purposeOfAccount: details.purpose_of_account || '',
      nationality: details.nationality || '',
      maritalStatus: details.marital_status || '',
      nomineeName: details.nominee_name || '',
      nomineeRelation: details.nominee_relation || '',
      nomineeContact: details.nominee_contact || '',
    };
  }

  // Helper to map backend documents to KycReviewForm documents prop
  function mapBackendDocumentsToForm(documents: any[]): {
    aadharFront?: string;
    aadharBack?: string;
    pancard?: string;
    passport?: string;
    photo?: string;
    selfie?: string;
    video?: string;
  } {
    const docMap: any = {};
    documents.forEach((doc: any) => {
      if (doc.doc_type === 'aadhar_front') docMap.aadharFront = doc.file_path;
      if (doc.doc_type === 'aadhar_back') docMap.aadharBack = doc.file_path;
      if (doc.doc_type === 'pancard') docMap.pancard = doc.file_path;
      if (doc.doc_type === 'passport') docMap.passport = doc.file_path;
      if (doc.doc_type === 'photo') docMap.photo = doc.file_path;
      if (doc.doc_type === 'selfie') docMap.selfie = doc.file_path;
      if (doc.doc_type === 'video') docMap.video = doc.file_path;
    });
    return docMap;
  }

  const renderStep = () => {
    // Show progress loader if progress is being fetched
    if (isProgressLoading) {
      return <StepLoader text="Loading progress..." />
    }

    // Show screen data loader if screen data is being fetched for review step
    if ((currentStep === 'review' || currentStep === 'kyc_submitted') && isScreenDataLoading) {
      return <ReviewLoader />
    }

    switch (currentStep) {
      case "registration":
        return (
          <UserRegistration
            onComplete={handleRegistrationComplete}
            onBack={() => window.history.back()}
          />
        );
      case "aadhar":
        return (
          <AadharSection
            kycCaseId={kycCaseId}
            onComplete={handleAadharComplete}
            onFileUploaded={handleFileUploaded}
          />
        );
      case "pancard":
        return (
          <PanCardSection
            kycCaseId={kycCaseId}
            onComplete={handlePanCardComplete}
            onFileUploaded={handleFileUploaded}
          />
        );
      case "passport":
        return (
          <PassportSection
            kycCaseId={kycCaseId}
            onComplete={async () => {
              setCompletedSteps(prev => [...prev, "passport"]);
              setCurrentStep("photo");
              await fetchProgress();
            }}
            onFileUploaded={handleFileUploaded}
          />
        );
      case "photo":
        return (
          <PhotoSection
            kycCaseId={kycCaseId}
            onComplete={async () => {
              setCompletedSteps(prev => [...prev, "photo"]);
              setCurrentStep("selfie");
              await fetchProgress();
            }}
            onFileUploaded={handleFileUploaded}
          />
        );
      case "selfie":
        return (
          <SelfieSection
            kycCaseId={kycCaseId}
            onComplete={async () => {
              setCompletedSteps(prev => [...prev, "selfie"]);
              setCurrentStep("video");
              await fetchProgress();
            }}
            onFileUploaded={handleFileUploaded}
          />
        );
      case "video":
        return (
          <div className="space-y-6">
            <MediaRecorderComponent
              kycCaseId={kycCaseId}
              onRecordingComplete={(file) => {
                setUploads(prev => ({
                  ...prev,
                  video: {
                    type: 'video',
                    file,
                    preview: URL.createObjectURL(file),
                    status: 'success'
                  }
                }));
                handleFileUploaded('video');
              }}
              onError={(error) => {
                toast.error(error);
                setUploads(prev => ({
                  ...prev,
                  video: {
                    ...prev.video,
                    status: 'error',
                    error
                  }
                }));
              }}
              uploadUrl={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/kyc/upload`}
              onUploadComplete={async () => {
                setCompletedSteps(prev => [...prev, "video"]);
                setCurrentStep("review");
                await fetchProgress();
              }}
              maxDuration={10}
              minDuration={5}
            />
            {uploads.video.status === 'success' && (
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep("review")}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Continue to Review
                  <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        );
      case "review": {
        console.log('backendScreenData', backendToFrontendStep);
        const kycSubmittedStatus: string = backendScreenData?.kyc_submitted?.status ?? "pending";
        const isReviewCompleted = kycSubmittedStatus === "completed";
        return (
          <KycReviewForm
            documents={backendScreenData ? mapBackendDocumentsToForm(backendScreenData.documents || []) : {}}
            initialData={backendScreenData ? mapBackendDetailsToForm(backendScreenData.details) : {}}
            readOnly={isReviewCompleted}
            kycSubmittedStatus={kycSubmittedStatus}
            onSubmit={handleOpenConfirm}
            onBack={() => setShowReview(false)}
          />
        );
      }
      case "kyc_submitted": {
        console.log('backendScreenData', backendToFrontendStep);
        const kycSubmittedStatus: string = backendScreenData?.kyc_submitted?.status ?? "pending";
        const isReviewCompleted = kycSubmittedStatus === "completed";
        return (
          <KycReviewForm
            documents={backendScreenData ? mapBackendDocumentsToForm(backendScreenData.documents || []) : {}}
            initialData={backendScreenData ? mapBackendDetailsToForm(backendScreenData.details) : {}}
            readOnly={true}
            kycSubmittedStatus={kycSubmittedStatus}
            onSubmit={handleOpenConfirm}
            onBack={() => setShowReview(false)}
          />
        );
      }
      default:
        return null;
    }
  };

  if (isKycCaseLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-semibold text-gray-700">Creating your KYC case...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex">
          {/* Mobile Stepper Toggle Button - Fixed at top */}
          <div className="fixed top-20 left-4 z-40 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileStepperOpen(!isMobileStepperOpen)}
              className="inline-flex items-center rounded-full bg-white p-2 shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isMobileStepperOpen ? (
                <XMarkIconSolid className="h-6 w-6 text-gray-600" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-600" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Main Content */}
          <div className={`flex-1 ${isStepperVisible ? 'lg:mr-80' : ''} transition-all duration-300`}>
            <div className="mx-auto max-w-3xl py-8">
              {renderStep()}
            </div>
          </div>

          {/* Stepper Sidebar */}
          <div 
            className={`fixed inset-y-0 right-0 z-30 w-80 transform overflow-y-auto bg-white px-4 py-6 shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
              isMobileStepperOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
            }`}
          >
            {/* Mobile Close Button */}
            <div className="flex justify-end lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileStepperOpen(false)}
                className="rounded-md bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <XMarkIconSolid className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Desktop Toggle Button */}
            <div className="hidden lg:block">
              <button
                type="button"
                onClick={() => setIsStepperVisible(!isStepperVisible)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isStepperVisible ? (
                  <>
                    <ChevronRightIcon className="h-5 w-5 mr-1" />
                    Hide Progress
                  </>
                ) : (
                  <>
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Show Progress
                  </>
                )}
              </button>
            </div>

            {/* Stepper Content */}
            <div className="mt-6">
              <nav aria-label="Progress">
                <ol role="list" className="space-y-4">
                  {steps.map((step) => (
                    <li key={step.id} className="md:flex-1">
                      <div
                        className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                          isStepComplete(step.id)
                            ? "border-indigo-600"
                            : isCurrentStep(step.id)
                            ? "border-indigo-600"
                            : "border-gray-200"
                        }`}
                      >
                        <span
                          className={`text-sm font-medium ${
                            isStepComplete(step.id)
                              ? "text-indigo-600"
                              : isCurrentStep(step.id)
                              ? "text-indigo-600"
                              : "text-gray-500"
                          }`}
                        >
                          {step.title}
                        </span>
                        <span className="text-sm text-gray-500">{step.description}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>

              {/* Progress Summary */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Progress Summary</h3>
                <dl className="mt-2 space-y-2 text-sm text-gray-500">
                  {/* <div className="flex justify-between">
                    <dt>Registration Status</dt>
                    <dd className="font-medium text-gray-900">
                      {userData ? 'Completed' : 'Pending'}
                    </dd>
                  </div> */}
                  {/* <div className="flex justify-between">
                    <dt>Files Uploaded</dt>
                    <dd className="font-medium text-gray-900">
                      {Object.values(uploads).filter(upload => upload.status === 'success').length} / {Object.keys(uploads).length}
                    </dd>
                  </div> */}
                  <div className="flex justify-between">
                    <dt>Current Step</dt>
                    <dd className="font-medium text-gray-900">
                      {currentStep === 'registration' ? 'Registration' : `${currentStep}`}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmSubmit}
          isLoading={false}
        >
          <div>
            Are you sure you want to submit your KYC details? This action cannot be undone.
          </div>
        </ConfirmationDialog>
      )}
      {showSuccessModal && (
        <ConfirmationDialog
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          onConfirm={() => {}}
          isLoading={false}
          success={true}
        >
          <div className="font-semibold text-lg mb-2">KYC Submitted Successfully!</div>
          <div>Your KYC details have been submitted.</div>
          {kycDetails && (
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto mt-2">
              {JSON.stringify(kycDetails, null, 2)}
            </pre>
          )}
        </ConfirmationDialog>
      )}
    </div>
  )
} 