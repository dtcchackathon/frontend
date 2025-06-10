'use client'

import React, { useState, useEffect } from 'react'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  BanknotesIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { ReviewLoader } from '@/components/ui/loader'

export interface KycFormData {
  // Auto-populated from documents
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
  alternatePhone?: string
  occupation: string
  employer?: string
  businessType?: string
  sourceOfFunds: string
  isPEP: boolean
  pepDetails?: string
  annualIncome: string
  riskCategory?: string
}

export interface KycReviewFormProps {
  documents: {
    aadharFront?: string
    aadharBack?: string
    pancard?: string
    passport?: string
    photo?: string
    selfie?: string
    video?: string
  }
  initialData?: {
    email?: string
    phone?: string
    // Add other fields as needed
  }
  onSubmit: (data: KycFormData) => void
  onBack: () => void
  readOnly?: boolean
  kycSubmittedStatus: string
}

const initialFormData: KycFormData = {
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
  email: '',
  phone: '',
  occupation: '',
  sourceOfFunds: '',
  isPEP: false,
  annualIncome: ''
}

export default function KycReviewForm({ documents, initialData, onSubmit, onBack, readOnly, kycSubmittedStatus }: KycReviewFormProps) {
  console.log('KycReviewForm initialData:', initialData);
  const [formData, setFormData] = useState<KycFormData>({
    ...initialFormData,
    ...initialData,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState<Partial<Record<keyof KycFormData, string>>>({})

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...initialData,
    }));
  }, [initialData]);

  // Simulate document data extraction
  useEffect(() => {
    if (!initialData) {
      const extractDataFromDocuments = async () => {
        setIsLoading(true)
        try {
          // TODO: Replace with actual document processing API calls
          // This is a mock implementation
          const mockExtractedData = {
            name: 'John Doe',
            dateOfBirth: '1990-01-01',
            gender: 'Male',
            address: {
              street: '123 Main Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001'
            },
            fatherName: 'James Doe',
            aadharNumber: '1234-5678-9012',
            panNumber: 'ABCDE1234F'
          }

          setFormData(prev => ({
            ...prev,
            ...mockExtractedData
          }))
        } catch (error) {
          console.error('Error extracting data from documents:', error)
        } finally {
          setIsLoading(false)
        }
      }
      extractDataFromDocuments()
    } else {
      setIsLoading(false)
    }
  }, [documents, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when field is modified
    if (errors[name as keyof KycFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof KycFormData, string>> = {}

    // Required fields validation
    const requiredFields: (keyof KycFormData)[] = [
      'email',
      'phone',
      'occupation',
      'sourceOfFunds',
      'annualIncome'
    ]

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required'
      }
    })

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    // Phone validation
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number'
    }

    // PEP details validation
    if (formData.isPEP && !formData.pepDetails) {
      newErrors.pepDetails = 'Please provide PEP details'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm() && !readOnly) {
      onSubmit(formData)
    }
  }

  const isEditable = (fieldName: string, fieldValue: any) => {
    // If KYC is already submitted, nothing is editable
    if (kycSubmittedStatus === 'completed' || readOnly) {
      return false;
    }
    
    // Auto-populated fields from documents should be read-only
    const autoPopulatedFields = [
      'name', 'dateOfBirth', 'gender', 'fatherName', 
      'aadharNumber', 'panNumber', 'address'
    ];
    
    if (autoPopulatedFields.includes(fieldName)) {
      return false; // Auto-populated fields are read-only
    }
    
    // User input fields should always be editable
    const userInputFields = [
      'email', 'phone', 'alternatePhone', 'occupation', 
      'employer', 'businessType', 'sourceOfFunds', 
      'isPEP', 'pepDetails', 'annualIncome'
    ];
    
    if (userInputFields.includes(fieldName)) {
      return true; // User input fields are always editable
    }
    
    // Default to editable for any other fields
    return true;
  };

  if (isLoading) {
    return <ReviewLoader />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Auto-populated Information */}
      <div className="rounded-lg border p-6" style={{ borderColor: 'hsl(var(--border))' }}>
        <h3 className="text-lg font-medium mb-4" style={{ color: 'hsl(var(--foreground))' }}>
          Information from Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              readOnly={!isEditable('name', formData.name) && readOnly}
              className="w-full rounded-md border px-3 py-2 bg-gray-50"
              style={{ borderColor: 'hsl(var(--border))' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Date of Birth
            </label>
            <input
              type="text"
              value={formData.dateOfBirth}
              readOnly={!isEditable('dateOfBirth', formData.dateOfBirth) && readOnly}
              className="w-full rounded-md border px-3 py-2 bg-gray-50"
              style={{ borderColor: 'hsl(var(--border))' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Gender
            </label>
            <input
              type="text"
              value={formData.gender}
              readOnly={!isEditable('gender', formData.gender) && readOnly}
              className="w-full rounded-md border px-3 py-2 bg-gray-50"
              style={{ borderColor: 'hsl(var(--border))' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Father's Name
            </label>
            <input
              type="text"
              value={formData.fatherName}
              readOnly={!isEditable('fatherName', formData.fatherName) && readOnly}
              className="w-full rounded-md border px-3 py-2 bg-gray-50"
              style={{ borderColor: 'hsl(var(--border))' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Aadhar Number
            </label>
            <input
              type="text"
              value={formData.aadharNumber}
              readOnly={!isEditable('aadharNumber', formData.aadharNumber) && readOnly}
              className="w-full rounded-md border px-3 py-2 bg-gray-50"
              style={{ borderColor: 'hsl(var(--border))' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              PAN Number
            </label>
            <input
              type="text"
              value={formData.panNumber}
              readOnly={!isEditable('panNumber', formData.panNumber) && readOnly}
              className="w-full rounded-md border px-3 py-2 bg-gray-50"
              style={{ borderColor: 'hsl(var(--border))' }}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
            Address
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="street"
              value={formData.address.street}
              readOnly={!isEditable('street', formData.address.street) && readOnly}
              className="w-full rounded-md border px-3 py-2 bg-gray-50"
              style={{ borderColor: 'hsl(var(--border))' }}
            />
            <input
              type="text"
              name="city"
              value={formData.address.city}
              readOnly={!isEditable('city', formData.address.city) && readOnly}
              className="w-full rounded-md border px-3 py-2 bg-gray-50"
              style={{ borderColor: 'hsl(var(--border))' }}
            />
            <input
              type="text"
              name="state"
              value={formData.address.state}
              readOnly={!isEditable('state', formData.address.state) && readOnly}
              className="w-full rounded-md border px-3 py-2 bg-gray-50"
              style={{ borderColor: 'hsl(var(--border))' }}
            />
            <input
              type="text"
              name="pincode"
              value={formData.address.pincode}
              readOnly={!isEditable('pincode', formData.address.pincode) && readOnly}
              className="w-full rounded-md border px-3 py-2 bg-gray-50"
              style={{ borderColor: 'hsl(var(--border))' }}
            />
          </div>
        </div>
      </div>

      {/* User Input Fields */}
      <div className="rounded-lg border p-6" style={{ borderColor: 'hsl(var(--border))' }}>
        <h3 className="text-lg font-medium mb-4" style={{ color: 'hsl(var(--foreground))' }}>
          Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-md border pl-10 pr-3 py-2 ${
                  errors.email ? 'border-red-500' : ''
                }`}
                style={{ borderColor: errors.email ? 'rgb(239, 68, 68)' : 'hsl(var(--border))' }}
                readOnly={!isEditable('email', formData.email) && readOnly}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full rounded-md border pl-10 pr-3 py-2 ${
                  errors.phone ? 'border-red-500' : ''
                }`}
                style={{ borderColor: errors.phone ? 'rgb(239, 68, 68)' : 'hsl(var(--border))' }}
                readOnly={!isEditable('phone', formData.phone) && readOnly}
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Alternate Phone
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleChange}
                className="w-full rounded-md border pl-10 pr-3 py-2"
                style={{ borderColor: 'hsl(var(--border))' }}
                readOnly={!isEditable('alternatePhone', formData.alternatePhone) && readOnly}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Occupation <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className={`w-full rounded-md border pl-10 pr-3 py-2 ${
                  errors.occupation ? 'border-red-500' : ''
                }`}
                style={{ borderColor: errors.occupation ? 'rgb(239, 68, 68)' : 'hsl(var(--border))' }}
                readOnly={!isEditable('occupation', formData.occupation) && readOnly}
              />
            </div>
            {errors.occupation && <p className="mt-1 text-sm text-red-500">{errors.occupation}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Employer/Business Name
            </label>
            <div className="relative">
              <BuildingOfficeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="employer"
                value={formData.employer}
                onChange={handleChange}
                className="w-full rounded-md border pl-10 pr-3 py-2"
                style={{ borderColor: 'hsl(var(--border))' }}
                readOnly={!isEditable('employer', formData.employer) && readOnly}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Business Type
            </label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2"
              style={{ borderColor: 'hsl(var(--border))' }}
              disabled={!isEditable('businessType', formData.businessType) && readOnly}
            >
              <option value="">Select Business Type</option>
              <option value="salaried">Salaried</option>
              <option value="self-employed">Self Employed</option>
              <option value="business">Business</option>
              <option value="professional">Professional</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Source of Funds <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BanknotesIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <select
                name="sourceOfFunds"
                value={formData.sourceOfFunds}
                onChange={handleChange}
                className={`w-full rounded-md border pl-10 pr-3 py-2 ${
                  errors.sourceOfFunds ? 'border-red-500' : ''
                }`}
                style={{ borderColor: errors.sourceOfFunds ? 'rgb(239, 68, 68)' : 'hsl(var(--border))' }}
                disabled={!isEditable('sourceOfFunds', formData.sourceOfFunds) && readOnly}
              >
                <option value="">Select Source of Funds</option>
                <option value="salary">Salary</option>
                <option value="business">Business Income</option>
                <option value="investments">Investments</option>
                <option value="inheritance">Inheritance</option>
                <option value="other">Other</option>
              </select>
            </div>
            {errors.sourceOfFunds && <p className="mt-1 text-sm text-red-500">{errors.sourceOfFunds}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Annual Income <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BanknotesIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <select
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
                className={`w-full rounded-md border pl-10 pr-3 py-2 ${
                  errors.annualIncome ? 'border-red-500' : ''
                }`}
                style={{ borderColor: errors.annualIncome ? 'rgb(239, 68, 68)' : 'hsl(var(--border))' }}
                disabled={!isEditable('annualIncome', formData.annualIncome) && readOnly}
              >
                <option value="">Select Annual Income</option>
                <option value="0-5">Less than 5 Lakhs</option>
                <option value="5-10">5-10 Lakhs</option>
                <option value="10-25">10-25 Lakhs</option>
                <option value="25-50">25-50 Lakhs</option>
                <option value="50+">More than 50 Lakhs</option>
              </select>
            </div>
            {errors.annualIncome && <p className="mt-1 text-sm text-red-500">{errors.annualIncome}</p>}
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPEP"
                checked={formData.isPEP}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300"
                style={{ borderColor: 'hsl(var(--border))' }}
                disabled={!isEditable('isPEP', formData.isPEP) && readOnly}
              />
              <label className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                Are you a Politically Exposed Person (PEP)?
              </label>
            </div>
            {formData.isPEP && (
              <div className="mt-2">
                <div className="relative">
                  <ShieldExclamationIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <textarea
                    name="pepDetails"
                    value={formData.pepDetails}
                    onChange={handleChange}
                    placeholder="Please provide details about your PEP status"
                    className={`w-full rounded-md border pl-10 pr-3 py-2 ${
                      errors.pepDetails ? 'border-red-500' : ''
                    }`}
                    style={{ borderColor: errors.pepDetails ? 'rgb(239, 68, 68)' : 'hsl(var(--border))' }}
                    rows={3}
                    readOnly={!isEditable('pepDetails', formData.pepDetails) && readOnly}
                  />
                </div>
                {errors.pepDetails && <p className="mt-1 text-sm text-red-500">{errors.pepDetails}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      {(kycSubmittedStatus !== 'completed' && !readOnly) && (
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ color: 'hsl(var(--foreground))', backgroundColor: 'hsl(var(--muted))' }}
          >
            Back
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Submit KYC
          </button>
        </div>
      )}
    </form>
  )
} 