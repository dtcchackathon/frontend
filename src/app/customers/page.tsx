'use client'

import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { EyeIcon, DocumentTextIcon, IdentificationIcon, ArrowPathIcon, PlayIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import CustomerTable, { Customer } from '@/components/CustomerTable'
import { toast } from 'sonner'

interface CustomerResponse {
  kyc_details_id: number
  kyc_case_id: number
  name: string | null
  email: string | null
  status: string | null
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/customers`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }

      const data: CustomerResponse[] = await response.json()
      
      // Transform API response to Customer type
      const transformedCustomers: Customer[] = data.map(customer => ({
        id: customer.kyc_details_id?.toString() || 'N/A',
        kycCaseId: customer.kyc_case_id?.toString() || 'N/A',
        name: customer.name || 'N/A',
        email: customer.email || 'N/A'
      }))

      // Create status mapping
      const statusMapping: Record<string, string> = {}
      data.forEach(customer => {
        if (customer.status && customer.kyc_details_id) {
          statusMapping[customer.kyc_details_id.toString()] = customer.status
        }
      })

      setCustomers(transformedCustomers)
      setStatuses(statusMapping)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to fetch customers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleRefresh = () => {
    fetchCustomers()
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
                  <h3 className="text-sm font-medium text-red-800">Error loading customers</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleRefresh}
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Customers</h1>
            <div className="flex gap-4">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center rounded bg-gray-600 px-4 py-2 text-white font-semibold hover:bg-gray-700"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Refresh
              </button>
              <Link href="/kyc/agent" className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700">
                Agent KYC Analysis
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <CustomerTable
              customers={customers}
              statuses={statuses}
              extraActions={(customer) => {
                const status = statuses[customer.id]
                const isDisabled = status === 'completed'
                return (
                  <>
                    <Link
                      href={isDisabled ? '#' : `/customers/${customer.id}/verification`}
                      className={`rounded bg-purple-600 px-3 py-1 text-white flex items-center justify-center mr-1 ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-purple-700'}`}
                      title="Verification"
                      tabIndex={isDisabled ? -1 : 0}
                      aria-disabled={isDisabled}
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      href={isDisabled ? '#' : `/kyc/${customer.kycCaseId}/edit`}
                      className={`rounded bg-blue-600 px-3 py-1 text-white flex items-center justify-center ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-700'}`}
                      title="Resume"
                      tabIndex={isDisabled ? -1 : 0}
                      aria-disabled={isDisabled}
                    >
                      <PlayIcon className="h-5 w-5" />
                    </Link>
                  </>
                )
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
} 