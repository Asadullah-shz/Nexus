import { Transaction } from '../types';

const STORAGE_KEY_TXS = 'nexus_transactions';
const STORAGE_KEY_BALANCE = 'nexus_wallet_balance';

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'deposit', amount: 50000, sender: 'Bank Account', receiver: 'My Wallet', status: 'completed', date: '2024-02-20', description: 'Deposit from Chase Bank' },
  { id: 't2', type: 'funding', amount: 25000, sender: 'Michael Rodriguez', receiver: 'NexusWave', status: 'completed', date: '2024-02-18', description: 'Deal funding - Series A' },
  { id: 't3', type: 'transfer', amount: 5000, sender: 'My Wallet', receiver: 'Jennifer Lee', status: 'pending', date: '2024-02-16', description: 'Consulting fee' },
  { id: 't4', type: 'withdrawal', amount: 10000, sender: 'My Wallet', receiver: 'Bank Account', status: 'completed', date: '2024-02-14', description: 'Withdrawal to bank' },
  { id: 't5', type: 'funding', amount: 15000, sender: 'Jennifer Lee', receiver: 'GreenLife Solutions', status: 'failed', date: '2024-02-10', description: 'Seed funding attempt' },
];

const INITIAL_BALANCE = 125000;

export const getStoredTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  const stored = localStorage.getItem(STORAGE_KEY_TXS);
  return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
};

export const saveTransactions = (txs: Transaction[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(txs));
  }
};

export const getStoredBalance = (): number => {
  if (typeof window === 'undefined') return INITIAL_BALANCE;
  const stored = localStorage.getItem(STORAGE_KEY_BALANCE);
  return stored ? parseFloat(stored) : INITIAL_BALANCE;
};

export const saveBalance = (balance: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_BALANCE, balance.toString());
  }
};

export const addTransaction = (tx: Transaction) => {
  const txs = getStoredTransactions();
  txs.unshift(tx);
  saveTransactions(txs);
};

export const updateTransactionStatus = (id: string, status: Transaction['status']) => {
  const txs = getStoredTransactions();
  const updated = txs.map(tx => tx.id === id ? { ...tx, status } : tx);
  saveTransactions(updated);
};
