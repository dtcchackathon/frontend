'use client'

import React from 'react'
import Navigation from '@/components/Navigation'
import { 
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  DocumentCheckIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

type StatusType = 'completed' | 'inProgress' | 'error'

type StatusConfig = {
  [key in StatusType]: {
    color: string
    bgColor: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  }
}

const statuses: StatusConfig = {
  completed: { color: 'text-green-400', bgColor: 'bg-green-50', icon: CheckCircleIcon },
  inProgress: { color: 'text-blue-400', bgColor: 'bg-blue-50', icon: ClockIcon },
  error: { color: 'text-red-400', bgColor: 'bg-red-50', icon: ExclamationCircleIcon },
}

const verificationSteps = [
  {
    id: 1,
    name: 'Document Upload',
    status: 'completed' as StatusType,
    date: '2024-02-20 10:30 AM',
    description: 'ID Card and Proof of Address uploaded successfully',
    icon: DocumentCheckIcon,
  },
  {
    id: 2,
    name: 'Document Verification',
    status: 'completed' as StatusType,
    date: '2024-02-20 10:35 AM',
    description: 'Documents verified using AWS Textract',
    icon: DocumentCheckIcon,
  },
  {
    id: 3,
    name: 'Face Verification',
    status: 'inProgress' as StatusType,
    date: '2024-02-20 10:40 AM',
    description: 'Face verification in progress using AWS Rekognition',
    icon: FaceSmileIcon,
  },
  {
    id: 4,
    name: 'Final Review',
    status: 'error' as StatusType,
    date: '2024-02-20 10:45 AM',
    description: 'Additional information required',
    icon: ExclamationCircleIcon,
  },
]

const statusChipStyles = {
  completed: {
    background: 'hsl(var(--status-completed-bg))',
    color: 'hsl(var(--status-completed-text))',
    border: '1px solid hsl(var(--status-completed-text))',
  },
  inProgress: {
    background: 'hsl(var(--status-inprogress-bg))',
    color: 'hsl(var(--status-inprogress-text))',
    border: '1px solid hsl(var(--status-inprogress-text))',
  },
  error: {
    background: 'hsl(var(--status-error-bg))',
    color: 'hsl(var(--status-error-text))',
    border: '1px solid hsl(var(--status-error-text))',
  },
}

export default function StatusPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <Navigation />
      
      <main className="py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow sm:rounded-lg" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' }}>
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6" style={{ color: 'hsl(var(--foreground))' }}>
                KYC Verification Status
              </h3>
              <p className="mt-1 max-w-2xl text-sm" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>
                Application #12345
              </p>
            </div>
            <div className="border-t" style={{ borderColor: 'hsl(var(--border))' }}>
              <dl>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={{ backgroundColor: 'hsl(var(--background))' }}>
                  <dt className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>Full name</dt>
                  <dd className="mt-1 text-sm" style={{ color: 'hsl(var(--foreground))' }}>John Doe</dd>
                </div>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={{ backgroundColor: 'hsl(var(--card, var(--background)))' }}>
                  <dt className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>Application date</dt>
                  <dd className="mt-1 text-sm" style={{ color: 'hsl(var(--foreground))' }}>February 20, 2024</dd>
                </div>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={{ backgroundColor: 'hsl(var(--background))' }}>
                  <dt className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>Current status</dt>
                  <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))', border: '1px solid hsl(var(--border))', boxShadow: '0 0 0 1px hsl(var(--border))' }}>
                      In Progress
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Verification Steps */}
          <div className="mt-8">
            <h3 className="text-lg font-medium leading-6" style={{ color: 'hsl(var(--foreground))' }}>Verification Steps</h3>
            <div className="mt-4 flow-root">
              <ul role="list" className="-mb-8">
                {verificationSteps.map((step, stepIdx) => (
                  <li key={step.id}>
                    <div className="relative pb-8">
                      {stepIdx !== verificationSteps.length - 1 ? (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5"
                          style={{ backgroundColor: 'hsl(var(--border))' }}
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3 items-center">
                        <div>
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white"
                            style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))', border: '1px solid hsl(var(--border))' }}
                          >
                            <step.icon className="h-5 w-5" style={{ color: 'hsl(var(--primary))' }} aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <span
                              className="text-sm font-medium"
                              style={{
                                ...statusChipStyles[step.status],
                                borderRadius: '8px',
                                padding: '4px 12px',
                                display: 'inline-block',
                              }}
                            >
                              {step.name}
                            </span>
                            <span className="font-medium text-gray-900" style={{ color: 'hsl(var(--foreground))', fontWeight: 400, marginLeft: 8 }}>{step.description}</span>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>
                            <time dateTime={step.date}>{step.date}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Required */}
          <div className="mt-8">
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Action Required</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Please provide additional documentation to complete your verification. 
                      We need a clear photo of your face matching your ID document.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <button
                        type="button"
                        className="rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
                      >
                        Upload New Photo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 