import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayoutShell from '@/components/ClientLayoutShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KYC Process - AI-Powered Verification',
  description: 'Modern KYC verification system powered by AWS AI services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`}>
        <ClientLayoutShell>
          {children}
        </ClientLayoutShell>
      </body>
    </html>
  )
} 