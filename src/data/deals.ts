import { Deal } from '../types';

export const deals: Deal[] = [
  {
    id: 1,
    startup: {
      name: 'TechWave AI',
      logo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      industry: 'FinTech'
    },
    amount: '$1.5M',
    equity: '15%',
    status: 'Due Diligence',
    stage: 'Series A',
    lastActivity: '2024-02-15'
  },
  {
    id: 2,
    startup: {
      name: 'GreenLife Solutions',
      logo: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
      industry: 'CleanTech'
    },
    amount: '$2M',
    equity: '20%',
    status: 'Term Sheet',
    stage: 'Seed',
    lastActivity: '2024-02-10'
  },
  {
    id: 3,
    startup: {
      name: 'HealthPulse',
      logo: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      industry: 'HealthTech'
    },
    amount: '$800K',
    equity: '12%',
    status: 'Negotiation',
    stage: 'Pre-seed',
    lastActivity: '2024-02-05'
  }
];
