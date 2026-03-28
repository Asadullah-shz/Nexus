import React, { useState, useEffect } from 'react';
import {
  DollarSign, ArrowUpRight, ArrowDownLeft, ArrowLeftRight,
  Clock, CheckCircle, XCircle, Wallet, Building2, Send
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { CreditCard } from '../../components/ui/credit-card';
import { 
  getStoredTransactions, 
  saveTransactions, 
  getStoredBalance, 
  saveBalance,
  updateTransactionStatus
} from '../../data/payments';
import { Transaction, TransactionType, TransactionStatus } from '../../types';

type TxStatus = TransactionStatus;
type TxType = TransactionType;

interface Deal {
  startup: string;
  avatar: string;
  target: number;
  raised: number;
  investors: number;
}

const INITIAL_DEALS: Deal[] = [
  { startup: 'NexusWave', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', target: 2000000, raised: 1800000, investors: 24 },
  { startup: 'GreenLife Solutions', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg', target: 1500000, raised: 900000, investors: 18 },
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gray-100 rounded-lg ${cfg.color}`}>{cfg.icon}</div>
            <h2 className="text-xl font-semibold text-gray-900">{cfg.title}</h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
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

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs animate-shake">
              <XCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-2">Quick amounts</p>
            <div className="flex gap-2">
              {[1000, 5000, 10000, 25000].map(a => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  ${a.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {type === 'deposit' && (
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-200 overflow-hidden">
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
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions());
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [walletBalance, setWalletBalance] = useState(getStoredBalance());
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [filter, setFilter] = useState<TxType | 'all'>('all');

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBalance(walletBalance);
  }, [walletBalance]);

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

    if (type === 'funding') {
      setDeals(prevDeals => prevDeals.map(deal =>
        deal.startup.toLowerCase() === target.toLowerCase()
          ? { ...deal, raised: deal.raised + amount, investors: deal.investors + 1 }
          : deal
      ));
    }

    toast.success(`${TX_CONFIG[type].label} of $${amount.toLocaleString()} initiated!`);
    setActiveModal(null);

    setTimeout(() => {
      setTransactions(txs => txs.map(tx => tx.id === newTx.id ? { ...tx, status: 'completed' } : tx));
      updateTransactionStatus(newTx.id, 'completed');
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

      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <Wallet size={16} />
              <span className="text-sm font-medium tracking-wide border-b border-white/20 pb-0.5">My Wallet Balance</span>
            </div>
            <h2 className="text-5xl font-extrabold tracking-tight">${walletBalance.toLocaleString()}</h2>
            <p className="text-primary-100 text-xs mt-3 bg-white/10 inline-block px-2 py-0.5 rounded-full backdrop-blur-sm">Available Balance · USD</p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
            <DollarSign size={32} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 text-green-300 text-xs font-bold uppercase tracking-widest mb-1 opacity-90">
              <ArrowDownLeft size={14} className="animate-pulse" /> Total In
            </div>
            <p className="text-2xl font-bold text-white">${totalIn.toLocaleString()}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-red-300 text-xs font-bold uppercase tracking-widest mb-1 opacity-90">
              <ArrowUpRight size={14} className="animate-pulse" /> Total Out
            </div>
            <p className="text-2xl font-bold text-white">${totalOut.toLocaleString()}</p>
          </div>
        </div>
      </div>

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
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 transition-all hover:shadow-lg active:scale-95 ${action.color}`}
          >
            <div className="p-2 rounded-xl bg-white/50 shadow-sm">{action.icon}</div>
            <span className="text-sm font-bold tracking-tight">{action.label}</span>
          </button>
        ))}
      </div>

      <Card className="rounded-2xl border-none shadow-premium overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Active Deal Funding</h2>
        </CardHeader>
        <CardBody className="space-y-4 p-6">
          {deals.map((deal, i) => {
            const pct = Math.round((deal.raised / deal.target) * 100);
            return (
              <div key={i} className="p-5 border border-gray-100 rounded-2xl hover:border-primary-200 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar src={deal.avatar} alt={deal.startup} size="md" className="ring-2 ring-gray-100" />
                    <div>
                      <p className="font-bold text-gray-900 text-base">{deal.startup}</p>
                      <p className="text-xs text-gray-500 font-medium">{deal.investors} investors · Series A</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setActiveModal('funding')} className="font-bold tracking-tight hover:bg-primary-50">
                    Invest Now
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2.5 font-bold uppercase tracking-wider">
                  <span className="text-primary-600">${deal.raised.toLocaleString()} raised</span>
                  <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{pct}%</span>
                  <span>Goal: ${deal.target.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>

      <Card className="rounded-2xl border-none shadow-premium overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-bold text-gray-900 font-outfit uppercase tracking-tight">Transaction History</h2>
            <div className="flex gap-1.5 overflow-x-auto p-1 bg-white/50 rounded-xl border border-gray-100">
              {(['all', 'deposit', 'withdrawal', 'transfer', 'funding'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                    filter === f 
                      ? 'bg-primary-600 text-white shadow-md' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white'
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
                <tr className="border-b border-gray-100 bg-gray-50/30">
                  {['Description', 'Sender', 'Receiver', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
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
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-gray-100/80 ${txCfg.color} group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all`}>{txCfg.icon}</div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 truncate max-w-40">{tx.description}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{txCfg.label}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">{tx.sender}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">{tx.receiver}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-extrabold ${isIn ? 'text-green-600' : 'text-red-500'}`}>
                            {isIn ? '+' : '-'}${tx.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={stCfg.variant} size="sm" className="font-bold tracking-tight px-2.5 py-0.5 shadow-sm">
                            <span className="flex items-center gap-1.5">{stCfg.icon}{tx.status}</span>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-400 font-mono tracking-tighter">{displayDate}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-50 rounded-3xl">
                          <Clock size={48} className="text-gray-200" />
                        </div>
                        <p className="font-bold text-gray-400 tracking-tight">No transactions found in this category</p>
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