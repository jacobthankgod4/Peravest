import React, { useState, useEffect } from 'react';
import { investmentService } from '../services/investmentService';
import { propertyService } from '../services/propertyService';
import { PropertyWithInvestment } from '../types/property';
import Swal from 'sweetalert2';

interface Property {
  id: number;
  title: string;
  price: number;
  packages: PropertyPackage[];
}

interface PropertyPackage {
  id: number;
  shareCost: number;
  interestRate: number;
  periodMonths: number;
  maxInvestors: number;
  currentInvestors: number;
}

interface Investment {
  id: number;
  amount: number;
  shares: number;
  status: string;
  property: { title: string; };
  package: { interestRate: number; periodMonths: number; };
  startDate: string;
  maturityDate: string;
}

const Investment: React.FC = () => {
  const [properties, setProperties] = useState<PropertyWithInvestment[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [shares, setShares] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'invest' | 'portfolio'>('invest');

  useEffect(() => {
    loadProperties();
    loadInvestments();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertyService.getAll();
      setProperties(response);
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  const loadInvestments = async () => {
    try {
      const response = await investmentService.getUserInvestments();
      setInvestments(response.data);
    } catch (error) {
      console.error('Failed to load investments:', error);
    }
  };

  const handleInvest = async () => {
    if (!selectedProperty || !selectedPackage || shares < 1) {
      Swal.fire('Error!', 'Please select property, package and valid shares', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await investmentService.createInvestment({
        propertyId: selectedProperty,
        packageId: selectedPackage,
        shares,
        paymentMethod: 'card'
      });

      Swal.fire('Success!', 'Investment created successfully', 'success');
      loadInvestments();
      setSelectedProperty(null);
      setSelectedPackage(null);
      setShares(1);
    } catch (error) {
      Swal.fire('Error!', 'Failed to create investment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedPropertyData = properties.find(p => p.id === selectedProperty);
  const totalAmount = selectedPropertyData ? selectedPropertyData.shareCost * shares : 0;

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'invest' ? 'active' : ''}`}
                onClick={() => setActiveTab('invest')}
              >
                Participate in Projects
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'portfolio' ? 'active' : ''}`}
                onClick={() => setActiveTab('portfolio')}
              >
                My Participations
              </button>
            </li>
          </ul>
        </div>
      </div>

      {activeTab === 'invest' && (
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5>Available Cooperative Projects</h5>
              </div>
              <div className="card-body">
                {properties.map(property => (
                  <div key={property.id} className="card mb-3">
                    <div className="card-body">
                      <h6>{property.title}</h6>
                      <p className="text-muted">₦{property.price.toLocaleString()}</p>
                      
                      <div className="row">
                        <div className="col-12">
                          <div 
                            className={`card cursor-pointer ${selectedProperty === property.id ? 'border-primary' : ''}`}
                            onClick={() => {
                              setSelectedProperty(property.id);
                            }}
                          >
                            <div className="card-body p-3">
                              <small className="text-muted">Participation Unit Cost</small>
                              <h6>₦{property.shareCost.toLocaleString()}</h6>
                              <div className="d-flex justify-content-between">
                                <span>{property.interestRate}% Member Benefit Rate</span>
                                <span>Cooperative Property</span>
                              </div>
                              <div className="progress mt-2">
                                <div 
                                  className="progress-bar" 
                                  style={{width: `${property.fundingPercent}%`}}
                                ></div>
                              </div>
                              <small>{property.investorCount} investors</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5>Participation Summary</h5>
              </div>
              <div className="card-body">
                {selectedPropertyData ? (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Number of Participation Units</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={shares}
                        onChange={(e) => setShares(Number(e.target.value))}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <strong>Total Participation Amount: ₦{totalAmount.toLocaleString()}</strong>
                    </div>
                    
                    <div className="mb-3">
                      <small className="text-muted">
                        Projected Member Benefit: ₦{(totalAmount * (1 + selectedPropertyData.interestRate / 100)).toLocaleString()}
                      </small>
                    </div>
                    
                    <button
                      className="btn btn-primary w-100"
                      onClick={handleInvest}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Participate Now'}
                    </button>
                  </>
                ) : (
                  <p className="text-muted">Select a cooperative project to continue</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5>My Cooperative Participations</h5>
              </div>
              <div className="card-body">
                {investments.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Property</th>
                          <th>Amount</th>
                          <th>Units</th>
                          <th>Member Benefit Rate</th>
                          <th>Period</th>
                          <th>Status</th>
                          <th>Benefit Distribution Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investments.map(investment => (
                          <tr key={investment.id}>
                            <td>{investment.property.title}</td>
                            <td>₦{investment.amount.toLocaleString()}</td>
                            <td>{investment.shares}</td>
                            <td>{investment.package.interestRate}%</td>
                            <td>{investment.package.periodMonths} months</td>
                            <td>
                              <span className={`badge bg-${investment.status === 'active' ? 'success' : 'warning'}`}>
                                {investment.status}
                              </span>
                            </td>
                            <td>{new Date(investment.maturityDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No participations found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investment;