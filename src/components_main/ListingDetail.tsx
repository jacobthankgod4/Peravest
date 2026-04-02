import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Breadcrumb from './Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';

interface PropertyDetail {
  Id: string;
  Title: string;
  Description: string;
  Address: string;
  Images: string[];
  Share_Cost: number;
  Interest_Rate: number;
  Total_Shares: number;
  Status: string;
}

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState({ investors: 0, raised: 0, percentage: 0 });

  useEffect(() => {
    if (id) {
      fetchPropertyDetail();
      fetchPropertyStats();
    }
  }, [id]);

  const fetchPropertyDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('property')
        .select('*')
        .eq('Id', id)
        .single();

      if (error) throw error;
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyStats = async () => {
    try {
      const { data, error } = await supabase
        .from('invest_now')
        .select('share_cost, Usa_Id')
        .eq('proptee_id', id);

      if (error) throw error;

      const totalRaised = data?.reduce((sum, inv) => sum + Number(inv.share_cost), 0) || 0;
      const uniqueInvestors = new Set(data?.map(inv => inv.Usa_Id)).size;
      const targetAmount = 10000000;
      const percentage = Math.min((totalRaised / targetAmount) * 100, 100);

      setStats({
        investors: uniqueInvestors,
        raised: totalRaised,
        percentage: Math.round(percentage)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInvest = () => {
    navigate(`/packages?property=${id}`);
  };

  const nextImage = () => {
    if (property?.Images) {
      setCurrentImageIndex((prev) => (prev + 1) % property.Images.length);
    }
  };

  const prevImage = () => {
    if (property?.Images) {
      setCurrentImageIndex((prev) => (prev - 1 + property.Images.length) % property.Images.length);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!property) {
    return (
      <main className="main">
        <div className="container py-5 text-center">
          <h2>Property not found</h2>
          <button onClick={() => navigate('/listings')} className="theme-btn mt-3">
            Back to Listings
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <Breadcrumb 
        title={property.Title} 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Listings', href: '/listings' },
          { label: property.Title, active: true }
        ]} 
      />

      <section className="property-single py-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* Image Carousel */}
              <div className="property-single-gallery" style={{ position: 'relative', marginBottom: '2rem' }}>
                {property.Images && property.Images.length > 0 ? (
                  <>
                    <img 
                      src={`/includes/admin/${property.Images[currentImageIndex]}`}
                      alt={property.Title}
                      style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '15px' }}
                    />
                    {property.Images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          style={{
                            position: 'absolute',
                            left: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.5)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            cursor: 'pointer',
                            fontSize: '1.5rem'
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={nextImage}
                          style={{
                            position: 'absolute',
                            right: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.5)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            cursor: 'pointer',
                            fontSize: '1.5rem'
                          }}
                        >
                          ›
                        </button>
                        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px' }}>
                          {property.Images.map((_, index) => (
                            <div
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: index === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer'
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ width: '100%', height: '500px', background: '#f0f0f0', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>No images available</span>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="property-single-content">
                <h2 className="property-single-title">{property.Title}</h2>
                <p className="property-single-location">
                  <i className="far fa-location-dot"></i> {property.Address}
                </p>

                <div className="property-single-description" style={{ marginTop: '2rem' }}>
                  <h4>Description</h4>
                  <p>{property.Description || 'No description available.'}</p>
                </div>

                {/* Investment Stats */}
                <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '15px', marginTop: '2rem' }}>
                  <h4 style={{ marginBottom: '1.5rem' }}>Investment Progress</h4>
                  <div className="progress" style={{ height: '30px', marginBottom: '1rem' }}>
                    <div 
                      className="progress-bar" 
                      style={{ width: `${stats.percentage}%`, background: '#09c398' }}
                    >
                      {stats.percentage}%
                    </div>
                  </div>
                  <div className="row text-center">
                    <div className="col-4">
                      <h5 style={{ color: '#09c398', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.investors}</h5>
                      <p style={{ color: '#757f95', margin: 0 }}>Investors</p>
                    </div>
                    <div className="col-4">
                      <h5 style={{ color: '#09c398', fontSize: '1.5rem', fontWeight: 'bold' }}>₦{stats.raised.toLocaleString()}</h5>
                      <p style={{ color: '#757f95', margin: 0 }}>Raised</p>
                    </div>
                    <div className="col-4">
                      <h5 style={{ color: '#09c398', fontSize: '1.5rem', fontWeight: 'bold' }}>{property.Interest_Rate}%</h5>
                      <p style={{ color: '#757f95', margin: 0 }}>Interest p.a.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <div className="property-sidebar" style={{ position: 'sticky', top: '100px' }}>
                {/* Investment Card */}
                <div style={{ background: 'linear-gradient(135deg, #09c398 0%, #08a57d 100%)', padding: '2rem', borderRadius: '15px', color: '#fff', marginBottom: '2rem' }}>
                  <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Investment Details</h4>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.875rem' }}>Share Cost</p>
                    <h3 style={{ color: '#fff', margin: '0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>₦{Number(property.Share_Cost).toLocaleString()}</h3>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.875rem' }}>Expected Returns</p>
                    <h4 style={{ color: '#fff', margin: '0.5rem 0' }}>{property.Interest_Rate}% per annum</h4>
                  </div>
                  <button 
                    onClick={handleInvest}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: '#fff',
                      color: '#09c398',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    Invest Now <i className="far fa-arrow-right"></i>
                  </button>
                </div>

                {/* Key Features */}
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
                  <h4 style={{ marginBottom: '1.5rem' }}>Key Features</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                      <i className="fas fa-check-circle" style={{ color: '#09c398', marginRight: '0.75rem', fontSize: '1.25rem' }}></i>
                      <span>Verified Property</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                      <i className="fas fa-check-circle" style={{ color: '#09c398', marginRight: '0.75rem', fontSize: '1.25rem' }}></i>
                      <span>Secure Investment</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                      <i className="fas fa-check-circle" style={{ color: '#09c398', marginRight: '0.75rem', fontSize: '1.25rem' }}></i>
                      <span>Guaranteed Returns</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <i className="fas fa-check-circle" style={{ color: '#09c398', marginRight: '0.75rem', fontSize: '1.25rem' }}></i>
                      <span>Professional Management</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ListingDetail;
