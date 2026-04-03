import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const propertyId = searchParams.get('property');

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(6);
  const [loading, setLoading] = useState(true);

  const investmentPeriods: InvestmentPeriod[] = [
    { months: 6, label: '6 months', roi: 9.25 },
    { months: 12, label: '1 Year', roi: 18.5 },
    { months: 24, label: '2 Years', roi: 37 },
    { months: 60, label: '5 Years', roi: 92.5 }
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoiForPeriod = (period: number): number => {
    const periodData = investmentPeriods.find(p => p.months === period);
    return periodData ? periodData.roi : 9.25;
  };

  const handleInvest = (property: Property) => {
    navigate('/checkout', {
      state: {
        propertyId: property.id,
        title: property.title,
        image: property.image,
        address: property.address,
        shareCost: property.shareCost,
        period: selectedPeriod,
        roi: getRoiForPeriod(selectedPeriod)
      }
    });
  };

  return (
    <main className="main">
      <Breadcrumb title="Investment Packages" currentPage="Investment Packages" />

      <section className="property-listing py-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="col-md-12">
                <div className="property-sort">
                  <h5>Showing 1-{Math.min(10, properties.length)} of {properties.length} Results</h5>
                  <div className="col-md-3 property-sort-box">
                    <select 
                      className="form-select"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                    >
                      <option value={6}>₦5,000 to ₦100,000</option>
                      <option value={12}>₦100,000 to ₦1,000,000</option>
                      <option value={24}>₦1,000,000 to ₦10,000,000</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row listing-list">
                {loading ? (
                  <div className="col-12 text-center">Loading packages...</div>
                ) : properties.length === 0 ? (
                  <div className="col-12 text-center">No packages available</div>
                ) : (
                  properties.map((property) => (
                    <div key={property.id} className="col-md-6 col-lg-12">
                      <PackageCard
                        property={property}
                        selectedPeriod={selectedPeriod}
                        roi={getRoiForPeriod(selectedPeriod)}
                        onInvest={() => handleInvest(property)}
                        investmentPeriods={investmentPeriods}
                        onPeriodChange={setSelectedPeriod}
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="pagination-area">
                <nav aria-label="Page navigation">
                  <ul className="pagination">
                    <li className="page-item">
                      <button className="page-link" disabled>
                        <i className="far fa-angle-double-left"></i>
                      </button>
                    </li>
                    <li className="page-item active">
                      <button className="page-link">1</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link">2</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link">3</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link">
                        <i className="far fa-angle-double-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Packages;
