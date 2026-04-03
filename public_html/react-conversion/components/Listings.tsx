import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import ListingCard from './ListingCard';

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

interface ListingsProps {}

const Listings: React.FC<ListingsProps> = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [searchTerm, properties]);

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

  const filterProperties = () => {
    const filtered = properties.filter(property =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProperties(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInvestClick = (propertyId: string) => {
    navigate(`/packages?property=${propertyId}`);
  };

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  return (
    <main className="main">
      <Breadcrumb title="Properties" currentPage="Properties" />

      <section className="property-listing py-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="col-md-12">
                <div className="property-sort">
                  <h5>
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProperties.length)} 
                    of {filteredProperties.length} Results
                  </h5>
                  <div className="col-md-3 d-flex sach">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search listing here..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                    <button type="submit" className="btn btn-outline-success">
                      <span className="far fa-search"></span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="row listing-list">
                {loading ? (
                  <div className="col-12 text-center">Loading properties...</div>
                ) : paginatedProperties.length === 0 ? (
                  <div className="col-12 text-center">No properties found</div>
                ) : (
                  paginatedProperties.map((property) => (
                    <div key={property.id} className="col-md-6 col-lg-12">
                      <ListingCard 
                        property={property}
                        onInvest={() => handleInvestClick(property.id)}
                      />
                    </div>
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="pagination-area">
                  <nav aria-label="Page navigation">
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        >
                          <i className="far fa-angle-double-left"></i>
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
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
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Listings;
