import { useState } from 'react'
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

interface UserRegistrationProps {
  onComplete: (data: UserRegistrationData) => void
  onBack: () => void
}

export interface UserRegistrationData {
  email: string
  phone: string
  password: string
  emailVerified: boolean
  phoneVerified: boolean
  securityQuestions: string[]
}

export default function UserRegistration({ onComplete, onBack }: UserRegistrationProps) {
  const [step, setStep] = useState<'details' | 'verification' | 'password'>('details')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [securityQuestions, setSecurityQuestions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
  }

  const validatePassword = (password: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  const handleDetailsSubmit = () => {
    setEmailError('')
    setPhoneError('')
    let isValid = true

    if (!email) {
      setEmailError('Email is required')
      isValid = false
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      isValid = false
    }

    if (!phone) {
      setPhoneError('Phone number is required')
      isValid = false
    } else if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid 10-digit phone number')
      isValid = false
    }

    if (isValid) {
      setStep('verification')
    }
  }

  const handleSendEmailOtp = () => {
    setEmailError('')
    if (!validateEmail(email)) {
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
    if (!validatePhone(phone)) {
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
      checkVerificationCompletion()
    } else {
      setOtpError('Invalid OTP. Please try again.')
    }
  }

  const handleVerifyPhoneOtp = () => {
    if (phoneOtp === '1234') {
      setPhoneVerified(true)
      setOtpError('')
      checkVerificationCompletion()
    } else {
      setOtpError('Invalid OTP. Please try again.')
    }
  }

  const checkVerificationCompletion = () => {
    if (emailVerified && phoneVerified) {
      setStep('password')
    }
  }

  const handlePasswordSubmit = () => {
    setPasswordError('')
    let isValid = true

    if (!password) {
      setPasswordError('Password is required')
      isValid = false
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character')
      isValid = false
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      isValid = false
    }

    if (isValid) {
      setIsSubmitting(true)
      setError('')
      onComplete({
        email,
        phone,
        password,
        emailVerified,
        phoneVerified,
        securityQuestions
      })
    }
  }

  const handleVerificationSubmit = () => {
    if (emailVerified && phoneVerified) {
      setStep('password')
    }
  }

  const isRegistrationComplete = step === 'password' && !isSubmitting && !error && password && confirmPassword === password

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">User Registration</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Please complete your registration to proceed with KYC.</p>
          </div>

          {step === 'details' && (
            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your email address"
                  />
                  {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your 10-digit phone number"
                  />
                  {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleDetailsSubmit}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 'verification' && (
            <div className="mt-6 space-y-6">
              {/* Email Verification */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Verification
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                {emailOtpSent && !emailVerified && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter OTP"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyEmailOtp}
                      className="mt-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Verify Email
                    </button>
                  </div>
                )}
              </div>

              {/* Phone Verification */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Verification
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="tel"
                    value={phone}
                    disabled
                    className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                {phoneOtpSent && !phoneVerified && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter OTP"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyPhoneOtp}
                      className="mt-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Verify Phone
                    </button>
                  </div>
                )}
              </div>

              {otpError && (
                <div className="flex items-center text-sm text-red-600">
                  <XCircleIcon className="mr-1 h-5 w-5" />
                  {otpError}
                </div>
              )}

              <div className="text-sm text-gray-500">
                <p>Note: For testing, use OTP: 1234</p>
              </div>
            </div>
          )}

          {step === 'password' && (
            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center text-sm text-red-600">
                  <XCircleIcon className="mr-1 h-5 w-5" />
                  {passwordError}
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep('verification')}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Complete Registration
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Back
            </button>

            <div className="flex items-center space-x-4">
              {step === 'details' && (
                <button
                  type="button"
                  onClick={handleDetailsSubmit}
                  disabled={!email || !phone || isSubmitting}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden="true" />
                </button>
              )}

              {step === 'verification' && (
                <button
                  type="button"
                  onClick={handleVerificationSubmit}
                  disabled={!emailVerified || !phoneVerified || isSubmitting}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden="true" />
                </button>
              )}

              {step === 'password' && (
                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  disabled={!password || !confirmPassword || password !== confirmPassword || isSubmitting}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegistrationComplete ? (
                    <>
                      Next
                      <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 