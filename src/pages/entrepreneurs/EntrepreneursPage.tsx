import React, { useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { entrepreneurs } from '../../data/users';

export const EntrepreneursPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedFundingRange, setSelectedFundingRange] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  // Get unique industries, funding ranges, and locations
  const allIndustries = Array.from(new Set(entrepreneurs.map(e => e.industry)));
  const LOCATIONS = ['San Francisco, CA', 'New York, NY', 'Boston, MA', 'London, UK', 'Austin, TX'];
  const fundingRanges = ['< $500K', '$500K - $1M', '$1M - $5M', '> $5M'];
  
  // Filter entrepreneurs based on search and filters
  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur => {
    const matchesSearch = searchQuery === '' || 
      entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.pitchSummary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = selectedIndustries.length === 0 ||
      selectedIndustries.includes(entrepreneur.industry);
    
    // Simple funding range filter based on the amount string
    const matchesFunding = selectedFundingRange.length === 0 || 
      selectedFundingRange.some(range => {
        const amount = parseInt(entrepreneur.fundingNeeded.replace(/[^0-9]/g, ''));
        switch (range) {
          case '< $500K': return amount < 500;
          case '$500K - $1M': return amount >= 500 && amount <= 1000;
          case '$1M - $5M': return amount > 1000 && amount <= 5000;
          case '> $5M': return amount > 5000;
          default: return true;
        }
      });
    
    // Simulate location matching (in a real app, this would be a field on the object)
    const matchesLocation = selectedLocations.length === 0 || 
      selectedLocations.some(loc => entrepreneur.pitchSummary.includes(loc.split(',')[0]));
    
    return matchesSearch && matchesIndustry && matchesFunding && matchesLocation;
  });
  
  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };
  
  const toggleFundingRange = (range: string) => {
    setSelectedFundingRange(prev => 
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations(prev => 
      prev.includes(loc)
        ? prev.filter(l => l !== loc)
        : [...prev, loc]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedIndustries([]);
    setSelectedFundingRange([]);
    setSelectedLocations([]);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Startups</h1>
        <p className="text-gray-600">Discover promising startups looking for investment</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Industry</h3>
                <div className="space-y-2">
                  {allIndustries.map(industry => (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedIndustries.includes(industry)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Funding Range</h3>
                <div className="space-y-2">
                  {fundingRanges.map(range => (
                    <button
                      key={range}
                      onClick={() => toggleFundingRange(range)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedFundingRange.includes(range)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {range}
                    </button>
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
                      <MapPin size={14} className={`mr-2 ${selectedLocations.includes(loc) ? 'text-primary-500' : 'text-gray-400'}`} />
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search startups by name, industry, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              inputClassName="h-11"
              fullWidth
            />
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredEntrepreneurs.length} results
              </span>
              {(searchQuery || selectedIndustries.length > 0 || selectedFundingRange.length > 0 || selectedLocations.length > 0) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                  Clear all
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEntrepreneurs.length > 0 ? (
              filteredEntrepreneurs.map(entrepreneur => (
                <EntrepreneurCard
                  key={entrepreneur.id}
                  entrepreneur={entrepreneur}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Search size={40} className="mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No startups found</h3>
                <p className="text-gray-500 mt-1">Try broadening your search or adjusting the filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};