import React, { useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { investors } from '../../data/users';

export const InvestorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const LOCATIONS = ['San Francisco, CA', 'New York, NY', 'Boston, MA', 'London, UK', 'Austin, TX'];

  const allStages = Array.from(new Set(investors.flatMap(i => i.investmentStage)));
  const allInterests = Array.from(new Set(investors.flatMap(i => i.investmentInterests)));

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = searchQuery === '' ||
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.investmentInterests.some(interest =>
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStages = selectedStages.length === 0 ||
      investor.investmentStage.some(stage => selectedStages.includes(stage));

    const matchesInterests = selectedInterests.length === 0 ||
      investor.investmentInterests.some(interest => selectedInterests.includes(interest));

    const matchesLocation = selectedLocations.length === 0 ||
      selectedLocations.some(loc => investor.bio.includes(loc.split(',')[0]));

    return matchesSearch && matchesStages && matchesInterests && matchesLocation;
  });

  const toggleStage = (stage: string) => {
    setSelectedStages(prev =>
      prev.includes(stage)
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations(prev =>
      prev.includes(loc)
        ? prev.filter(l => l !== loc)
        : [...prev, loc]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Investors</h1>
        <p className="text-gray-600">Connect with investors who match your startup's needs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Investment Stage</h3>
                <div className="space-y-2">
                  {allStages.map(stage => (
                    <button
                      key={stage}
                      onClick={() => toggleStage(stage)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedStages.includes(stage)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Investment Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {allInterests.map(interest => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? 'primary' : 'gray'}
                      className="cursor-pointer"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Location</h3>
                <div className="space-y-1">
                  {LOCATIONS.map(loc => (
                    <button
                      key={loc}
                      onClick={() => toggleLocation(loc)}
                      className={`flex items-center w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        selectedLocations.includes(loc)
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <MapPin size={14} className={`mr-2 transition-colors ${selectedLocations.includes(loc) ? 'text-primary-500' : 'text-gray-400'}`} />
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search investors by name, interests, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              inputClassName="h-11"
              fullWidth
            />

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredInvestors.length} results
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInvestors.map((investor, idx) => (
              <div key={investor.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                <InvestorCard
                  investor={investor}
                />
              </div>
            ))}
            {filteredInvestors.length === 0 && (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Search size={40} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No investors found</h3>
                <p className="text-gray-500 mt-1">Try broadening your search or adjusting the filters.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {setSearchQuery(''); setSelectedStages([]); setSelectedInterests([]); setSelectedLocations([]);}}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};