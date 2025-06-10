'use client'

import React, { useState, useRef, useEffect } from 'react'
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
import { AadharSection } from '@/components/kyc/AadharSection'
import { PanCardSection } from '@/components/kyc/PanCardSection'
import { PassportSection } from '@/components/kyc/PassportSection'
import { PhotoSection } from '@/components/kyc/PhotoSection'
import { SelfieSection } from '@/components/kyc/SelfieSection'
import { VideoSection } from '@/components/kyc/VideoSection'
import { StepLoader } from '@/components/ui/loader'

const steps = [
  {
    id: 'registration',
    name: 'User Registration',
    description: 'Create your account and verify contact details'
  },
  {
    id: 'aadhar',
    name: 'Aadhar Card',
    description: 'Upload front and back of your Aadhar card'
  },
  {
    id: 'pancard',
    name: 'PAN Card Upload',
    description: 'Upload a clear image of your PAN card'
  },
  {
    id: 'passport',
    name: 'Passport Upload',
    description: 'Upload your passport details page'
  },
  {
    id: 'photo',
    name: 'Passport Size Photo',
    description: 'Upload a recent passport size photo'
  },
  {
    id: 'selfie',
    name: 'Selfie Photo',
    description: 'Take a selfie photo for verification'
  },
  {
    id: 'video',
    name: 'Video Verification',
    description: 'Record a short verification video'
  }
]

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

export default function SelfKycPage() {
  const [currentStep, setCurrentStep] = useState(-1) // -1 for registration, 0+ for KYC steps
  const [showReview, setShowReview] = useState(false)
  const [isProgressLoading, setIsProgressLoading] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [kycSubmittedStatus, setKycSubmittedStatus] = useState<string>('pending')
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
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [kycDetails, setKycDetails] = useState<any>(null)
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
  const [kycCaseId, setKycCaseId] = useState<number | null>(null)
  const [isKycCaseLoading, setIsKycCaseLoading] = useState(false)

  // Camera related states
  const [cameraMode, setCameraMode] = useState<CameraMode>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showVideoPreview, setShowVideoPreview] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize camera when needed
  useEffect(() => {
    if (currentStep === 4 || currentStep === 5) {
      initializeCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [currentStep])

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: currentStep === 5 // Enable audio only for video recording
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Ensure video is playing
        await videoRef.current.play().catch(error => {
          console.error('Error playing video:', error)
        })
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setUploads(prev => ({
        ...prev,
        aadhar: {
          ...prev.aadhar,
          status: 'error',
          error: 'Could not access camera. Please ensure camera permissions are granted.'
        }
      }))
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !stream) {
      console.error('Video element or stream not available')
      return
    }

    try {
      // Ensure video is playing and has valid dimensions
      if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        console.error('Video not ready')
        return
      }

      const canvas = document.createElement('canvas')
      // Use actual video dimensions
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('Could not get canvas context')
        return
      }

      // Draw the current video frame
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

      // Convert to blob with better quality
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Failed to create blob from canvas')
            return
          }

          const file = new File([blob], 'selfie.jpg', { 
            type: 'image/jpeg',
            lastModified: Date.now()
          })

          const reader = new FileReader()
          reader.onload = () => {
            setUploads(prev => ({
              ...prev,
              selfie: {
                type: 'image',
                file,
                preview: reader.result as string,
                status: 'success'
              }
            }))
            // Don't stop camera immediately to allow for retakes
            // stopCamera()
          }
          reader.onerror = (error) => {
            console.error('Error reading file:', error)
            setUploads(prev => ({
              ...prev,
              selfie: {
                ...prev.selfie,
                status: 'error',
                error: 'Failed to process photo'
              }
            }))
          }
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        0.95 // Higher quality
      )
    } catch (error) {
      console.error('Error capturing photo:', error)
      setUploads(prev => ({
        ...prev,
        selfie: {
          ...prev.selfie,
          status: 'error',
          error: 'Failed to capture photo'
        }
      }))
    }
  }

  const startRecording = () => {
    if (stream) {
      try {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond: 2500000 // 2.5 Mbps for better quality
        })
        mediaRecorderRef.current = mediaRecorder
        chunksRef.current = []

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data)
          }
        }

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' })
          const file = new File([blob], 'verification.webm', { 
            type: 'video/webm',
            lastModified: Date.now()
          })
          
          const reader = new FileReader()
          reader.onload = () => {
            setUploads(prev => ({
              ...prev,
              video: {
                type: 'video',
                file,
                preview: reader.result as string,
                status: 'success'
              }
            }))
            // Show preview after recording
            setShowVideoPreview(true)
            if (videoPreviewRef.current) {
              videoPreviewRef.current.src = URL.createObjectURL(blob)
            }
          }
          reader.onerror = (error) => {
            console.error('Error reading video file:', error)
            setUploads(prev => ({
              ...prev,
              video: {
                ...prev.video,
                status: 'error',
                error: 'Failed to process video'
              }
            }))
          }
          reader.readAsDataURL(blob)
        }

        mediaRecorder.start(100) // Collect data every 100ms
        setIsRecording(true)
        setRecordingTime(0)
        
        // Start recording timer
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)

      } catch (error) {
        console.error('Error starting recording:', error)
        setUploads(prev => ({
          ...prev,
          video: {
            ...prev.video,
            status: 'error',
            error: 'Failed to start recording'
          }
        }))
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
        // Clear recording timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
          recordingTimerRef.current = null
        }
      } catch (error) {
        console.error('Error stopping recording:', error)
        setUploads(prev => ({
          ...prev,
          video: {
            ...prev.video,
            status: 'error',
            error: 'Failed to stop recording'
          }
        }))
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleRetakeVideo = () => {
    setShowVideoPreview(false)
    setUploads(prev => ({
      ...prev,
      video: { type: 'video', file: null, preview: null, status: 'pending' }
    }))
    if (videoPreviewRef.current) {
      videoPreviewRef.current.src = ''
    }
    setRecordingTime(0)
  }

  const handleConfirmVideo = () => {
    stopCamera()
    setShowVideoPreview(false)
  }

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      const currentDocType = getCurrentDocumentType()
      
      if (file) {
        if (currentDocType === 'aadhar') {
          const currentSide = aadharSides.front.status === 'success' ? 'back' : 'front'
          
          // Set uploading status
          setAadharSides(prev => ({
            ...prev,
            [currentSide]: {
              ...prev[currentSide],
              status: 'uploading',
              error: undefined
            }
          }))

          try {
            // Read file as data URL
            const preview = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            })

            // Update with preview and success status
            setAadharSides(prev => ({
              ...prev,
              [currentSide]: {
                type: 'image',
                file,
                preview,
                status: 'success',
                error: undefined,
                side: currentSide
              }
            }))

            // Update main uploads state for the side
            setUploads(prev => ({
              ...prev,
              [`aadhar-${currentSide}`]: {
                type: 'image',
                file,
                preview,
                status: 'success',
                error: undefined,
                side: currentSide
              },
              // Optionally, keep the combined 'aadhar' status for compatibility
              aadhar: {
                ...prev.aadhar,
                status: (currentSide === 'front'
                  ? (aadharSides.back.status === 'success')
                  : (aadharSides.front.status === 'success'))
                  ? 'success'
                  : 'pending',
              }
            }))
          } catch (error) {
            console.error('Error processing file:', error)
            setAadharSides(prev => ({
              ...prev,
              [currentSide]: {
                ...prev[currentSide],
                status: 'error',
                error: 'Failed to process file. Please try again.'
              }
            }))
          }
        } else {
          // Handle other document types as before
          setUploads(prev => ({
            ...prev,
            [currentDocType]: {
              ...prev[currentDocType],
              status: 'uploading',
              error: undefined
            }
          }))

          try {
            const preview = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            })

            setUploads(prev => ({
              ...prev,
              [currentDocType]: {
                type: currentDocType === 'pancard' ? 'pdf' : 'image',
                file,
                preview,
                status: 'success',
                error: undefined
              }
            }))
          } catch (error) {
            console.error('Error processing file:', error)
            setUploads(prev => ({
              ...prev,
              [currentDocType]: {
                ...prev[currentDocType],
                status: 'error',
                error: 'Failed to process file. Please try again.'
              }
            }))
          }
        }
      }
    },
    onDropRejected: (rejectedFiles) => {
      const currentDocType = getCurrentDocumentType()
      setUploads(prev => ({
        ...prev,
        [currentDocType]: {
          ...prev[currentDocType],
          status: 'error',
          error: 'Invalid file type. Please upload JPG, PNG, or PDF files only.'
        }
      }))
    }
  })

  const getCurrentDocumentType = (): DocumentType => {
    switch (currentStep) {
      case 0: return 'aadhar'  // Combined Aadhar step
      case 1: return 'pancard' // PAN card step
      case 2: return 'passport' // Passport step
      case 3: return 'photo'   // Passport photo step
      case 4: return 'selfie'  // Selfie step
      case 5: return 'video'   // Video step
      default: return 'aadhar' // Default to Aadhar
    }
  }

  const currentUploads = {
    aadhar: uploads.aadhar.file,
    pancard: uploads.pancard.file,
    passport: uploads.passport.file,
    photo: uploads.photo.file,
    selfie: uploads.selfie.file,
    video: uploads.video.file
  }

  const handleSecuritySubmit = (data: SecurityData) => {
    setSecurityData(data)
    handleNext()
  }

  const handleVerificationSubmit = (data: VerificationData) => {
    setVerificationData(data)
    handleNext()
  }

  const handleSubmit = async (reviewData: ReviewFormData) => {
    const updatedFormData = { ...formData, ...reviewData }
    setFormData(updatedFormData)
    setShowConfirmation(true)
  }

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    try {
      // TODO: Implement actual API call to submit KYC
      const submissionData = {
        ...formData,
        userData, // Include user registration data
        security: securityData,
        verification: verificationData
      }
      console.log('Submitting KYC data:', submissionData)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      // On success, set showSuccessModal to true and update KYC status
      setKycSubmittedStatus('completed')
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error submitting KYC:', error)
      // Handle error appropriately
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setShowReview(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) { // If we're at the last document step
        setShowReview(true)
      }
      setCurrentStep(prev => prev + 1)
    }
  }

  const removeUpload = (type: DocumentType) => {
    setUploads(prev => ({
      ...prev,
      [type]: { type, file: null, preview: null, status: 'pending' }
    }))
  }

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 0: return aadharSides.front.status === 'success' && aadharSides.back.status === 'success'
      case 1: return uploads.pancard.status === 'success'
      case 2: return uploads.passport.status === 'success'
      case 3: return uploads.photo.status === 'success'
      case 4: return uploads.selfie.status === 'success'
      case 5: return uploads.video.status === 'success'
      default: return false
    }
  }

  const renderCameraInterface = () => {
    if (currentStep === 4) {
      return (
        <SelfieSection
          kycCaseId={kycCaseId?.toString() || ''}
          onComplete={() => {
            setCompletedSteps(prev => [...prev, "selfie"]);
            setCurrentStep(5);
          }}
          onFileUploaded={handleFileUploaded}
        />
      );
    }
    // Keep the video logic for currentStep === 5 if needed, or handle similarly
    // ...
    return null;
  }

  const [isStepperVisible, setIsStepperVisible] = useState(true)
  const [isMobileStepperOpen, setIsMobileStepperOpen] = useState(false)

  const handleRegistrationComplete = async (data: UserRegistrationData) => {
    setUserData(data)
    setIsKycCaseLoading(true)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    try {
      const formData = new FormData()
      formData.append('user_id', data.email) // Use email as the user identifier
      const res = await fetch(`${apiUrl}/kyc/case`, {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()
      setKycCaseId(result.kyc_case_id)
      setCurrentStep(0)
    } catch (err) {
      alert('Failed to create KYC case. Please try again.')
    } finally {
      setIsKycCaseLoading(false)
    }
  }

  const handleFileUploaded = (type: string) => {
    setUploads(prev => ({
      ...prev,
      [type as DocumentType]: {
        ...prev[type as DocumentType],
        status: 'success'
      }
    }));
  };

  const handleAadharComplete = () => {
    setCurrentStep(1);
  };

  const renderReviewForm = () => (
    <KycReviewForm
      documents={{
        aadharFront: aadharSides.front.preview || undefined,
        aadharBack: aadharSides.back.preview || undefined,
        pancard: uploads.pancard.preview || undefined,
        passport: uploads.passport.preview || undefined,
        photo: uploads.photo.preview || undefined,
        selfie: uploads.selfie.preview || undefined,
        video: uploads.video.preview || undefined
      }}
      initialData={{
        email: userData?.email || '',
        phone: userData?.phone || '',
        // ... other initial data
      }}
      onSubmit={handleSubmit}
      onBack={() => setShowReview(false)}
      kycSubmittedStatus={kycSubmittedStatus}
    />
  )

  if (isKycCaseLoading) {
    return <StepLoader text="Creating your KYC case..." />
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
              {currentStep === -1 ? (
                <UserRegistration
                  onComplete={handleRegistrationComplete}
                  onBack={() => window.history.back()}
                />
              ) : showReview ? (
                renderReviewForm()
              ) : (
                <>
                  {/* Mobile Stepper Toggle */}
                  <div className="lg:hidden mb-4 flex justify-end">
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

                  {/* Document Upload Steps */}
                  <div className="space-y-6">
                    {currentStep < steps.length && (
                      <>
                        {currentStep === 4 || currentStep === 5 ? (
                          // Camera steps (selfie and video)
                          <div className="space-y-6">
                            {renderCameraInterface()}
                            {currentStep === 5 && uploads.video.status === 'success' && (
                              <div className="mt-6 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setShowReview(true)}
                                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                  Review KYC Details
                                  <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden="true" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Document upload steps
                          currentStep === 0 ? (
                            <AadharSection
                              kycCaseId={kycCaseId?.toString() || ''}
                              onComplete={handleAadharComplete}
                              onFileUploaded={handleFileUploaded}
                            />
                          ) : (
                            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center" {...getRootProps()}>
                              <input {...getInputProps()} />
                              
                              {uploads[getCurrentDocumentType()].status === 'uploading' && (
                                <div className="space-y-4">
                                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                                  <div className="text-sm text-gray-600">Uploading document...</div>
                                </div>
                              )}

                              {uploads[getCurrentDocumentType()].status === 'error' && (
                                <div className="space-y-4">
                                  <XMarkIcon className="mx-auto h-12 w-12 text-red-500" />
                                  <div className="text-sm text-red-600">{uploads[getCurrentDocumentType()].error}</div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeUpload(getCurrentDocumentType())
                                    }}
                                    className="rounded-md bg-red-100 px-4 py-2 text-sm text-red-600 hover:bg-red-200"
                                  >
                                    Try Again
                                  </button>
                                </div>
                              )}

                              {!isDragActive && uploads[getCurrentDocumentType()].status !== 'uploading' && uploads[getCurrentDocumentType()].status !== 'error' && (
                                <div className="space-y-4">
                                  <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                                  <div className="text-sm text-gray-600">
                                    Drag and drop your {getCurrentDocumentType().replace('-', ' ')} here, or click to select
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Supported formats: JPG, PNG, PDF (max 5MB)
                                  </div>
                                </div>
                              )}

                              {uploads[getCurrentDocumentType()].preview && (
                                <div className="mt-4">
                                  <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
                                    {uploads[getCurrentDocumentType()].type === 'pdf' ? (
                                      <div className="flex h-full items-center justify-center bg-gray-50">
                                        <DocumentIcon className="h-12 w-12 text-gray-400" />
                                      </div>
                                    ) : (
                                      <img
                                        src={uploads[getCurrentDocumentType()].preview || ''}
                                        alt={`${getCurrentDocumentType()} preview`}
                                        className="h-full w-full object-cover"
                                      />
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeUpload(getCurrentDocumentType())
                                      }}
                                      className="absolute top-2 right-2 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                                    >
                                      <XMarkIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </>
                    )}
                  </div>

                  {currentStep >= 0 && currentStep < steps.length - 2 && (
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowLeftIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={
                          getCurrentDocumentType() === 'aadhar'
                            ? !(uploads['aadhar-front'].status === 'success' && uploads['aadhar-back'].status === 'success')
                            : !isStepComplete(currentStep)
                        }
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </>
              )}
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
                  {steps.map((step, index) => (
                    <li key={step.id}>
                      <div className="group relative flex items-start">
                        <span className="flex items-center">
                          <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                            currentStep === index - 1
                              ? 'bg-indigo-600'
                              : currentStep > index - 1
                              ? 'bg-green-500'
                              : 'bg-gray-200'
                          }`}>
                            {currentStep > index - 1 ? (
                              <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                            ) : (
                              <span className={`text-sm font-medium ${
                                currentStep === index - 1 ? 'text-white' : 'text-gray-500'
                              }`}>
                                {index}
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="ml-3 flex min-w-0 flex-col">
                          <span className={`
                            text-sm font-medium ${
                              currentStep === index - 1 ? 'text-indigo-600' : 'text-gray-500'
                            }
                          `}>
                            {step.name}
                          </span>
                          <span className="text-sm text-gray-500">{step.description}</span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <ConfirmationDialog
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmSubmit}
          isLoading={isSubmitting}
        >
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
              <CheckCircleIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Submit KYC Application
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to submit your KYC application? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </ConfirmationDialog>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">KYC Submitted Successfully!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your KYC application has been submitted and is under review. You will receive updates via email and SMS.
              </p>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}