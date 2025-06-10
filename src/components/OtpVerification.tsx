import React, { useState, useEffect } from 'react'
import { EnvelopeIcon, PhoneIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface OtpVerificationProps {
  onComplete: (data: VerificationData) => void
  onBack: () => void
}

export interface VerificationData {
  email: string
  phone: string
  emailVerified: boolean
  phoneVerified: boolean
}

export default function OtpVerification({ onComplete, onBack }: OtpVerificationProps) {
  const [emailInput, setEmailInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [emailTimer, setEmailTimer] = useState(0)
  const [phoneTimer, setPhoneTimer] = useState(0)
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({})
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [otpError, setOtpError] = useState('')

  // Timer effect for resend OTP
  useEffect(() => {
    let emailInterval: NodeJS.Timeout
    let phoneInterval: NodeJS.Timeout

    if (emailTimer > 0) {
      emailInterval = setInterval(() => {
        setEmailTimer((prev) => prev - 1)
      }, 1000)
    }

    if (phoneTimer > 0) {
      phoneInterval = setInterval(() => {
        setPhoneTimer((prev) => prev - 1)
      }, 1000)
    }

    return () => {
      clearInterval(emailInterval)
      clearInterval(phoneInterval)
    }
  }, [emailTimer, phoneTimer])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
  }

  const handleSendEmailOtp = () => {
    setEmailError('')
    if (!emailInput) {
      setEmailError('Email is required')
      return
    }
    if (!validateEmail(emailInput)) {
      setEmailError('Please enter a valid email address')
      return
    }
    // Mock OTP sending
    setEmailOtpSent(true)
    setEmailVerified(false)
    setOtpError('')
  }

  const handleSendPhoneOtp = () => {
    setPhoneError('')
    if (!phoneInput) {
      setPhoneError('Phone number is required')
      return
    }
    if (!validatePhone(phoneInput)) {
      setPhoneError('Please enter a valid 10-digit phone number')
      return
    }
    // Mock OTP sending
    setPhoneOtpSent(true)
    setPhoneVerified(false)
    setOtpError('')
  }

  const handleVerifyEmailOtp = () => {
    if (emailOtp === '1234') {
      setEmailVerified(true)
      setOtpError('')
      checkCompletion()
    } else {
      setOtpError('Invalid OTP. Please try again.')
    }
  }

  const handleVerifyPhoneOtp = () => {
    if (phoneOtp === '1234') {
      setPhoneVerified(true)
      setOtpError('')
      checkCompletion()
    } else {
      setOtpError('Invalid OTP. Please try again.')
    }
  }

  const checkCompletion = () => {
    if (emailVerified && phoneVerified) {
      onComplete({
        email: emailInput,
        phone: phoneInput,
        emailVerified,
        phoneVerified
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Contact Verification</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Please verify your email and phone number to proceed with the KYC process.</p>
          </div>

          {/* Email Verification */}
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={emailVerified}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    emailVerified ? 'bg-gray-50' : ''
                  }`}
                  placeholder="Enter your email address"
                />
                {!emailVerified && (
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    disabled={emailOtpSent}
                    className="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {emailOtpSent ? 'OTP Sent' : 'Send OTP'}
                  </button>
                )}
                {emailVerified && (
                  <div className="ml-3 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="ml-1 text-sm text-green-600">Verified</span>
                  </div>
                )}
              </div>
              {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
            </div>

            {emailOtpSent && !emailVerified && (
              <div>
                <label htmlFor="emailOtp" className="block text-sm font-medium text-gray-700">
                  Email OTP
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="emailOtp"
                    id="emailOtp"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter OTP"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    className="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Phone Verification */}
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  disabled={phoneVerified}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    phoneVerified ? 'bg-gray-50' : ''
                  }`}
                  placeholder="Enter your 10-digit phone number"
                />
                {!phoneVerified && (
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={phoneOtpSent}
                    className="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {phoneOtpSent ? 'OTP Sent' : 'Send OTP'}
                  </button>
                )}
                {phoneVerified && (
                  <div className="ml-3 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="ml-1 text-sm text-green-600">Verified</span>
                  </div>
                )}
              </div>
              {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
            </div>

            {phoneOtpSent && !phoneVerified && (
              <div>
                <label htmlFor="phoneOtp" className="block text-sm font-medium text-gray-700">
                  Phone OTP
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="phoneOtp"
                    id="phoneOtp"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter OTP"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPhoneOtp}
                    className="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}
          </div>

          {otpError && (
            <div className="mt-4 flex items-center text-sm text-red-600">
              <XCircleIcon className="mr-1 h-5 w-5" />
              {otpError}
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Back
            </button>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                <p>Note: For testing, use OTP: 1234</p>
              </div>
              {emailVerified && phoneVerified && (
                <button
                  type="button"
                  onClick={checkCompletion}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 