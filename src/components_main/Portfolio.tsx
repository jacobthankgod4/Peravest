import React, { useState, useEffect } from 'react';
import { useInvestment } from '../contexts/InvestmentContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Portfolio: React.FC = () => {
  const { investments, stats, loading, getInvestments } = useInvestment();

  useEffect(() => {
    getInvestments();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your investments..." />;
  }

  return (
    <main className="main">
      <div className="mt001">
        <hr />
        <div className="container">
          <span className="site-title-tagline" style={{color:'#0e2e50', fontSize:'12px'}}>My Balance</span>
          <h2 className="site-title" style={{fontSize:'42px'}}>₦{stats.totalInvestments.toLocaleString('en-NG', {minimumFractionDigits: 2})}</h2>
        </div>
      </div>

      <div className="user-profile pagin">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="user-profile-wrapper">
                <div className="row pagin">
                  <div className="col-lg-12">
                    <div className="user-profile-card">
                      <h4 className="user-profile-card-title">My Investments</h4>
                      <div className="">
                        {investments.length === 0 ? (
                          <p className="text-center text-muted py-4">No investments yet. <a href="/listings">Start investing</a></p>
                        ) : (
                          investments.map((investment: any) => (
                            <div key={investment.Id_invest} className="row property-single-content mt-1 mb-4 p-0" style={{background:'#0e2e50'}}>
                              <div className="col-md-4 p-2">
                                <div className="image-container">
                                  {investment.property?.[0]?.Images?.[0] && (
                                    <img src={`/includes/admin/${investment.property[0].Images[0]}`} className="imago1 fixed-image" alt="Property" />
                                  )}
                                </div>
                                <div className="property-single-description">
                                  <h6 className="text-white p-2">
                                    {investment.property?.[0]?.Title || 'Property'}
                                  </h6>
                                </div>
                              </div>
                              <div className="col-md-8">
                                <div className="row">
                                  <div className="col-4">
                                    <h6 className="text-white text-center p-1">Investment Amount</h6>
                                    <div className="theme-btn wt001" style={{background:'#cfe2ff', color:'#000'}}>₦{Number(investment.share_cost).toLocaleString()}</div>
                                  </div>
                                  <div className="col-4">
                                    <h6 className="text-white text-center p-1">Interest Rate</h6>
                                    <div className="theme-btn wt001" style={{background:'#cfe2ff', color:'#000'}}>{investment.interest}% p.a</div>
                                  </div>
                                  <div className="col-4">
                                    <h6 className="text-white text-center p-1">Period</h6>
                                    <div className="theme-btn wt001" style={{background:'#cfe2ff', color:'#000'}}>{investment.period} months</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Portfolio;