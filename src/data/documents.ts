export type DocStatus = 'Draft' | 'In Review' | 'Signed';

export interface Doc {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: DocStatus;
  signedBy?: string[];
  ownerId: string; // The entrepreneur ID who owns this document
  content?: { title: string; lines: string[] }[];
}

export const INITIAL_DOCS: Doc[] = [
  {
    id: 'd1',
    name: 'Investment Term Sheet v2.pdf',
    type: 'PDF',
    size: '1.2 MB',
    uploadedAt: '2024-02-20',
    status: 'In Review',
    signedBy: ['Michael Rodriguez'],
    ownerId: 'e1', // Sarah Johnson
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
    status: 'Signed',
    signedBy: ['Michael Rodriguez', 'Sarah Johnson'],
    ownerId: 'e2', // Marcus Chen
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
    status: 'Draft',
    ownerId: 'e1', // Sarah Johnson
    content: [
      { title: 'Executive Summary', lines: ['TechWave AI is revolutionizing edge computing', 'Solving latency for high-throughput robotics'] },
      { title: 'Market Opportunity', lines: ['Total Addressable Market: $45B by 2026', 'Targeting manufacturing and logistics sectors'] },
      { title: 'Growth Strategy', lines: ['Direct sales to Tier-1 automotive partners', 'Strategic partnership with cloud providers'] }
    ]
  },
  {
    id: 'd4',
    name: 'Pitch Deck 2024.pdf',
    type: 'PDF',
    size: '5.2 MB',
    uploadedAt: '2024-02-25',
    status: 'Signed',
    ownerId: 'e1',
    content: [
      { title: 'The Problem', lines: ['Traditional AI is too slow for real-time safety systems', 'Cloud dependency leads to dangerous failures'] },
      { title: 'The Solution', lines: ['Proprietary "Liquid AI" architecture for edge chips', '90% reduction in power consumption'] },
      { title: 'Team', lines: ['Founders from MIT Media Lab and NVIDIA Robotics'] }
    ]
  },
  {
    id: 'd5',
    name: 'Financial Projections.xlsx',
    type: 'Spreadsheet',
    size: '2.1 MB',
    uploadedAt: '2024-03-01',
    status: 'In Review',
    ownerId: 'e1',
    content: [
      { title: 'Revenue Projection (FY24)', lines: ['Q1: $250k (Actual)', 'Q2: $450k (Projected)', 'Q3: $780k (Projected)', 'Q4: $1.2M (Projected)'] },
      { title: 'Burn & Runway', lines: ['Monthly Burn: $120k', 'Runway: 14 months (Pre-funding)'] },
      { title: 'Use of Funds', lines: ['60% R&D / Hiring', '25% Sales & Marketing', '15% Operations'] }
    ]
  },
];

export const getDocumentsByOwner = (ownerId: string): Doc[] => {
  return INITIAL_DOCS.filter(doc => doc.ownerId === ownerId);
};
