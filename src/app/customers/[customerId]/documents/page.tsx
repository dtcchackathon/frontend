'use client'

import React, { useState } from 'react'
import Navigation from '@/components/Navigation'
import { useParams } from 'next/navigation'
import { DocumentArrowDownIcon, TrashIcon, DocumentPlusIcon, EyeIcon } from '@heroicons/react/24/outline'
import DocumentViewerModal, { DocumentFile } from '@/components/DocumentViewerModal'

const mockCustomers = {
  '123': { name: 'John Doe', email: 'john@example.com' },
  '456': { name: 'Jane Smith', email: 'jane@example.com' },
}

const mockDocuments = [
  {
    id: 1,
    customerId: '123',
    name: 'ID Card.pdf',
    type: 'PDF',
    uploaded: '2024-06-01',
    status: 'Verified',
  },
  {
    id: 2,
    customerId: '123',
    name: 'Proof_of_Address.jpg',
    type: 'Image',
    uploaded: '2024-06-02',
    status: 'Pending',
  },
  {
    id: 3,
    customerId: '456',
    name: 'Selfie.png',
    type: 'Image',
    uploaded: '2024-06-02',
    status: 'Verified',
  },
]

export default function CustomerDocumentsPage() {
  const params = useParams()
  const customerId = Array.isArray(params.customerId) ? params.customerId[0] : params.customerId
  const customer = mockCustomers[customerId as keyof typeof mockCustomers] || { name: 'Unknown', email: '' }
  const [documents, setDocuments] = useState(mockDocuments.filter(doc => doc.customerId === customerId))
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<DocumentFile | null>(null)

  const handleDelete = (id: number) => {
    setDocuments((docs) => docs.filter((doc) => doc.id !== id))
  }

  const handlePreview = (doc: any) => {
    setSelectedDoc({
      url: `/mock-docs/${doc.name}`, // Replace with actual URL in real app
      name: doc.name,
      type: doc.type.toLowerCase() === 'pdf' ? 'pdf' : 'image',
    })
    setViewerOpen(true)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-200 flex items-center justify-center w-12 h-12 text-xl font-bold" style={{ color: 'hsl(var(--primary))' }}>{customer.name[0]}</div>
              <div>
                <div className="font-semibold text-lg" style={{ color: 'hsl(var(--foreground))' }}>{customer.name}</div>
                <div className="text-sm" style={{ color: 'hsl(var(--foreground))', opacity: 0.7 }}>{customer.email}</div>
                <div className="text-xs" style={{ color: 'hsl(var(--foreground))', opacity: 0.5 }}>Customer ID: {customerId}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Documents</h1>
            <button
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
              style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              <DocumentPlusIcon className="h-5 w-5" />
              Upload Document
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg shadow" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))' }}>Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))' }}>Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))' }}>Uploaded</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))' }}>Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'hsl(var(--foreground))' }}>{doc.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'hsl(var(--foreground))' }}>{doc.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'hsl(var(--foreground))' }}>{doc.uploaded}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: doc.status === 'Verified' ? 'hsl(var(--status-completed-bg))' : 'hsl(var(--status-inprogress-bg))',
                          color: doc.status === 'Verified' ? 'hsl(var(--status-completed-text))' : 'hsl(var(--status-inprogress-text))',
                          border: '1px solid ' + (doc.status === 'Verified' ? 'hsl(var(--status-completed-text))' : 'hsl(var(--status-inprogress-text))'),
                        }}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                      <button
                        className="rounded p-2"
                        style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
                        title="Preview"
                        onClick={() => handlePreview(doc)}
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="rounded p-2"
                        style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
                        title="Download"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="rounded p-2"
                        style={{ backgroundColor: 'hsl(var(--status-error-bg))', color: 'hsl(var(--status-error-text))' }}
                        title="Delete"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <DocumentViewerModal open={viewerOpen} onClose={() => setViewerOpen(false)} document={selectedDoc} />
    </div>
  )
} 