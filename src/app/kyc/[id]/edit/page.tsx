'use client'

import React, { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { useParams, useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { DocumentArrowUpIcon, FaceSmileIcon, ArrowPathIcon, ExclamationTriangleIcon, ShieldExclamationIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'

interface BackendScreenData {
  case: {
    id: number
    user_id: number
    status: string
    created_at: string
    updated_at: string
  }
  details: {
    name: string
    dob: string
    gender: string
    address: string
    father_name: string
    aadhar_number: string
    pan_number: string
    email: string
    phone: string
    occupation: string
    source_of_funds: string
    business_type: string
    is_pep: boolean
    pep_details: string
    annual_income: string
    purpose_of_account: string
    nationality: string
    marital_status: string
    nominee_name: string
    nominee_relation: string
    nominee_contact: string
  } | null
  documents: Array<{
    id: number
    doc_type: string
    file_path: string
    uploaded_at: string
  }>
  status: {
    status: string
    created_at: string
    updated_at: string
  } | null
  kyc_submitted?: {
    status: string
  }
}

interface FormData {
  name: string
  dob: string
  gender: string
  address: string
  father_name: string
  aadhar_number: string
  pan_number: string
  email: string
  phone: string
  occupation: string
  source_of_funds: string
  business_type: string
  is_pep: boolean
  pep_details: string
  annual_income: string
  purpose_of_account: string
  nationality: string
  marital_status: string
  nominee_name: string
  nominee_relation: string
  nominee_contact: string
}

// Update the step type definition
type StepId = "personal" | "documents" | "risk_analysis" | "review"

// Update the steps array with proper typing
const steps: { id: StepId; title: string; description: string }[] = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Enter your personal details",
  },
  {
    id: "documents",
    title: "Documents",
    description: "View your identity documents",
  },
  {
    id: "risk_analysis",
    title: "Risk Analysis",
    description: "Analyze customer risk profile",
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Review your information before submitting",
  },
]

// Update the step order array with proper typing
const stepOrder: StepId[] = ["personal", "documents", "risk_analysis", "review"]

// Add this helper function near the top of the file, after the imports
const getBackendUrl = (path: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // If the path is already a full URL, return it as is
  if (path.startsWith('http')) return path;
  
  // If it's an S3 URL, we'll handle this separately with state
  if (path.startsWith('s3://')) {
    return path; // Return as is, will be resolved by component
  }
  
  // Remove any leading slashes from the path
  const cleanPath = path.replace(/^\/+/, '');
  
  // If the path already includes 'uploads/', use it as is
  if (cleanPath.startsWith('uploads\\')) {
    return `${apiUrl}/${cleanPath}`;
  }
  
  // If the path is just a filename, add it to uploads/
  return `${apiUrl}/uploads/${cleanPath.replace(/^uploads\//, '')}`;
};

// Helper function to get pre-signed URLs for S3 files
const getS3PresignedUrl = async (s3Path: string): Promise<string> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  try {
    const response = await fetch(`${apiUrl}/files/${encodeURIComponent(s3Path)}`);
    if (response.ok) {
      const data = await response.json();
      return data.download_url;
    } else {
      console.error('Failed to get pre-signed URL for S3 file:', s3Path);
      return s3Path; // Fallback to original path
    }
  } catch (error) {
    console.error('Error getting pre-signed URL:', error);
    return s3Path; // Fallback to original path
  }
};

export default function EditKycForm() {
  const params = useParams()
  const router = useRouter()
  const kycId = params.id as string

  // Move currentStep state inside the component
  const [currentStep, setCurrentStep] = useState<StepId>("personal")
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [screenData, setScreenData] = useState<BackendScreenData | null>(null)
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({})

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    dob: '',
    gender: '',
    address: '',
    father_name: '',
    aadhar_number: '',
    pan_number: '',
    email: '',
    phone: '',
    occupation: '',
    source_of_funds: '',
    business_type: '',
    is_pep: false,
    pep_details: '',
    annual_income: '',
    purpose_of_account: '',
    nationality: '',
    marital_status: '',
    nominee_name: '',
    nominee_relation: '',
    nominee_contact: ''
  })

  // Fetch KYC screen data
  useEffect(() => {
    const fetchScreenData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        console.log('Fetching screen data for KYC case:', kycId)
        const response = await fetch(`${apiUrl}/kyc/screen-data/${kycId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch KYC data')
        }

        const data: BackendScreenData = await response.json()
        console.log('Received screen data:', data)
        setScreenData(data)

        // Resolve S3 URLs for documents
        if (data.documents) {
          const urlPromises = data.documents.map(async (doc) => {
            if (doc.file_path.startsWith('s3://')) {
              const resolvedUrl = await getS3PresignedUrl(doc.file_path);
              return { [doc.file_path]: resolvedUrl };
            }
            return {};
          });
          
          const resolvedUrlObjects = await Promise.all(urlPromises);
          const newResolvedUrls = resolvedUrlObjects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
          setResolvedUrls(newResolvedUrls);
        }

        // Update form data if details exist
        if (data.details) {
          console.log('Mapping details to form:', data.details)
          const mappedData = {
            name: data.details.name || '',
            dob: data.details.dob || '',
            gender: data.details.gender || '',
            address: data.details.address || '',
            father_name: data.details.father_name || '',
            aadhar_number: data.details.aadhar_number || '',
            pan_number: data.details.pan_number || '',
            email: data.details.email || '',
            phone: data.details.phone || '',
            occupation: data.details.occupation || '',
            source_of_funds: data.details.source_of_funds || '',
            business_type: data.details.business_type || '',
            is_pep: data.details.is_pep || false,
            pep_details: data.details.pep_details || '',
            annual_income: data.details.annual_income || '',
            purpose_of_account: data.details.purpose_of_account || '',
            nationality: data.details.nationality || '',
            marital_status: data.details.marital_status || '',
            nominee_name: data.details.nominee_name || '',
            nominee_relation: data.details.nominee_relation || '',
            nominee_contact: data.details.nominee_contact || ''
          }
          console.log('Mapped form data:', mappedData)
          setFormData(mappedData)
        } else {
          console.log('No details found in screen data')
        }

        // Update files list from documents
        if (data.documents) {
          console.log('Mapping documents:', data.documents)
          const mappedFiles = data.documents.map(doc => ({
            name: doc.file_path.split('/').pop(),
            type: doc.doc_type,
            uploaded: new Date(doc.uploaded_at).toLocaleDateString(),
            status: 'Verified'
          }))
          console.log('Mapped files:', mappedFiles)
          setFiles(mappedFiles)
        }
      } catch (err) {
        console.error('Error fetching screen data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        toast.error('Failed to fetch KYC data')
      } finally {
        setIsLoading(false)
      }
    }

    if (kycId) {
      fetchScreenData()
    }
  }, [kycId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
        name: file.name,
        type: file.type,
        uploaded: new Date().toLocaleDateString(),
        status: 'Pending'
      }))])
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    }
  })

  const handleSubmit = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      console.log('Submitting form data:', formData)
      const response = await fetch(`${apiUrl}/kyc/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          kyc_case_id: parseInt(kycId, 10)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Submit error response:', errorData)
        throw new Error(errorData.detail || 'Failed to update KYC details')
      }

      const result = await response.json()
      console.log('Submit success response:', result)
      toast.success('KYC details updated successfully')
      router.push(`/kyc/${kycId}`)
    } catch (err) {
      console.error('Submit error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update KYC details')
    }
  }

  // Helper function to get the correct URL for a document
  const getDocumentUrl = (filePath: string) => {
    // If we have a resolved URL for this S3 path, use it
    if (resolvedUrls[filePath]) {
      return resolvedUrls[filePath];
    }
    // Otherwise, use the regular backend URL function
    return getBackendUrl(filePath);
  };

  const renderStep = () => {
    switch (currentStep) {
      case "personal":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  id="dob"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.dob}
                  onChange={e => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.gender}
                  onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.address}
                  onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="aadhar_number" className="block text-sm font-medium text-gray-700">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  name="aadhar_number"
                  id="aadhar_number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.aadhar_number}
                  onChange={e => setFormData(prev => ({ ...prev, aadhar_number: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="pan_number" className="block text-sm font-medium text-gray-700">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="pan_number"
                  id="pan_number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.pan_number}
                  onChange={e => setFormData(prev => ({ ...prev, pan_number: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  id="occupation"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.occupation}
                  onChange={e => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="source_of_funds" className="block text-sm font-medium text-gray-700">
                  Source of Funds
                </label>
                <input
                  type="text"
                  name="source_of_funds"
                  id="source_of_funds"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.source_of_funds}
                  onChange={e => setFormData(prev => ({ ...prev, source_of_funds: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="business_type" className="block text-sm font-medium text-gray-700">
                  Business Type
                </label>
                <input
                  type="text"
                  name="business_type"
                  id="business_type"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.business_type}
                  onChange={e => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="annual_income" className="block text-sm font-medium text-gray-700">
                  Annual Income
                </label>
                <input
                  type="text"
                  name="annual_income"
                  id="annual_income"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.annual_income}
                  onChange={e => setFormData(prev => ({ ...prev, annual_income: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="purpose_of_account" className="block text-sm font-medium text-gray-700">
                  Purpose of Account
                </label>
                <input
                  type="text"
                  name="purpose_of_account"
                  id="purpose_of_account"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.purpose_of_account}
                  onChange={e => setFormData(prev => ({ ...prev, purpose_of_account: e.target.value }))}
                />
              </div>

              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_pep"
                    name="is_pep"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.is_pep}
                    onChange={e => setFormData(prev => ({ ...prev, is_pep: e.target.checked }))}
                  />
                  <label htmlFor="is_pep" className="ml-2 block text-sm text-gray-700">
                    Politically Exposed Person (PEP)
                  </label>
                </div>
              </div>

              {formData.is_pep && (
                <div className="sm:col-span-6">
                  <label htmlFor="pep_details" className="block text-sm font-medium text-gray-700">
                    PEP Details
                  </label>
                  <textarea
                    id="pep_details"
                    name="pep_details"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={formData.pep_details}
                    onChange={e => setFormData(prev => ({ ...prev, pep_details: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>
        )

      case "documents":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Documents</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your uploaded identity documents.
                </p>
              </div>

              <div className="sm:col-span-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {screenData?.documents.map((doc, index) => (
                    <div key={index} className="relative rounded-lg border border-gray-200 p-4">
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                        {doc.doc_type.includes('video') ? (
                          <div className="relative h-full w-full">
                            <video
                              key={doc.file_path}
                              controls
                              playsInline
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                console.error('Video playback error:', e);
                                const videoElement = e.target as HTMLVideoElement;
                                videoElement.style.display = 'none';
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'flex items-center justify-center h-full text-red-500 text-sm';
                                errorDiv.textContent = 'Error playing video. Please try downloading it.';
                                videoElement.parentElement?.appendChild(errorDiv);
                              }}
                            >
                              <source 
                                src={getDocumentUrl(doc.file_path)} 
                                type="video/webm;codecs=vp9,opus"
                              />
                              <source 
                                src={getDocumentUrl(doc.file_path)} 
                                type="video/webm"
                              />
                              <source 
                                src={getDocumentUrl(doc.file_path)} 
                                type="video/mp4"
                              />
                              Your browser does not support the video tag.
                            </video>
                            <div className="absolute bottom-2 right-2">
                              <a
                                href={getDocumentUrl(doc.file_path)}
                                download
                                className="inline-flex items-center rounded-full bg-black bg-opacity-50 px-2 py-1 text-xs text-white hover:bg-opacity-75"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={getDocumentUrl(doc.file_path)}
                            alt={`${doc.doc_type} document`}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              console.error('Image load error:', e);
                              const imgElement = e.target as HTMLImageElement;
                              imgElement.style.display = 'none';
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'flex items-center justify-center h-full text-red-500 text-sm';
                              errorDiv.textContent = 'Error loading image. Please try downloading it.';
                              imgElement.parentElement?.appendChild(errorDiv);
                            }}
                          />
                        )}
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          {doc.doc_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </h4>
                        <p className="mt-1 text-xs text-gray-500">
                          Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case "risk_analysis":
        const RiskIcon = () => {
          const riskLevel = calculateRiskLevel();
          switch (riskLevel) {
            case 'high':
              return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
            case 'medium':
              return <ShieldExclamationIcon className="h-6 w-6 text-yellow-500" />;
            default:
              return <ShieldCheckIcon className="h-6 w-6 text-green-500" />;
          }
        };

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Risk Analysis</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Analyze the customer's risk profile based on provided information.
                </p>
              </div>

              <div className="sm:col-span-6">
                <div className="rounded-lg border border-gray-200 p-6">
                  <div className="space-y-6">
                    {/* PEP Status */}
                    <div>
                      <h4 className="text-base font-medium text-gray-900">PEP Status</h4>
                      <div className="mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            checked={formData.is_pep}
                            onChange={e => setFormData(prev => ({ ...prev, is_pep: e.target.checked }))}
                          />
                          <span className="ml-2 text-sm text-gray-700">Politically Exposed Person (PEP)</span>
                        </label>
                        {formData.is_pep && (
                          <div className="mt-2">
                            <textarea
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              rows={3}
                              placeholder="Enter PEP details..."
                              value={formData.pep_details}
                              onChange={e => setFormData(prev => ({ ...prev, pep_details: e.target.value }))}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div>
                      <h4 className="text-base font-medium text-gray-900">Risk Factors</h4>
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Country Risk</label>
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={formData.nationality}
                            onChange={e => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                          >
                            <option value="">Select country</option>
                            <option value="low">Low Risk Country</option>
                            <option value="medium">Medium Risk Country</option>
                            <option value="high">High Risk Country</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Transaction Risk</label>
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={formData.source_of_funds}
                            onChange={e => setFormData(prev => ({ ...prev, source_of_funds: e.target.value }))}
                          >
                            <option value="">Select source</option>
                            <option value="low">Low Value Transactions</option>
                            <option value="medium">Medium Value Transactions</option>
                            <option value="high">High Value Transactions</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Occupation Risk</label>
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={formData.occupation}
                            onChange={e => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                          >
                            <option value="">Select occupation</option>
                            <option value="low">Low Risk Occupation</option>
                            <option value="medium">Medium Risk Occupation</option>
                            <option value="high">High Risk Occupation</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Business Type Risk</label>
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={formData.business_type}
                            onChange={e => setFormData(prev => ({ ...prev, business_type: e.target.value }))}
                          >
                            <option value="">Select business type</option>
                            <option value="low">Low Risk Business</option>
                            <option value="medium">Medium Risk Business</option>
                            <option value="high">High Risk Business</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Risk Summary */}
                    <div className="mt-6">
                      <h4 className="text-base font-medium text-gray-900">Risk Summary</h4>
                      <div className="mt-2 rounded-md bg-gray-50 p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <RiskIcon />
                          </div>
                          <div className="ml-3">
                            <h5 className="text-sm font-medium text-gray-900">
                              Overall Risk Level: {calculateRiskLevel().toUpperCase()}
                            </h5>
                            <p className="mt-1 text-sm text-gray-500">
                              {getRiskSummary()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <h4 className="text-base font-medium text-gray-900">Personal Information</h4>
                <dl className="mt-2 divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="text-sm text-gray-900">{formData.name}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="text-sm text-gray-900">{formData.dob}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="text-sm text-gray-900">{formData.gender}</dd>
                  </div>
                </dl>
              </div>

              <div className="sm:col-span-6">
                <h4 className="text-base font-medium text-gray-900">Uploaded Documents</h4>
                <ul role="list" className="mt-2 divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <li key={index} className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">{file.type}</dt>
                      <dd className="text-sm text-gray-900">{file.name}</dd>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Helper functions for risk analysis
  function calculateRiskLevel(): 'low' | 'medium' | 'high' {
    const riskFactors = [
      formData.is_pep ? 'high' : 'low',
      getRiskLevelFromValue(formData.nationality),
      getRiskLevelFromValue(formData.source_of_funds),
      getRiskLevelFromValue(formData.occupation),
      getRiskLevelFromValue(formData.business_type)
    ];

    if (riskFactors.includes('high')) return 'high';
    if (riskFactors.includes('medium')) return 'medium';
    return 'low';
  }

  function getRiskLevelFromValue(value: string): 'low' | 'medium' | 'high' {
    if (!value) return 'low';
    return value as 'low' | 'medium' | 'high';
  }

  function getRiskSummary(): string {
    const riskLevel = calculateRiskLevel();
    const factors = [];

    if (formData.is_pep) factors.push('PEP status');
    if (formData.nationality === 'high') factors.push('high-risk country');
    if (formData.source_of_funds === 'high') factors.push('high-value transactions');
    if (formData.occupation === 'high') factors.push('high-risk occupation');
    if (formData.business_type === 'high') factors.push('high-risk business type');

    if (factors.length === 0) return 'No significant risk factors identified.';
    return `Risk factors: ${factors.join(', ')}.`;
  }

  // Update the step navigation functions
  const handleNext = () => {
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
        <Navigation />
        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
        <Navigation />
        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading KYC data</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => router.refresh()}
                      className="inline-flex items-center rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                    >
                      <ArrowPathIcon className="mr-2 h-4 w-4" />
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <nav aria-label="Progress">
            <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
              {steps.map((step, index) => (
                <li key={step.id} className="md:flex-1">
                  <div
                    className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                      stepOrder.indexOf(step.id) <= stepOrder.indexOf(currentStep)
                        ? 'border-blue-600'
                        : 'border-gray-200'
                    }`}
                    style={{ borderColor: stepOrder.indexOf(step.id) <= stepOrder.indexOf(currentStep) ? 'hsl(var(--primary))' : undefined }}
                  >
                    <span className="text-sm font-medium" style={{ color: 'hsl(var(--primary))' }}>{step.id}</span>
                    <span className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{step.title}</span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>

          {/* Form Content */}
          <div className="mt-8">
            <div className="space-y-6 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  className="rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                  onClick={handleBack}
                  disabled={currentStep === 'personal'}
                >
                  Back
                </button>
                {currentStep === 'review' ? (
                  <button
                    type="button"
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={handleNext}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 