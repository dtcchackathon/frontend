'use client'

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ChatBot from '@/components/ChatBot';

const mockCustomers = [
  {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'Pending',
    kyc: {
      salutation: 'Mr.',
      title: 'Dr.',
      firstName: 'John',
      middleName: 'A.',
      lastName: 'Doe',
      dob: '1990-01-01',
      nationality: 'USA',
      gender: 'Male',
      govtId: 'A1234567',
      occupation: 'Engineer',
      employer: 'Acme Corp',
      sourceOfFunds: 'Salary',
      pep: 'No',
      altPhone: '+1 555-0000',
      email: 'john@example.com',
      phone: '+1 555-1234',
      personalAddress: {
        line1: '123 Main St',
        line2: '',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
      },
      legalAddress: {
        line1: '123 Main St',
        line2: '',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
      },
      risk: {
        pep: 'low',
        country: 'low',
        funds: 'low',
        occupation: 'low',
        overall: 'Low Risk',
      },
      documents: [
        { type: 'Driving License', name: 'license.pdf', url: '#' },
        { type: 'Passport', name: 'passport.pdf', url: '#' },
        { type: 'Adhar', name: 'adhar.pdf', url: '#' },
        { type: 'Photo', name: 'photo.jpg', url: '#' },
        { type: 'Video', name: 'video.mp4', url: '#' },
      ],
    },
  },
  // Add more mock customers as needed
];

export default function AgentKycPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = mockCustomers.find(c => c.id === selectedId) || null;
  const [agentNotes, setAgentNotes] = useState('');
  const [aiNotes, setAiNotes] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState<{ decision: 'Approve' | 'Reject'; reason: string } | null>(null);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');

  // Mock AI logic for notes and recommendation
  useEffect(() => {
    if (!selected) {
      setAiNotes('');
      setAiRecommendation(null);
      return;
    }
    // Mock: If any risk is not 'low', recommend reject
    const risk = selected.kyc.risk;
    let riskyFields = [];
    if (risk.pep !== 'low') riskyFields.push('PEP');
    if (risk.country !== 'low') riskyFields.push('Country');
    if (risk.funds !== 'low') riskyFields.push('Source of Funds');
    if (risk.occupation !== 'low') riskyFields.push('Occupation');
    if (riskyFields.length > 0) {
      setAiRecommendation({
        decision: 'Reject',
        reason: `High risk detected in: ${riskyFields.join(', ')}.`
      });
      setAiNotes(`Please review the following high-risk areas: ${riskyFields.join(', ')}. Consider requesting additional documentation or clarification.`);
    } else {
      setAiRecommendation({
        decision: 'Approve',
        reason: 'All risk factors are low. No issues detected.'
      });
      setAiNotes('No high-risk factors detected. Proceed with approval if all documents are valid.');
    }
  }, [selected]);

  // Mock AI Q&A
  const handleAskAI = () => {
    if (!selected || !aiQuestion.trim()) return;
    // Simple mock answers
    if (aiQuestion.toLowerCase().includes('why high risk')) {
      setAiAnswer(aiRecommendation?.reason || 'No high risk detected.');
    } else if (aiQuestion.toLowerCase().includes('recommend')) {
      setAiAnswer(`AI recommends: ${aiRecommendation?.decision}. Reason: ${aiRecommendation?.reason}`);
    } else {
      setAiAnswer('AI is not sure. Please rephrase your question.');
    }
  };

  // Helper to highlight risky fields
  const highlight = (risk: string) => risk !== 'low' ? 'bg-yellow-100' : '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <Navigation />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-6">Agent KYC Analysis</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Customer List */}
            <div className="bg-white rounded shadow p-4">
              <h2 className="font-semibold mb-4">Pending Customers</h2>
              <ul>
                {mockCustomers.map(c => (
                  <li key={c.id} className="mb-2">
                    <button
                      className={`w-full text-left px-3 py-2 rounded ${selectedId === c.id ? 'bg-blue-100 font-bold' : 'hover:bg-gray-100'}`}
                      onClick={() => setSelectedId(c.id)}
                    >
                      {c.name} <span className="text-xs text-gray-500">({c.status})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Customer Details */}
            <div className="md:col-span-2 bg-white rounded shadow p-6">
              {selected ? (
                <div>
                  <h2 className="text-xl font-semibold mb-2">KYC Details for {selected.name}</h2>
                  {/* AI Recommendation */}
                  <div className="mb-4 p-4 rounded border border-blue-200 bg-blue-50">
                    <b>AI Recommendation:</b> <span className={aiRecommendation?.decision === 'Approve' ? 'text-green-700' : 'text-red-700'}>{aiRecommendation?.decision}</span><br />
                    <span className="text-sm text-gray-700">{aiRecommendation?.reason}</span>
                  </div>
                  {/* Risk Analysis with highlights */}
                  <div className="mb-4">
                    <b>Risk Analysis:</b><br />
                    <span className={highlight(selected.kyc.risk.pep)}>PEP: {selected.kyc.risk.pep}</span>,{' '}
                    <span className={highlight(selected.kyc.risk.country)}>Country: {selected.kyc.risk.country}</span>,{' '}
                    <span className={highlight(selected.kyc.risk.funds)}>Source of Funds: {selected.kyc.risk.funds}</span>,{' '}
                    <span className={highlight(selected.kyc.risk.occupation)}>Occupation: {selected.kyc.risk.occupation}</span>,{' '}
                    <b>Overall:</b> <span className={selected.kyc.risk.overall !== 'Low Risk' ? 'bg-yellow-100' : ''}>{selected.kyc.risk.overall}</span>
                    <div className="text-xs text-gray-500 mt-1">Risk score is calculated based on PEP, country, source of funds, and occupation risk levels.</div>
                  </div>
                  {/* Personal Info */}
                  <div className="mb-4">
                    <b>Email:</b> {selected.kyc.email} <br />
                    <b>Phone:</b> {selected.kyc.phone} <br />
                    <b>Alt Phone:</b> {selected.kyc.altPhone} <br />
                    <b>Salutation:</b> {selected.kyc.salutation} <br />
                    <b>Title:</b> {selected.kyc.title} <br />
                    <b>Name:</b> {selected.kyc.firstName} {selected.kyc.middleName} {selected.kyc.lastName} <br />
                    <b>DOB:</b> {selected.kyc.dob} <br />
                    <b>Nationality:</b> {selected.kyc.nationality} <br />
                    <b>Gender:</b> {selected.kyc.gender} <br />
                    <b>Occupation:</b> {selected.kyc.occupation} <br />
                    <b>Employer:</b> {selected.kyc.employer} <br />
                    <b>Source of Funds:</b> {selected.kyc.sourceOfFunds} <br />
                    <b>PEP:</b> {selected.kyc.pep} <br />
                  </div>
                  <div className="mb-4">
                    <b>Personal Address:</b> {selected.kyc.personalAddress.line1}, {selected.kyc.personalAddress.line2 && `${selected.kyc.personalAddress.line2}, `}{selected.kyc.personalAddress.city}, {selected.kyc.personalAddress.state} {selected.kyc.personalAddress.postalCode}, {selected.kyc.personalAddress.country}<br />
                    <b>Legal Address:</b> {selected.kyc.legalAddress.line1}, {selected.kyc.legalAddress.line2 && `${selected.kyc.legalAddress.line2}, `}{selected.kyc.legalAddress.city}, {selected.kyc.legalAddress.state} {selected.kyc.legalAddress.postalCode}, {selected.kyc.legalAddress.country}<br />
                  </div>
                  <div className="mb-4">
                    <b>Documents:</b>
                    <ul className="list-disc ml-6">
                      {selected.kyc.documents.map((doc, i) => (
                        <li key={i}><a href={doc.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{doc.type}: {doc.name}</a></li>
                      ))}
                    </ul>
                  </div>
                  {/* AI Suggested Notes */}
                  <div className="mb-2">
                    <label className="block font-medium mb-1">AI Suggested Notes</label>
                    <div className="w-full border rounded p-2 bg-gray-50 text-gray-700 text-sm mb-2">{aiNotes}</div>
                  </div>
                  <div className="mb-4">
                    <label className="block font-medium mb-1">Agent Notes</label>
                    <textarea
                      className="w-full border rounded p-2"
                      rows={3}
                      value={agentNotes}
                      onChange={e => setAgentNotes(e.target.value)}
                      placeholder="Add notes or comments..."
                    />
                  </div>
                  {/* Ask AI Section */}
                  <div className="mb-4">
                    <label className="block font-medium mb-1">Ask AI about this customer</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        className="flex-1 border rounded p-2"
                        type="text"
                        value={aiQuestion}
                        onChange={e => setAiQuestion(e.target.value)}
                        placeholder="E.g. Why is this customer high risk?"
                      />
                      <button
                        className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                        onClick={handleAskAI}
                        type="button"
                      >Ask AI</button>
                    </div>
                    {aiAnswer && <div className="text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded p-2">{aiAnswer}</div>}
                  </div>
                  <div className="flex gap-4">
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Approve</button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reject</button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Select a customer to view KYC details.</div>
              )}
            </div>
          </div>
        </div>
      </main>
      <ChatBot />
    </div>
  );
} 