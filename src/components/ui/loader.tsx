import React from 'react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function Loader({ size = 'md', text, className = '' }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`} />
      {text && (
        <p className="mt-4 text-gray-600 text-center">{text}</p>
      )}
    </div>
  )
}

export function StepLoader({ text = "Loading step..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader size="lg" text={text} />
    </div>
  )
}

export function ReviewLoader() {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <Loader size="lg" text="Loading KYC details..." />
    </div>
  )
} 