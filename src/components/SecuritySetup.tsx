import React, { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface SecuritySetupProps {
  onSubmit: (data: SecurityData) => void
  onBack: () => void
}

export interface SecurityData {
  password: string
  confirmPassword: string
  securityQuestion: string
  securityAnswer: string
}

const securityQuestions = [
  "What was your first pet's name?",
  "In which city were you born?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favorite movie?",
  "What was your childhood nickname?"
]

export default function SecuritySetup({ onSubmit, onBack }: SecuritySetupProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<SecurityData>({
    password: '',
    confirmPassword: '',
    securityQuestion: securityQuestions[0],
    securityAnswer: ''
  })
  const [errors, setErrors] = useState<Partial<SecurityData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<SecurityData> = {}
    
    // Password validation
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter'
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter'
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number'
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character (!@#$%^&*)'
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Security answer validation
    if (formData.securityAnswer.trim().length < 3) {
      newErrors.securityAnswer = 'Security answer must be at least 3 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Setup Security</h2>
        <p className="text-sm text-gray-500">Create a password and security question for your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={`block w-full rounded-md border px-3 py-2 text-sm ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium">
            Confirm Password
          </label>
          <div className="relative mt-1">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={`block w-full rounded-md border px-3 py-2 text-sm ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Security Question */}
        <div>
          <label htmlFor="securityQuestion" className="block text-sm font-medium">
            Security Question
          </label>
          <select
            id="securityQuestion"
            value={formData.securityQuestion}
            onChange={(e) => setFormData(prev => ({ ...prev, securityQuestion: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {securityQuestions.map((question) => (
              <option key={question} value={question}>
                {question}
              </option>
            ))}
          </select>
        </div>

        {/* Security Answer */}
        <div>
          <label htmlFor="securityAnswer" className="block text-sm font-medium">
            Security Answer
          </label>
          <input
            type="text"
            id="securityAnswer"
            value={formData.securityAnswer}
            onChange={(e) => setFormData(prev => ({ ...prev, securityAnswer: e.target.value }))}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm ${
              errors.securityAnswer ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your answer"
          />
          {errors.securityAnswer && (
            <p className="mt-1 text-sm text-red-600">{errors.securityAnswer}</p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  )
} 