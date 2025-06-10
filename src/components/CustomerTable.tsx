import Link from 'next/link'
import { EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export type Customer = {
  id: string
  kycCaseId: string
  name: string
  email: string
}

interface CustomerTableProps {
  customers: Customer[]
  statuses?: Record<string, string>
  extraActions?: (customer: Customer) => React.ReactNode
}

const statusChipStyle = (status: string) => {
  if (status === 'Verified' || status === 'Completed') {
    return {
      backgroundColor: 'hsl(var(--status-completed-bg))',
      color: 'hsl(var(--status-completed-text))',
      border: '1px solid hsl(var(--status-completed-text))',
    }
  }
  if (status === 'Pending' || status === 'In Progress') {
    return {
      backgroundColor: 'hsl(var(--status-inprogress-bg))',
      color: 'hsl(var(--status-inprogress-text))',
      border: '1px solid hsl(var(--status-inprogress-text))',
    }
  }
  if (status === 'Error' || status === 'Rejected') {
    return {
      backgroundColor: 'hsl(var(--status-error-bg))',
      color: 'hsl(var(--status-error-text))',
      border: '1px solid hsl(var(--status-error-text))',
    }
  }
  return {
    backgroundColor: 'hsl(var(--accent))',
    color: 'hsl(var(--accent-foreground))',
    border: '1px solid hsl(var(--border))',
  }
}

export default function CustomerTable({ customers, statuses, extraActions }: CustomerTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow" style={{ backgroundColor: 'hsl(var(--card, var(--background)))', border: '1px solid hsl(var(--border))' }}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))', background: 'none' }}>Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))', background: 'none' }}>Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))', background: 'none' }}>Status</th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--foreground))', background: 'none' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'hsl(var(--foreground))', background: 'none' }}>{customer.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'hsl(var(--foreground))', background: 'none' }}>{customer.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ background: 'none' }}>
                {statuses && statuses[customer.id] ? (
                  <span
                    className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ ...statusChipStyle(statuses[customer.id]), minWidth: 80, textAlign: 'center' }}
                  >
                    {statuses[customer.id]}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: 'hsl(var(--foreground))' }}>-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium flex gap-2 justify-center" style={{ background: 'none' }}>
                <Link
                  href={`/customers/${customer.id}/status`}
                  className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700 flex items-center justify-center"
                  title="View Status"
                >
                  <EyeIcon className="h-5 w-5" />
                </Link>
                <Link
                  href={`/customers/${customer.id}/documents`}
                  className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 flex items-center justify-center"
                  title="View Documents"
                >
                  <DocumentTextIcon className="h-5 w-5" />
                </Link>
                {extraActions && extraActions(customer)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 