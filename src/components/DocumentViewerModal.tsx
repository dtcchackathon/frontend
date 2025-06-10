import { Dialog } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

export type DocumentFile = {
  url: string
  name: string
  type: string // 'pdf' | 'image'
}

interface DocumentViewerModalProps {
  open: boolean
  onClose: () => void
  document: DocumentFile | null
}

export default function DocumentViewerModal({ open, onClose, document }: DocumentViewerModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  function onLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setLoading(false)
  }

  function handleClose() {
    setNumPages(null)
    setLoading(true)
    onClose()
  }

  return (
    <Dialog as="div" className="relative z-50" open={open} onClose={handleClose}>
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl relative">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            onClick={handleClose}
            title="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          {document ? (
            <div className="flex flex-col items-center">
              <div className="mb-4 flex w-full justify-between items-center">
                <Dialog.Title className="text-lg font-semibold">{document.name}</Dialog.Title>
              </div>
              <div className="w-full flex justify-center items-center min-h-[400px]">
                {document.type === 'pdf' ? (
                  <Document
                    file={document.url}
                    onLoadSuccess={onLoadSuccess}
                    loading={<span>Loading PDF...</span>}
                    onLoadError={() => setLoading(false)}
                  >
                    {Array.from(new Array(numPages), (el, index) => (
                      <Page key={`page_${index + 1}`} pageNumber={index + 1} width={500} />
                    ))}
                  </Document>
                ) : (
                  <img
                    src={document.url}
                    alt={document.name}
                    className="max-h-[500px] max-w-full rounded border"
                    onLoad={() => setLoading(false)}
                    style={{ display: loading ? 'none' : 'block' }}
                  />
                )}
                {loading && <div className="absolute"><span>Loading...</span></div>}
              </div>
            </div>
          ) : (
            <div>No document selected.</div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 