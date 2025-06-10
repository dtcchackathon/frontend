'use client'

import { Toaster } from 'react-hot-toast'
import HelpWidget from '@/components/HelpWidget'

export default function ClientLayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Toaster position="top-right" />
      <HelpWidget />
      {children}
    </>
  )
} 