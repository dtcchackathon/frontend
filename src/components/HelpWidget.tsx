import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

const faqs = [
  { q: 'How do I start a new KYC?', a: 'Click the "New KYC" button in the navigation bar and fill out the form.' },
  { q: 'How do I upload documents?', a: 'Go to the Documents section for a customer and use the Upload Document button.' },
  { q: 'Who can I contact for support?', a: 'You can email support@kycai.com or use the form below.' },
]

export default function HelpWidget() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2000)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <>
      {/* Floating Help Button */}
      <button
        className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-700 focus:outline-none"
        onClick={() => setOpen(true)}
        title="Help & Support"
      >
        <QuestionMarkCircleIcon className="h-7 w-7" />
      </button>
      {/* Modal */}
      <Dialog as="div" className="relative z-50" open={open} onClose={() => setOpen(false)}>
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setOpen(false)}
              title="Close"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <Dialog.Title className="text-xl font-bold mb-4">Help & Support</Dialog.Title>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Frequently Asked Questions</h3>
              <ul className="space-y-2">
                {faqs.map((faq, idx) => (
                  <li key={idx}>
                    <div className="font-medium text-gray-900">Q: {faq.q}</div>
                    <div className="text-gray-700 text-sm">A: {faq.a}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <div className="text-sm mb-2">Email: <a href="mailto:support@kycai.com" className="text-blue-600 underline">support@kycai.com</a></div>
              <form className="space-y-2" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <textarea
                  name="message"
                  placeholder="How can we help you?"
                  className="w-full rounded border px-3 py-2 text-sm"
                  rows={3}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700"
                  disabled={submitted}
                >
                  {submitted ? 'Message Sent!' : 'Send Message'}
                </button>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
} 