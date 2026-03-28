import React, { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, TrendingUp, Users, Calendar, Plus, X, Briefcase, BarChart3, Clock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { deals, addDeal, getDeals } from '../../data/deals';
import { Deal } from '../../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const DealsPage: React.FC = () => {
  const [allDeals, setAllDeals] = useState<Deal[]>(deals);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const [newDealForm, setNewDealForm] = useState({
    startupName: '',
    industry: '',
    amount: '',
    equity: '',
    status: 'Negotiation',
    stage: 'Seed'
  });

  useEffect(() => {
    setAllDeals([...getDeals()]);
  }, [isAddModalOpen]);

  const statuses = ['Due Diligence', 'Term Sheet', 'Negotiation', 'Closed', 'Passed'];

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const filteredDeals = allDeals.filter(deal => {
    const matchesSearch = searchQuery === '' ||
      deal.startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.startup.industry.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus.length === 0 ||
      selectedStatus.includes(deal.status);

    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalInvestment: allDeals.reduce((sum, d) => {
      const amountStr = d.amount || '0';
      const val = parseFloat(amountStr.replace('$', '').replace('M', '').replace('K', '').replace('TBD', '0')) * (amountStr.includes('M') ? 1000000 : amountStr.includes('K') ? 1000 : 1);
      return sum + (isNaN(val) ? 0 : val);
    }, 0),
    activeCount: allDeals.filter(d => d.status !== 'Closed' && d.status !== 'Passed').length,
    portfolioCount: allDeals.filter(d => d.status === 'Closed').length + 12,
    closedThisMonth: allDeals.filter(d => d.status === 'Closed').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Due Diligence': return 'primary';
      case 'Term Sheet': return 'secondary';
      case 'Negotiation': return 'accent';
      case 'Closed': return 'success';
      case 'Passed': return 'error';
      default: return 'gray';
    }
  };

  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const deal: Deal = {
      id: Date.now(),
      startup: {
        name: newDealForm.startupName,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(newDealForm.startupName)}&background=random`,
        industry: newDealForm.industry
      },
      amount: newDealForm.amount,
      equity: newDealForm.equity,
      status: newDealForm.status,
      stage: newDealForm.stage,
      lastActivity: new Date().toISOString().split('T')[0]
    };
    addDeal(deal);
    setIsAddModalOpen(false);
    setNewDealForm({ startupName: '', industry: '', amount: '', equity: '', status: 'Negotiation', stage: 'Seed' });
  };

  const openDetails = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Investment Deals</h1>
          <p className="text-gray-500 font-medium">Track and manage your private equity pipeline</p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus size={18} />} className="shadow-blue rounded-xl px-6">
          Add Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Pipeline', val: `$${(stats.totalInvestment / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'primary' },
          { label: 'In Pipeline', val: stats.activeCount, icon: TrendingUp, color: 'secondary' },
          { label: 'Portfolio', val: stats.portfolioCount, icon: Users, color: 'accent' },
          { label: 'Closed (MTD)', val: stats.closedThisMonth, icon: Calendar, color: 'success' }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardBody className="flex items-center p-5">
              <div className={`p-4 bg-${stat.color}-100 rounded-2xl mr-4`}>
                <stat.icon size={24} className={`text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 leading-tight">{stat.val}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search deals by startup name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search size={18} />}
            inputClassName="rounded-xl border-none shadow-premium h-12"
            fullWidth
          />
        </div>

        <div className="w-full md:w-1/3">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-gray-400 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {statuses.map(status => (
                <Badge
                  key={status}
                  variant={selectedStatus.includes(status) ? getStatusColor(status) : 'gray'}
                  className={`cursor-pointer px-3 py-1 font-bold ${selectedStatus.includes(status) ? 'shadow-sm ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
                  onClick={() => toggleStatus(status)}
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-premium rounded-3xl overflow-hidden">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Startup</th>
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Equity</th>
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Stage</th>
                  <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDeals.map(deal => (
                  <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <Avatar src={deal.startup.logo} alt={deal.startup.name} size="md" className="ring-2 ring-white shadow-sm" />
                        <div>
                          <div className="text-sm font-bold text-gray-900">{deal.startup.name}</div>
                          <div className="text-[10px] font-black text-primary-500 uppercase tracking-tighter">{deal.startup.industry}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-gray-900">{deal.amount}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-medium text-gray-600">{deal.equity}</div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant={getStatusColor(deal.status)} className="shadow-sm font-bold px-3 py-1">
                        {deal.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-semibold text-gray-700">{deal.stage}</div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Button variant="outline" size="sm" onClick={() => openDetails(deal)} className="font-bold border-gray-200 hover:bg-white hover:border-primary-500 hover:text-primary-600">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Investment Deal">
        <form onSubmit={handleAddDeal} className="space-y-4">
          <Input
            label="Startup Name"
            value={newDealForm.startupName}
            onChange={e => setNewDealForm(p => ({ ...p, startupName: e.target.value }))}
            required
            fullWidth
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Industry"
              value={newDealForm.industry}
              onChange={e => setNewDealForm(p => ({ ...p, industry: e.target.value }))}
              required
            />
            <Input
              label="Investment Stage"
              value={newDealForm.stage}
              onChange={e => setNewDealForm(p => ({ ...p, stage: e.target.value }))}
              placeholder="e.g. Seed, Series A"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              value={newDealForm.amount}
              onChange={e => setNewDealForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="e.g. $1.5M"
              required
            />
            <Input
              label="Equity Offered"
              value={newDealForm.equity}
              onChange={e => setNewDealForm(p => ({ ...p, equity: e.target.value }))}
              placeholder="e.g. 10%"
              required
            />
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-50">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="mr-3">Cancel</Button>
            <Button type="submit" className="shadow-blue px-8">Create Deal</Button>
          </div>
        </form>
      </Modal>

      {}
      {selectedDeal && (
        <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Deal Specifications">
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl">
              <Avatar src={selectedDeal.startup.logo} alt={selectedDeal.startup.name} size="xl" className="shadow-lg" />
              <div>
                <h3 className="text-2xl font-black text-gray-900">{selectedDeal.startup.name}</h3>
                <Badge variant="primary" className="mt-1 font-bold">{selectedDeal.startup.industry}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Briefcase size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Investment</span>
                </div>
                <p className="text-xl font-black text-gray-900">{selectedDeal.amount}</p>
                <p className="text-xs text-gray-500 font-medium">{selectedDeal.equity} Equity</p>
              </div>

              <div className="p-4 border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <BarChart3 size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Current Status</span>
                </div>
                <Badge variant={getStatusColor(selectedDeal.status)} className="font-bold">{selectedDeal.status}</Badge>
                <p className="text-xs text-gray-500 mt-1 font-medium">{selectedDeal.stage} Round</p>
              </div>
            </div>

            <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
              <div className="flex items-center gap-2 text-primary-600 mb-2">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Last Activity</span>
              </div>
              <p className="text-sm font-bold text-primary-900">
                Document package updated on {new Date(selectedDeal.lastActivity).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={() => setIsDetailsModalOpen(false)} className="rounded-xl px-10 shadow-blue">Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};