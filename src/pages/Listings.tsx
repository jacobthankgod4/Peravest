import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components_main/Layout';
import DashboardLayout from '../components/layout/DashboardLayout';
import styles from './Listings.module.css';
import '../styles/listing-mobile.css';

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

const Listings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchTerm, properties]);

  const fetchProperties = async () => {
    try {
      // Get all properties with investment packages
      let { data: propertyData, error: propertyError } = await supabase
        .from('property')
        .select(`
          *,
          investment_package(*)
        `)
        .ilike('Status', 'active');

      // If no active properties, get all properties
      if (!propertyData || propertyData.length === 0) {
        console.log('No active properties, fetching all properties...');
        const result = await supabase
          .from('property')
          .select(`
            *,
            investment_package(*)
          `);
        propertyData = result.data;
        propertyError = result.error;
      }

      if (propertyError) {
        console.error('Property fetch error:', propertyError);
        throw propertyError;
      }

      console.log('Fetched properties:', propertyData);

      if (!propertyData || propertyData.length === 0) {
        setProperties([]);
        return;
      }

      // Get investment counts for each property
      const propertyIds = propertyData.map(p => p.Id);
      const { data: investmentData, error: investmentError } = await supabase
        .from('investment')
        .select('property_id')
        .in('property_id', propertyIds);

      if (investmentError) {
        console.error('Investment fetch error:', investmentError);
      }

      // Count investors per property
      const investorCounts: Record<string, number> = {};
      (investmentData || []).forEach(inv => {
        investorCounts[inv.property_id] = (investorCounts[inv.property_id] || 0) + 1;
      });

      const mapped = propertyData.map((p: any) => {
        const pkg = Array.isArray(p.investment_package) ? p.investment_package[0] : p.investment_package;
        
        const shareCost = Number(pkg?.Share_Cost) || 0;
        const interestRate = Number(pkg?.Interest_Rate) || 0;
        const maxInvestors = Number(pkg?.Max_Investors) || 100;
        
        const investorCount = investorCounts[p.Id] || 0;
        const fundingPercent = maxInvestors > 0 ? Math.round((investorCount / maxInvestors) * 100) : 0;
        const raisedAmount = investorCount * shareCost;
        
        let imageUrl = p.Images || 'default.jpg';
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/includes/admin/')) {
          imageUrl = `/includes/admin/${imageUrl}`;
        }

        return {
          id: p.Id,
          title: p.Title,
          address: p.Address,
          image: imageUrl,
          shareCost: shareCost,
          interest: interestRate,
          percent: fundingPercent,
          investors: investorCount,
          raised: raisedAmount
        };
      });

      console.log('Mapped properties:', mapped);
      setProperties(mapped);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    const filtered = properties.filter(property =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProperties(filtered);
    setCurrentPage(1);
  };

  const handleInvestClick = (propertyId: string) => {
    navigate(`/listings/${propertyId}`);
  };

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  const content = (
    <main className={styles.listingsPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Investment Properties</h1>
          <p className={styles.subtitle}>Discover premium real estate investment opportunities</p>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.resultsInfo}>
            <h5>Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProperties.length)} of {filteredProperties.length} Properties</h5>
          </div>

          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <i className="fas fa-search"></i>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <i className={`fas fa-spinner fa-spin ${styles.spinner}`}></i>
          </div>
        ) : paginatedProperties.length === 0 ? (
          <div className={styles.emptyState}>
            <i className={`fas fa-inbox ${styles.emptyIcon}`}></i>
            <div>No properties found</div>
          </div>
        ) : (
          <>
            <div className={styles.propertiesGrid}>
              {paginatedProperties.map((property, idx) => (
                <div key={property.id} className={styles.propertyCard} style={{ animationDelay: `${0.1 * (idx + 1)}s` }}>
                  <div className={styles.cardImage}>
                    <img src={property.image} alt={property.title} />
                    <div className={styles.progressOverlay}>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${property.percent}%` }}></div>
                      </div>
                      <span className={styles.progressText}>{property.percent}% Funded</span>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <h3 className={styles.propertyTitle}>{property.title}</h3>
                    <p className={styles.propertyAddress}>
                      <i className="fas fa-map-marker-alt"></i> {property.address}
                    </p>

                    <div className={styles.statsRow}>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Share Cost</span>
                        <span className={styles.statValue}>₦{property.shareCost.toLocaleString()}</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Interest</span>
                        <span className={styles.statValue}>{property.interest}% p.a</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Investors</span>
                        <span className={styles.statValue}>{property.investors}</span>
                      </div>
                    </div>

                    <div className={styles.raisedInfo}>
                      <span className={styles.raisedLabel}>Amount Raised</span>
                      <span className={styles.raisedValue}>₦{property.raised.toLocaleString()}</span>
                    </div>

                    <button 
                      onClick={() => handleInvestClick(property.id)}
                      className={styles.investBtn}
                    >
                      <i className="fas fa-arrow-right"></i> View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <nav>
                  <ul className={styles.paginationList}>
                    <li className={currentPage === 1 ? styles.disabled : ''}>
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        <i className="far fa-angle-double-left"></i>
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <li key={page} className={currentPage === page ? styles.active : ''}>
                        <button onClick={() => setCurrentPage(page)}>
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={currentPage === totalPages ? styles.disabled : ''}>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="far fa-angle-double-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );

  return user ? (
    <DashboardLayout title="Properties">{content}</DashboardLayout>
  ) : (
    <Layout title="Properties - Peravest">
      <main className="main">{content}</main>
    </Layout>
  );
};

export default Listings;
