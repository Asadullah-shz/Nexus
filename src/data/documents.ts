import { Doc, DocStatus } from '../types';

export type { Doc, DocStatus };

const STORAGE_KEY = 'nexus_documents';

export const INITIAL_DOCS: Doc[] = [
  {
    id: 'd1',
    name: 'Investment Term Sheet v2.pdf',
    type: 'PDF',
    size: '1.2 MB',
    uploadedAt: '2024-02-20',
    status: 'In Review' as DocStatus,
    signedBy: ['Michael Rodriguez'],
    ownerId: 'e1', 
    content: [
      { title: 'Investment Structure', lines: ['Series A Preferred Stock', 'Pre-money valuation: $10,000,000', 'Target Investment: $1,500,000'] },
      { title: 'Liquidation Preference', lines: ['1x Non-participating preferred', 'Standard anti-dilution provisions'] },
      { title: 'Board of Directors', lines: ['3 Total seats: 1 Entrepreneur, 1 Investor, 1 Independent'] }
    ]
  },
  {
    id: 'd2',
    name: 'NDA Agreement.pdf',
    type: 'PDF',
    size: '0.8 MB',
    uploadedAt: '2024-02-18',
    status: 'Signed' as DocStatus,
    signedBy: ['Michael Rodriguez', 'Sarah Johnson'],
    ownerId: 'e2', 
    content: [
      { title: '1. Definition of Confidential Information', lines: ['All information shared during technical discussion', 'Proprietary algorithms and user data structures'] },
      { title: '2. Term', lines: ['The term of this agreement is 3 years from signature'] },
      { title: '3. Non-Solicitation', lines: ['Neither party will solicit employees for 12 months'] }
    ]
  },
  {
    id: 'd3',
    name: 'Business Plan Q1 2024.docx',
    type: 'Document',
    size: '3.4 MB',
    uploadedAt: '2024-02-15',
    status: 'Draft' as DocStatus,
    ownerId: 'e1', 
    content: [
      { title: 'Executive Summary', lines: ['NexusWave is revolutionizing edge computing', 'Solving latency for high-throughput robotics'] },
      { title: 'Market Opportunity', lines: ['Total Addressable Market: $45B by 2026', 'Targeting manufacturing and logistics sectors'] },
      { title: 'Growth Strategy', lines: ['Direct sales to Tier-1 automotive partners', 'Strategic partnership with cloud providers'] }
    ]
  }
];

const getStoredDocuments = (): Doc[] => {
  if (typeof window === 'undefined') return INITIAL_DOCS;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : INITIAL_DOCS;
};

export let documents: Doc[] = getStoredDocuments();

const saveDocuments = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }
};

export const getDocumentsByOwner = (ownerId: string): Doc[] => {
  return documents.filter(doc => doc.ownerId === ownerId);
};

export const addDocument = (doc: Doc) => {
  documents.unshift(doc);
  saveDocuments();
};

export const updateDocStatus = (docId: string, status: DocStatus, signedBy?: string[]) => {
  documents = documents.map(doc => {
    if (doc.id === docId) {
      return { 
        ...doc, 
        status, 
        signedBy: signedBy || doc.signedBy 
      };
    }
    return doc;
  });
  saveDocuments();
};

export const deleteDocument = (docId: string) => {
  documents = documents.filter(doc => doc.id !== docId);
  saveDocuments();
};