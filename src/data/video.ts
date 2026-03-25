import { Participant } from '../types';

export const MOCK_PARTICIPANTS: Participant[] = [
  {
    id: 'i1',
    name: 'Michael Alexander',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    isMuted: false,
    isVideoOff: false,
  },
  {
    id: 'i2',
    name: 'Jennifer Lee',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    isMuted: true,
    isVideoOff: false,
  },
];

export const ALT_AVATAR = 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg';
