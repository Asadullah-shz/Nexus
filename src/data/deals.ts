import { Deal } from '../types';

const STORAGE_KEY = 'nexus_deals';

const initialDeals: Deal[] = [
  {
    id: 1,
    startup: {
      name: 'NexusWave',
      logo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      industry: 'FinTech'
    },
    amount: '$1.5M',
    equity: '15%',
    status: 'Due Diligence',
    stage: 'Series A',
    lastActivity: '2024-02-15'
  }
];

const getStoredDeals = (): Deal[] => {
  if (typeof window === 'undefined') return initialDeals;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : initialDeals;
};

export let deals: Deal[] = getStoredDeals();

const saveDeals = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  }
};

export const addDeal = (deal: Deal) => {
  deals.unshift(deal);
  saveDeals();
};

export const getDeals = () => deals;

export const createDealFromRequest = (entrepreneurName: string, industry: string, avatarUrl: string) => {
  const newDeal: Deal = {
    id: Date.now(),
    startup: {
      name: entrepreneurName,
      logo: avatarUrl,
      industry: industry
    },
    amount: 'TBD',
    equity: 'TBD',
    status: 'Negotiation',
    stage: 'Seed',
    lastActivity: new Date().toISOString().split('T')[0]
  };
  addDeal(newDeal);
};