import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Breadcrumb from './Breadcrumb';
import PackageCard from './PackageCard';

interface Property {
  id: string;
  title: string;
  address: string;
  image: string;
  shareCost: number;
  interest: number;
  percent: number;
  investors: number;
  raised: number;
}

interface InvestmentPeriod {
  months: number;
  label: string;
  roi: number;
}

const Packages: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriods, setSelectedPeriods] = useState<{ [key: string]: number }>({});

  const investmentPeriods: InvestmentPeriod[] = [
    { months: 3, label: '3 Months', roi: 9.25 },
    { months: 6, label: '6 Months', roi: 18.5 },
    { months: 9, label: '9 Months', roi: 27.75 },
    { months: 12, label: '12 Months', roi: 37 }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('property')
        .select('*')
        .eq('Status', 'active');

      if (error) throw error;
      
      const mapped = (data || []).map((p: any) => ({
        id: p.Id,
        title: p.Title,
        address: p.Address,
        image: p.Images || 'default.jpg',
        shareCost: 5000,
        interest: 25,
        percent: Math.round(Math.random() * 100),
        investors: Math.floor(Math.random() * 200),
        raised: Math.floor(Math.random() * 1000000)
      }));
      
      setProperties(mapped);
      const initialPeriods: { [key: string]: number } = {};
      mapped.forEach(p => {
        initialPeriods[p.id] = 3;
      });
      setSelectedPeriods(initialPeriods);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (propertyId: string, period: number) => {
    setSelectedPeriods(prev => ({ ...prev, [propertyId]: period }));
  };

  const handleInvest = (propertyId: string) => {
    navigate(`/invest/${propertyId}`);
  };

  const getRoi = (propertyId: string) => {
    const period = selectedPeriods[propertyId] || 3;
    const periodData = investmentPeriods.find(p => p.months === period);
    return periodData ? periodData.roi : 9.25;
  };

  return (
    <main className="main">
      <Breadcrumb title="Investment Packages" currentPage="Packages" />

      <section className="property-listing py-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-heading text-center mb-5">
                <h2>Choose Your Investment Package</h2>
                <p>Select your preferred investment period and start earning returns</p>
              </div>

              <div className="row listing-list">
                {loading ? (
                  <div className="col-12 text-center">Loading packages...</div>
                ) : properties.length === 0 ? (
                  <div className="col-12 text-center">No packages available</div>
                ) : (
                  properties.map((property) => (
                    <div key={property.id} className="col-md-12">
                      <PackageCard
                        property={property}
                        selectedPeriod={selectedPeriods[property.id] || 3}
                        roi={getRoi(property.id)}
                        onInvest={() => handleInvest(property.id)}
                        investmentPeriods={investmentPeriods}
                        onPeriodChange={(period) => handlePeriodChange(property.id, period)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Packages;
