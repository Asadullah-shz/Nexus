import React, { useState } from 'react';
import {
  DollarSign, ArrowUpRight, ArrowDownLeft, ArrowLeftRight,
Clock, CheckCircle, XCircle,Wallet, Building2, Send
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { CreditCard } from '../../components/ui/credit-card';

type TxStatus = 'completed' | 'pending' | 'failed';
type TxType = 'deposit' | 'withdrawal' | 'transfer' | 'funding';

interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  sender: string;
  receiver: string;
  status: TxStatus;
  date: string;
  description: string;
}

interface Deal {
  startup: string;
  avatar: string;
  target: number;
  raised: number;
  investors: number;
}

const INITIAL_DEALS: Deal[] = [
  { startup: 'TechWave AI', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', target: 1500000, raised: 750000, investors: 3 },
  { startup: 'GreenLife Solutions', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg', target: 2000000, raised: 1200000, investors: 5 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'deposit', amount: 50000, sender: 'Bank Account', receiver: 'My Wallet', status: 'completed', date: '2024-02-20', description: 'Deposit from Chase Bank' },
  { id: 't2', type: 'funding', amount: 25000, sender: 'Michael Rodriguez', receiver: 'TechWave AI', status: 'completed', date: '2024-02-18', description: 'Deal funding - Series A' },
  { id: 't3', type: 'transfer', amount: 5000, sender: 'My Wallet', receiver: 'Jennifer Lee', status: 'pending', date: '2024-02-16', description: 'Consulting fee' },
  { id: 't4', type: 'withdrawal', amount: 10000, sender: 'My Wallet', receiver: 'Bank Account', status: 'completed', date: '2024-02-14', description: 'Withdrawal to bank' },
  { id: 't5', type: 'funding', amount: 15000, sender: 'Jennifer Lee', receiver: 'GreenLife Solutions', status: 'failed', date: '2024-02-10', description: 'Seed funding attempt' },
];

const TX_CONFIG: Record<TxType, { label: string; color: string; icon: React.ReactNode }> = {
  deposit: { label: 'Deposit', color: 'text-green-600', icon: <ArrowDownLeft size={16} /> },
  withdrawal: { label: 'Withdrawal', color: 'text-red-500', icon: <ArrowUpRight size={16} /> },
  transfer: { label: 'Transfer', color: 'text-blue-500', icon: <ArrowLeftRight size={16} /> },
  funding: { label: 'Deal Funding', color: 'text-purple-600', icon: <Building2 size={16} /> },
};

const STATUS_CONFIG: Record<TxStatus, { variant: 'success' | 'warning' | 'error'; icon: React.ReactNode }> = {
  completed: { variant: 'success', icon: <CheckCircle size={12} /> },
  pending: { variant: 'warning', icon: <Clock size={12} /> },
  failed: { variant: 'error', icon: <XCircle size={12} /> },
};

type ModalType = 'deposit' | 'withdraw' | 'transfer' | 'funding' | null;

interface ActionModalProps {
  type: ModalType;
  walletBalance: number;
  deals: Deal[];
  onClose: () => void;
  onSubmit: (amount: number, target: string) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ type, walletBalance, deals, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [target, setTarget] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!type) return null;

  const configs = {
    deposit: { title: 'Deposit Funds', targetLabel: 'From Account', targetPlaceholder: 'Bank Account / IBAN', icon: <ArrowDownLeft size={20} />, color: 'text-green-600' },
    withdraw: { title: 'Withdraw Funds', targetLabel: 'To Account', targetPlaceholder: 'Bank Account / IBAN', icon: <ArrowUpRight size={20} />, color: 'text-red-500' },
    transfer: { title: 'Transfer Funds', targetLabel: 'Recipient', targetPlaceholder: 'Name or wallet address', icon: <ArrowLeftRight size={20} />, color: 'text-blue-500' },
    funding: { title: 'Fund a Deal', targetLabel: 'Startup / Deal', targetPlaceholder: 'Startup name or deal ID', icon: <Building2 size={20} />, color: 'text-purple-600' },
  };

  const cfg = configs[type];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gray-100 rounded-lg ${cfg.color}`}>{cfg.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900">{cfg.title}</h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{cfg.targetLabel}</label>
            {type === 'funding' ? (
              <select
                value={target}
                onChange={e => setTarget(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="">Select a startup</option>
                {deals.map(d => (
                  <option key={d.startup} value={d.startup}>{d.startup}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder={cfg.targetPlaceholder}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            )}
          </div>

          {/* Validation Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs animate-shake">
              <XCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick amounts */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Quick amounts</p>
            <div className="flex gap-2">
              {[1000, 5000, 10000, 25000].map(a => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                >
                  ${a.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Mock card details for deposit */}
          {type === 'deposit' && (
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-200">
              <CreditCard type="gray-dark"  />
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={() => {
              const numAmount = parseFloat(amount);
              if (!amount || numAmount <= 0) {
                setError('Please enter a valid amount');
                return;
              }
              
              const isOutgoing = type === 'withdraw' || type === 'transfer' || type === 'funding';
              if (isOutgoing && numAmount > walletBalance) {
                setError(`Insufficient funds. Available: $${walletBalance.toLocaleString()}`);
                return;
              }

              if (type === 'funding' && !target) {
                setError('Please select a startup to fund');
                return;
              }

              setError(null);
              onSubmit(numAmount, target || 'Unknown');
            }}
            className="flex-1"
            leftIcon={<Send size={16} />}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [walletBalance, setWalletBalance] = useState(125_000);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [filter, setFilter] = useState<TxType | 'all'>('all');

  const handleAction = (amount: number, target: string) => {
    const typeMap: Record<NonNullable<ModalType>, TxType> = {
      deposit: 'deposit', withdraw: 'withdrawal', transfer: 'transfer', funding: 'funding'
    };
    const type = typeMap[activeModal!];
    const isIncoming = type === 'deposit';
    const isOutgoing = type === 'withdrawal' || type === 'transfer' || type === 'funding';

    const newTx: Transaction = {
      id: `t${Date.now()}`,
      type,
      amount,
      sender: isIncoming ? target : (user?.name || 'You'),
      receiver: isOutgoing ? target : (user?.name || 'You'),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      description: `${TX_CONFIG[type].label} - ${target}`
    };

    setTransactions(txs => [newTx, ...txs]);
    if (isIncoming) setWalletBalance(b => b + amount);
    if (isOutgoing) setWalletBalance(b => b - amount);

    // If funding a deal, update the deals state
    if (type === 'funding') {
      setDeals(prevDeals => prevDeals.map(deal => 
        deal.startup.toLowerCase() === target.toLowerCase() 
          ? { ...deal, raised: deal.raised + amount, investors: deal.investors + 1 }
          : deal
      ));
    }

    toast.success(`${TX_CONFIG[type].label} of $${amount.toLocaleString()} initiated!`);
    setActiveModal(null);

    // Simulate completion
    setTimeout(() => {
      setTransactions(txs => txs.map(tx => tx.id === newTx.id ? { ...tx, status: 'completed' } : tx));
    }, 3000);
  };

  const filteredTxs = filter === 'all' ? transactions : transactions.filter(tx => tx.type === filter);
  const totalIn = transactions.filter(tx => tx.type === 'deposit' && tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);
  const totalOut = transactions.filter(tx => tx.type !== 'deposit' && tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments & Wallet</h1>
        <p className="text-gray-600">Manage your funds and track investment transactions</p>
      </div>

      {/* Wallet card */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Wallet size={16} />
              <span className="text-sm">My Wallet Balance</span>
            </div>
            <h2 className="text-4xl font-bold">${walletBalance.toLocaleString()}</h2>
            <p className="text-primary-200 text-sm mt-1">Available Balance · USD</p>
          </div>
          <div className="bg-white/10 p-3 rounded-xl">
            <DollarSign size={28} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <div className="flex items-center gap-1 text-green-300 text-xs mb-1">
              <ArrowDownLeft size={12} /> Total In
            </div>
            <p className="text-white font-semibold">${totalIn.toLocaleString()}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-red-300 text-xs mb-1">
              <ArrowUpRight size={12} /> Total Out
            </div>
            <p className="text-white font-semibold">${totalOut.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {([
          { type: 'deposit', label: 'Deposit', icon: <ArrowDownLeft size={24} />, color: 'bg-green-50 text-green-600 hover:bg-green-100' },
          { type: 'withdraw', label: 'Withdraw', icon: <ArrowUpRight size={24} />, color: 'bg-red-50 text-red-500 hover:bg-red-100' },
          { type: 'transfer', label: 'Transfer', icon: <ArrowLeftRight size={24} />, color: 'bg-blue-50 text-blue-500 hover:bg-blue-100' },
          { type: 'funding', label: 'Fund Deal', icon: <Building2 size={24} />, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
        ] as const).map(action => (
          <button
            key={action.type}
            onClick={() => setActiveModal(action.type as ModalType)}
            className={`flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200 transition-colors ${action.color}`}
          >
            {action.icon}
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Deals funding section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Active Deal Funding</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {deals.map((deal, i) => {
            const pct = Math.round((deal.raised / deal.target) * 100);
            return (
              <div key={i} className="p-4 border border-gray-100 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={deal.avatar} alt={deal.startup} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{deal.startup}</p>
                      <p className="text-xs text-gray-500">{deal.investors} investors · Series A</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setActiveModal('funding')}>
                    Invest
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>${deal.raised.toLocaleString()} raised</span>
                  <span>{pct}%</span>
                  <span>Goal: ${deal.target.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
            <div className="flex gap-2 overflow-x-auto">
              {(['all', 'deposit', 'withdrawal', 'transfer', 'funding'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                    filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All' : TX_CONFIG[f].label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Description', 'Sender', 'Receiver', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTxs.length > 0 ? (
                  filteredTxs.map(tx => {
                    const txCfg = TX_CONFIG[tx.type];
                    const stCfg = STATUS_CONFIG[tx.status];
                    const isIn = tx.type === 'deposit';
                    const displayDate = new Date(tx.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-gray-100 ${txCfg.color}`}>{txCfg.icon}</div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-32">{tx.description}</p>
                              <p className="text-xs text-gray-500">{txCfg.label}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{tx.sender}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{tx.receiver}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${isIn ? 'text-green-600' : 'text-red-500'}`}>
                            {isIn ? '+' : '-'}${tx.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={stCfg.variant} size="sm">
                            <span className="flex items-center gap-1">{stCfg.icon}{tx.status}</span>
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{displayDate}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Clock size={32} className="text-gray-200" />
                        <p>No transactions found for this category</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {activeModal && (
        <ActionModal
          type={activeModal}
          walletBalance={walletBalance}
          deals={deals}
          onClose={() => setActiveModal(null)}
          onSubmit={handleAction}
        />
      )}
    </div>
  );
};
