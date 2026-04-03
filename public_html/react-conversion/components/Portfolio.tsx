import React, { useState, useEffect } from 'react';
import { investmentService } from '../services/investmentService';

interface PortfolioStats {
  totalValue: number;
  totalReturns: number;
  activeInvestments: number;
  completedInvestments: number;
}

interface Investment {
  id: number;
  amount: number;
  shares: number;
  expectedReturn: number;
  currentReturn: number;
  status: string;
  progress: number;
  property: { title: string; };
  package: { interestRate: number; periodMonths: number; };
  startDate: string;
  maturityDate: string;
}

const Portfolio: React.FC = () => {
  const [stats, setStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalReturns: 0,
    activeInvestments: 0,
    completedInvestments: 0
  });
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      const [statsResponse, investmentsResponse] = await Promise.all([
        investmentService.getUserStats(),
        investmentService.getUserInvestments()
      ]);
      
      setStats(statsResponse);
      setInvestments(investmentsResponse.data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="container py-4">
      <h2>Portfolio Management</h2>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-primary">₦{stats.totalValue.toLocaleString()}</h5>
              <p>Total Value</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-success">₦{stats.totalReturns.toLocaleString()}</h5>
              <p>Total Returns</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-info">{stats.activeInvestments}</h5>
              <p>Active</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="text-secondary">{stats.completedInvestments}</h5>
              <p>Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5>Investment Details</h5>
        </div>
        <div className="card-body">
          {investments.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Amount</th>
                    <th>Expected Return</th>
                    <th>Current Return</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Maturity</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map(investment => (
                    <tr key={investment.id}>
                      <td>{investment.property.title}</td>
                      <td>₦{investment.amount.toLocaleString()}</td>
                      <td>₦{investment.expectedReturn.toLocaleString()}</td>
                      <td>₦{investment.currentReturn.toLocaleString()}</td>
                      <td>
                        <div className="progress">
                          <div 
                            className="progress-bar" 
                            style={{width: `${investment.progress}%`}}
                          ></div>
                        </div>
                        <small>{investment.progress}%</small>
                      </td>
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
            <p className="text-muted">No investments found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;