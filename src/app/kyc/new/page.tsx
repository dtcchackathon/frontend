'use client'

import React, { useState } from 'react'
import Navigation from '@/components/Navigation'
import { useDropzone } from 'react-dropzone'
import { 
  DocumentArrowUpIcon,
  FaceSmileIcon,
  IdentificationIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface Address {
  line1: string
  line2: string
  city: string
  state: string
  country: string
  postalCode: string
}

interface FormData {
  salutation: string
  title: string
  firstName: string
  middleName: string
  lastName: string
  dob: string
  nationality: string
  gender: string
  govtId: string
  occupation: string
  employer: string
  sourceOfFunds: string
  pep: string
  altPhone: string
  email: string
  phone: string
  personalAddress: Address
  legalAddress: Address
  sameAsPersonalAddress: boolean
  mailingAddress: Address
  mailingAddressType: 'personal' | 'legal' | 'custom'
}

const steps = [
  { id: 'id-upload', name: 'Upload ID', status: 'current' },
  { id: 'photo-upload', name: 'Upload Photo', status: 'upcoming' },
  { id: 'video-verification', name: 'Video Face Verification', status: 'upcoming' },
  { id: 'risk-analysis', name: 'Client Risk Analysis', status: 'upcoming' },
  { id: 'review', name: 'Review & Tag Info', status: 'upcoming' },
  { id: 'complete', name: 'Complete Verification', status: 'upcoming' },
]

export default function NewKycForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [form, setForm] = useState<FormData>({
    salutation: '',
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    nationality: '',
    gender: '',
    govtId: '',
    occupation: '',
    employer: '',
    sourceOfFunds: '',
    pep: '',
    altPhone: '',
    email: '',
    phone: '',
    // Personal Address
    personalAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    // Legal Address
    legalAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    sameAsPersonalAddress: false,
    // Mailing Address
    mailingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    },
    mailingAddressType: 'personal' // 'personal', 'legal', or 'custom'
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [idFile, setIdFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [drivingLicenseFile, setDrivingLicenseFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [adharFile, setAdharFile] = useState<File | null>(null);
  const [pepRisk, setPepRisk] = useState('low');
  const [countryRisk, setCountryRisk] = useState('low');
  const [fundsRisk, setFundsRisk] = useState('low');
  const [occupationRisk, setOccupationRisk] = useState('low');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      setFiles(prev => [...prev, ...acceptedFiles])
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    }
  })

  // Calculate overall risk (simple example: if any is high, overall is high; else if any is medium, overall is medium; else low)
  const riskLevels = [pepRisk, countryRisk, fundsRisk, occupationRisk];
  let overallRisk = 'Low Risk';
  if (riskLevels.includes('high')) overallRisk = 'High Risk';
  else if (riskLevels.includes('medium')) overallRisk = 'Medium Risk';

  function validate() {
    const newErrors: { [key: string]: string } = {}
    if (!form.firstName) newErrors.firstName = 'First name is required.'
    if (!form.lastName) newErrors.lastName = 'Last name is required.'
    if (!form.dob) newErrors.dob = 'Date of birth is required.'
    if (!form.nationality) newErrors.nationality = 'Nationality is required.'
    if (!form.gender) newErrors.gender = 'Gender is required.'
    if (!form.govtId) newErrors.govtId = 'Government ID Number is required.'
    if (!form.occupation) newErrors.occupation = 'Occupation is required.'
    if (!form.sourceOfFunds) newErrors.sourceOfFunds = 'Source of funds is required.'
    if (!form.pep) newErrors.pep = 'Please select PEP status.'
    if (!form.email) newErrors.email = 'Email is required.'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'Invalid email address.'
    if (!form.phone) newErrors.phone = 'Phone number is required.'
    else if (!/^\+?\d{7,15}$/.test(form.phone)) newErrors.phone = 'Invalid phone number.'
    if (form.altPhone && !/^\+?\d{7,15}$/.test(form.altPhone)) newErrors.altPhone = 'Invalid phone number.'

    // Personal Address Validation
    if (!form.personalAddress.line1) newErrors['personalAddress.line1'] = 'Address line 1 is required.'
    if (!form.personalAddress.city) newErrors['personalAddress.city'] = 'City is required.'
    if (!form.personalAddress.state) newErrors['personalAddress.state'] = 'State is required.'
    if (!form.personalAddress.country) newErrors['personalAddress.country'] = 'Country is required.'
    if (!form.personalAddress.postalCode) newErrors['personalAddress.postalCode'] = 'Postal code is required.'

    // Legal Address Validation (if not same as personal)
    if (!form.sameAsPersonalAddress) {
      if (!form.legalAddress.line1) newErrors['legalAddress.line1'] = 'Legal address line 1 is required.'
      if (!form.legalAddress.city) newErrors['legalAddress.city'] = 'Legal address city is required.'
      if (!form.legalAddress.state) newErrors['legalAddress.state'] = 'Legal address state is required.'
      if (!form.legalAddress.country) newErrors['legalAddress.country'] = 'Legal address country is required.'
      if (!form.legalAddress.postalCode) newErrors['legalAddress.postalCode'] = 'Legal address postal code is required.'
    }

    // Mailing Address Validation (if custom)
    if (form.mailingAddressType === 'custom') {
      if (!form.mailingAddress.line1) newErrors['mailingAddress.line1'] = 'Mailing address line 1 is required.'
      if (!form.mailingAddress.city) newErrors['mailingAddress.city'] = 'Mailing address city is required.'
      if (!form.mailingAddress.state) newErrors['mailingAddress.state'] = 'Mailing address state is required.'
      if (!form.mailingAddress.country) newErrors['mailingAddress.country'] = 'Mailing address country is required.'
      if (!form.mailingAddress.postalCode) newErrors['mailingAddress.postalCode'] = 'Mailing address postal code is required.'
    }

    return newErrors
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      if (name === 'sameAsPersonalAddress') {
        setForm(prev => ({
          ...prev,
          sameAsPersonalAddress: checked,
          legalAddress: checked ? prev.personalAddress : prev.legalAddress
        }))
      }
    } else if (name.startsWith('personalAddress.') || name.startsWith('legalAddress.') || name.startsWith('mailingAddress.')) {
      const [addressType, field] = name.split('.')
      setForm(prev => {
        if (addressType === 'personalAddress') {
          return {
            ...prev,
            personalAddress: {
              ...prev.personalAddress,
              [field]: value
            }
          }
        } else if (addressType === 'legalAddress') {
          return {
            ...prev,
            legalAddress: {
              ...prev.legalAddress,
              [field]: value
            }
          }
        } else if (addressType === 'mailingAddress') {
          return {
            ...prev,
            mailingAddress: {
              ...prev.mailingAddress,
              [field]: value
            }
          }
        }
        return prev
      })
    } else if (name === 'mailingAddressType') {
      setForm(prev => ({
        ...prev,
        mailingAddressType: value as 'personal' | 'legal' | 'custom',
        mailingAddress: value === 'personal' ? prev.personalAddress : 
                      value === 'legal' ? prev.legalAddress : 
                      prev.mailingAddress
      }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function handleNext() {
    if (currentStep === 0) {
      setCurrentStep(prev => prev + 1);
      return;
    }
    // For other steps, run validation as needed (add here if you add more form steps)
    setCurrentStep(prev => prev + 1);
  }

  // Determine if Next button should be disabled on step 0
  const isStep0NextDisabled = currentStep === 0 && (!drivingLicenseFile || !passportFile || !adharFile);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <Navigation />
      
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <nav aria-label="Progress">
            <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
              {steps.map((step, index) => (
                <li key={step.name} className="md:flex-1">
                  <div
                    className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                      index <= currentStep
                        ? 'border-blue-600'
                        : 'border-gray-200'
                    }`}
                    style={{ borderColor: index <= currentStep ? 'hsl(var(--primary))' : undefined }}
                  >
                    <span className="text-sm font-medium" style={{ color: 'hsl(var(--primary))' }}>{step.id}</span>
                    <span className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{step.name}</span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>

          {/* Form Content */}
          <div className="mt-8">
            <div className="space-y-6 bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Upload Customer IDs</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload one or more government-issued IDs (driving license, passport, adhar, etc.).</p>
                  </div>
                  <div className="flex flex-col gap-4 items-start">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Driving License</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={e => setDrivingLicenseFile(e.target.files?.[0] || null)}
                      />
                      {drivingLicenseFile && <div className="mt-1 text-xs text-gray-600">Selected: {drivingLicenseFile.name}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passport</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={e => setPassportFile(e.target.files?.[0] || null)}
                      />
                      {passportFile && <div className="mt-1 text-xs text-gray-600">Selected: {passportFile.name}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adhar</label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={e => setAdharFile(e.target.files?.[0] || null)}
                      />
                      {adharFile && <div className="mt-1 text-xs text-gray-600">Selected: {adharFile.name}</div>}
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Upload Customer Photo</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload a clear photo of the customer.</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                    />
                    {photoFile && <div className="mt-2 text-sm">Selected: {photoFile.name}</div>}
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Video Face Verification</h3>
                    <p className="mt-1 text-sm text-gray-500">Record or upload a short video for face verification.</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={e => setVideoFile(e.target.files?.[0] || null)}
                    />
                    {videoFile && <div className="mt-2 text-sm">Selected: {videoFile.name}</div>}
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Client Risk Analysis</h3>
                    <p className="mt-1 text-sm text-gray-500">Analyze the client's risk profile.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Risk Factors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* PEP Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">PEP Status</label>
                          <select className="mt-1 block w-full rounded border-gray-300" value={pepRisk} onChange={e => setPepRisk(e.target.value)}>
                            <option value="low">No</option>
                            <option value="high">Yes</option>
                          </select>
                        </div>
                        {/* Country of Residence */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Country of Residence</label>
                          <select className="mt-1 block w-full rounded border-gray-300" value={countryRisk} onChange={e => setCountryRisk(e.target.value)}>
                            <option value="low">Low Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="high">High Risk</option>
                          </select>
                        </div>
                        {/* Source of Funds */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Source of Funds</label>
                          <select className="mt-1 block w-full rounded border-gray-300" value={fundsRisk} onChange={e => setFundsRisk(e.target.value)}>
                            <option value="low">Salary</option>
                            <option value="medium">Business</option>
                            <option value="high">Crypto/Other</option>
                          </select>
                        </div>
                        {/* Occupation */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Occupation</label>
                          <select className="mt-1 block w-full rounded border-gray-300" value={occupationRisk} onChange={e => setOccupationRisk(e.target.value)}>
                            <option value="low">Standard</option>
                            <option value="medium">Self-Employed</option>
                            <option value="high">High Risk</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Overall Risk Score</h4>
                      <div className={`p-4 rounded text-lg font-bold text-center ${overallRisk === 'High Risk' ? 'bg-red-100 text-red-700' : overallRisk === 'Medium Risk' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {overallRisk}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Review & Tag Personal Information</h3>
                    <p className="mt-1 text-sm text-gray-500">Review the extracted personal information and tag which ID it came from.</p>
                  </div>
                  <div className="space-y-2">
                    {/* Name fields */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Salutation:</span>
                      <span>{form.salutation || '-'}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Title:</span>
                      <span>{form.title || '-'}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">First Name:</span>
                      <span>{form.firstName}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Middle Name:</span>
                      <span>{form.middleName || '-'}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Last Name:</span>
                      <span>{form.lastName}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    {/* Contact info */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Email:</span>
                      <span>{form.email}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Phone:</span>
                      <span>{form.phone}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Alt Phone:</span>
                      <span>{form.altPhone || '-'}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    {/* Permanent Address */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Permanent Address:</span>
                      <span>{form.personalAddress.line1}, {form.personalAddress.line2 && `${form.personalAddress.line2}, `}{form.personalAddress.city}, {form.personalAddress.state} {form.personalAddress.postalCode}, {form.personalAddress.country}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    {/* Legal Address */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Legal Address:</span>
                      <span>{form.sameAsPersonalAddress ? 'Same as Personal Address' : `${form.legalAddress.line1}, ${form.legalAddress.line2 ? `${form.legalAddress.line2}, ` : ''}${form.legalAddress.city}, ${form.legalAddress.state} ${form.legalAddress.postalCode}, ${form.legalAddress.country}`}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    {/* PEP, Source of Funds, Employer, Business */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">PEP:</span>
                      <span>{form.pep}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Source of Funds:</span>
                      <span>{form.sourceOfFunds}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Employer/Company:</span>
                      <span>{form.employer}</span>
                      <select className="ml-2 border rounded px-2 py-1 text-xs">
                        <option>ID Document</option>
                        <option>Manual Entry</option>
                      </select>
                    </div>
                    {/* Add more fields as needed */}
                  </div>
                </div>
              )}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Complete Verification</h3>
                    <p className="mt-1 text-sm text-gray-500">All steps are complete. Activate the customer profile.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-500">Verification Complete</span>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-end space-x-3">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={isStep0NextDisabled}
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 