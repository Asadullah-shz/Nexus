import { CollaborationRequest } from '../types';

const STORAGE_KEY = 'nexus_collaboration_requests';

const initialRequests: CollaborationRequest[] = [
  {
    id: 'req1',
    investorId: 'i1',
    entrepreneurId: 'e1',
    message: 'Id like to explore potential investment in NexusWave. Your Smart financial analytics platform aligns well with my investment thesis.',
    status: 'pending',
    createdAt: '2023-08-10T15:30:00Z'
  },
  {
    id: 'req2',
    investorId: 'i2',
    entrepreneurId: 'e1',
    message: 'Interested in discussing how NexusWave can incorporate sustainable practices. Lets connect to explore potential collaboration.',
    status: 'accepted',
    createdAt: '2023-08-05T11:45:00Z'
  },
  {
    id: 'req3',
    investorId: 'i3',
    entrepreneurId: 'e3',
    message: 'Your HealthPulse platform addresses a critical need in mental healthcare. Id like to learn more about your traction and roadmap.',
    status: 'pending',
    createdAt: '2023-08-12T09:20:00Z'
  },
  {
    id: 'req4',
    investorId: 'i2',
    entrepreneurId: 'e2',
    message: 'GreenLifes biodegradable packaging solutions align with my focus on sustainable investments. Lets discuss scaling possibilities.',
    status: 'accepted',
    createdAt: '2023-07-28T14:15:00Z'
  },
  {
    id: 'req5',
    investorId: 'i1',
    entrepreneurId: 'e4',
    message: 'Your UrbanFarm concept is fascinating. Im interested in learning more about your IoT implementation and market validation.',
    status: 'rejected',
    createdAt: '2023-08-03T16:50:00Z'
  }
];

const getStoredRequests = (): CollaborationRequest[] => {
  if (typeof window === 'undefined') return initialRequests;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : initialRequests;
};

export let collaborationRequests: CollaborationRequest[] = getStoredRequests();

const saveRequests = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collaborationRequests));
  }
};

export const getRequestsForEntrepreneur = (entrepreneurId: string): CollaborationRequest[] => {
  return collaborationRequests
    .filter(request => request.entrepreneurId === entrepreneurId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getRequestsFromInvestor = (investorId: string): CollaborationRequest[] => {
  return collaborationRequests
    .filter(request => request.investorId === investorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const updateRequestStatus = (requestId: string, newStatus: 'pending' | 'accepted' | 'rejected'): CollaborationRequest | null => {
  const requestIndex = collaborationRequests.findIndex(req => req.id === requestId);
  if (requestIndex === -1) return null;
  
  collaborationRequests[requestIndex] = {
    ...collaborationRequests[requestIndex],
    status: newStatus
  };
  
  saveRequests();
  return collaborationRequests[requestIndex];
};

export const createCollaborationRequest = (
  investorId: string,
  entrepreneurId: string,
  message: string
): CollaborationRequest => {
  const newRequest: CollaborationRequest = {
    id: `req${Date.now()}`,
    investorId,
    entrepreneurId,
    message,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  collaborationRequests.push(newRequest);
  saveRequests();
  return newRequest;
};