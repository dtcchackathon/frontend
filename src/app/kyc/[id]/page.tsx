'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { DocumentCheckIcon, FaceSmileIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon, ArrowPathIcon, PlayIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const mockKycApplications: Record<string, any> = {
  '1': {
    applicant: { name: 'John Doe', email: 'john@example.com', phone: '+1 555-1234', address: '123 Main St, City' },
    status: 'Verified',
    documents: [
      { name: 'ID Card.pdf', type: 'PDF', uploaded: '2024-06-01', status: 'Verified' },
      { name: 'Proof_of_Address.jpg', type: 'Image', uploaded: '2024-06-02', status: 'Pending' },
    ],
    steps: [
      { id: 1, name: 'Document Upload', status: 'completed', date: '2024-06-01 10:30 AM', description: 'ID Card and Proof of Address uploaded', icon: DocumentCheckIcon },
      { id: 2, name: 'Document Verification', status: 'completed', date: '2024-06-01 10:35 AM', description: 'Documents verified', icon: DocumentCheckIcon },
      { id: 3, name: 'Face Verification', status: 'completed', date: '2024-06-01 10:40 AM', description: 'Face verified', icon: FaceSmileIcon },
      { id: 4, name: 'Final Review', status: 'completed', date: '2024-06-01 10:45 AM', description: 'KYC completed', icon: CheckCircleIcon },
    ],
  },
  '2': {
    applicant: { name: 'Jane Smith', email: 'jane@example.com', phone: '+1 555-5678', address: '456 Oak Ave, City' },
    status: 'Pending',
    documents: [
      { name: 'ID Card.pdf', type: 'PDF', uploaded: '2024-06-03', status: 'Pending' },
    ],
    steps: [
      { id: 1, name: 'Document Upload', status: 'completed', date: '2024-06-03 09:00 AM', description: 'ID Card uploaded', icon: DocumentCheckIcon },
      { id: 2, name: 'Document Verification', status: 'inProgress', date: '2024-06-03 09:10 AM', description: 'Verification in progress', icon: ClockIcon },
      { id: 3, name: 'Face Verification', status: 'pending', date: '', description: 'Waiting for face verification', icon: FaceSmileIcon },
      { id: 4, name: 'Final Review', status: 'pending', date: '', description: 'Waiting for review', icon: ClockIcon },
    ],
  },
  '3': {
    applicant: { name: 'Robert Johnson', email: 'robert@example.com', phone: '+1 555-9999', address: '789 Pine Rd, City' },
    status: 'Error',
    documents: [
      { name: 'ID Card.pdf', type: 'PDF', uploaded: '2024-06-05', status: 'Verified' },
      { name: 'Proof_of_Address.jpg', type: 'Image', uploaded: '2024-06-06', status: 'Error' },
    ],
    steps: [
      { id: 1, name: 'Document Upload', status: 'completed', date: '2024-06-05 09:00 AM', description: 'ID Card uploaded', icon: DocumentCheckIcon },
      { id: 2, name: 'Document Verification', status: 'error', date: '2024-06-05 09:10 AM', description: 'Document verification failed', icon: ExclamationCircleIcon },
      { id: 3, name: 'Face Verification', status: 'pending', date: '', description: 'Waiting for face verification', icon: FaceSmileIcon },
      { id: 4, name: 'Final Review', status: 'pending', date: '', description: 'Waiting for review', icon: ClockIcon },
    ],
  },
}

const statusChipStyles = {
  Verified: {
    background: 'hsl(var(--status-completed-bg))',
    color: 'hsl(var(--status-completed-text))',
    border: '1px solid hsl(var(--status-completed-text))',
  },
  Pending: {
    background: 'hsl(var(--status-inprogress-bg))',
    color: 'hsl(var(--status-inprogress-text))',
    border: '1px solid hsl(var(--status-inprogress-text))',
  },
  Error: {
    background: 'hsl(var(--status-error-bg))',
    color: 'hsl(var(--status-error-text))',
    border: '1px solid hsl(var(--status-error-text))',
  },
}

const getStatusKey = (status: string) => {
  if (status === 'completed' || status === 'Verified') return 'Verified';
  if (status === 'inProgress' || status === 'Pending') return 'Pending';
  if (status === 'error' || status === 'Error') return 'Error';
  return 'Pending';
};

export default function KycDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const kycId = Array.isArray(params.id) ? params.id[0] : params.id
  const kyc = mockKycApplications[kycId] || null

  // Add state for steps
  const [steps, setSteps] = useState(kyc ? kyc.steps : [])

  // Find first pending or error step
  const firstUnverifiedIdx = steps.findIndex(
    (step: any) => step.status === 'pending' || step.status === 'error'
  )

  function handleReprocess() {
    router.push(`/kyc/${kycId}/edit`)
  }

  if (!kyc) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
        <Navigation />
        <main className="py-10">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold mb-6">KYC Application Not Found</h1>
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
          <div className="mb-6 flex items-center gap-4">
            <h1 className="text-2xl font-bold mb-0" style={{ color: 'hsl(var(--foreground))' }}>KYC Application Details</h1>
            {/* Resume Button */}
            <Link
              href={kyc.status === 'Verified' ? '#' : `/kyc/${kycId}/edit`}
              className={`rounded bg-blue-600 px-3 py-3 text-white flex items-center justify-center gap-2 ${kyc.status === 'Verified' ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-700'}`}
              title="Resume"
              tabIndex={kyc.status === 'Verified' ? -1 : 0}
              aria-disabled={kyc.status === 'Verified'}
            >
              <PlayIcon className="h-6 w-6" />
              <span className="hidden sm:inline">Resume</span>
            </Link>
          </div>
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
            <div className="mb-2 font-semibold">Applicant Information</div>
            <div className="mb-1 text-sm">Name: {kyc.applicant.name}</div>
            <div className="mb-1 text-sm">Email: {kyc.applicant.email}</div>
            <div className="mb-1 text-sm">Phone: {kyc.applicant.phone}</div>
            <div className="mb-1 text-sm">Address: {kyc.applicant.address}</div>
            <div className="mt-2">
              <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ ...statusChipStyles[getStatusKey(kyc.status)], minWidth: 80, textAlign: 'center' }}>{kyc.status}</span>
            </div>
          </div>
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
            <div className="mb-2 font-semibold">Documents</div>
            <ul>
              {kyc.documents.map((doc: any, idx: number) => (
                <li key={idx} className="flex items-center gap-2 mb-1 text-sm">
                  <span>{doc.name}</span>
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold" style={{ ...statusChipStyles[getStatusKey(doc.status)], minWidth: 60, textAlign: 'center' }}>{doc.status}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
            <div className="mb-2 font-semibold">Verification Steps</div>
            <ul>
              {steps.map((step: any) => (
                <li key={step.id} className="flex items-center gap-2 mb-1 text-sm">
                  <step.icon className="h-4 w-4" style={{ color: 'hsl(var(--primary))' }} />
                  <span>{step.name}</span>
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold" style={{ ...statusChipStyles[getStatusKey(step.status)], minWidth: 60, textAlign: 'center' }}>{step.status}</span>
                  <span className="text-xs" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>{step.description}</span>
                </li>
              ))}
            </ul>
            {firstUnverifiedIdx !== -1 && (
              <button
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                onClick={handleReprocess}
                title="Reprocess"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 