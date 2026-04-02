import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { supabase } from '../lib/supabase';
import { InvestmentPackage } from '../types/package.types';
import Breadcrumb from './Breadcrumb';
import LoadingSpinner from '../components/LoadingSpinner';
import PropertyDocuments from '../components/PropertyDocuments';
import InvestmentPackageSelector from '../components/InvestmentPackageSelector';
import Layout from '../components_main/Layout';
import '../styles/listing-mobile.css';

interface PropertyDetail {
  Id: number;
  Title: string;
  Type: string;
  Description: string;
  Address: string;
  City: string;
  State: string;
  LGA?: string;
  Zip_Code: string;
  Price: number;
  Area: string;
  Bedroom: number;
  Bathroom: number;
  Built_Year: number;
  Ammenities: string;
  Video: string;
  Images: string;
  Status: string;
  Asset_Type?: string;
  Farm_Size_Hectares?: number;
  Crop_Type?: string;
  Harvest_Cycle_Months?: number;
  Expected_Yield?: string;
  Farming_Method?: string;
  Soil_Type?: string;
  Water_Source?: string;
  Farm_Equipment?: string;
  Insurance_Status?: string;
  Farm_Manager?: string;
}

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState({ investors: 0, raised: 0, percentage: 0 });
  const [packageData, setPackageData] = useState({ shareCost: 5000, interestRate: 25 });
  const [documents, setDocuments] = useState<Array<any>>([]);
  const [imageError, setImageError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      if (id && isMounted) {
        await fetchPropertyDetail();
        await fetchPropertyStats();
        await fetchInterestRate();
        await fetchDocuments();
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  const fetchPropertyDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('property')
        .select('*, property_image(*)')
        .eq('Id', id)
        .eq('is_deleted', false)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Property not found');

      // Get images from property_image table
      const imageUrls: string[] = [];
      if (data.property_image && Array.isArray(data.property_image) && data.property_image.length > 0) {
        imageUrls.push(...data.property_image.sort((a: any, b: any) => a.Display_Order - b.Display_Order).map((img: any) => img.Image_Url));
      } else if (data.Images) {
        imageUrls.push(data.Images);
      }

      setProperty({
        Id: data.Id,
        Title: data.Title,
        Type: data.Type,
        Description: data.Description,
        Address: data.Address,
        City: data.City,
        State: data.State,
        LGA: data.LGA,
        Zip_Code: data.Zip_Code,
        Price: data.Price,
        Area: data.Area?.toString() || '0',
        Bedroom: data.Bedroom,
        Bathroom: data.Bathroom,
        Built_Year: data.Built_Year,
        Ammenities: data.Amenities,
        Video: data.Video,
        Images: imageUrls.join(','),
        Status: data.Status,
        Asset_Type: data.Asset_Type || 'Real Estate',
        Farm_Size_Hectares: data.Farm_Size_Hectares,
        Crop_Type: data.Crop_Type,
        Harvest_Cycle_Months: data.Harvest_Cycle_Months,
        Expected_Yield: data.Expected_Yield,
        Farming_Method: data.Farming_Method,
        Soil_Type: data.Soil_Type,
        Water_Source: data.Water_Source,
        Farm_Equipment: data.Farm_Equipment,
        Insurance_Status: data.Insurance_Status,
        Farm_Manager: data.Farm_Manager
      });
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

  const fetchInterestRate = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_package')
        .select('Interest_Rate, Share_Cost')
        .eq('Property_Id', id)
        .limit(1);

      if (error) {
        console.error('Error fetching package data:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setPackageData({
          shareCost: Number(data[0]?.Share_Cost) || 5000,
          interestRate: Number(data[0]?.Interest_Rate) || 25
        });
      }
    } catch (error) {
      console.error('Error fetching package data:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data } = await supabase
        .from('property_documents')
        .select('*')
        .eq('Property_Id', id)
        .eq('Is_Public', true)
        .order('Display_Order');
      if (data) setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleInvest = (packageId: number, packageData: InvestmentPackage) => {
    const images = property.Images.split(',').filter(img => img.trim());
    navigate(`/invest/${id}`, { 
      state: { 
        packageId,
        packageName: packageData.package_name,
        duration: packageData.duration_months,
        roi: packageData.roi_percentage,
        minAmount: packageData.min_investment,
        maxAmount: packageData.max_investment,
        propertyTitle: property.Title,
        propertyImage: images[0] || '/assets/img/property/default.jpg',
        propertyAddress: property.Address
      } 
    });
  };

  const getImages = (): string[] => {
    if (!property?.Images) return [];
    if (typeof property.Images === 'string' && property.Images.trim()) {
      return property.Images.split(',').filter(url => url.trim());
    }
    return [];
  };

  const images = getImages();
  const displayImage = images.length > 0 ? images[currentImageIndex] : null;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 4000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [images.length]);

  console.log('[ListingDetail] Display image URL:', displayImage);

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleImageError = () => {
    console.error('[ListingDetail] Image failed to load:', displayImage);
    setImageError(true);
  };

  if (loading) {
    return <LoadingSpinner message="Loading property details..." />;
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
    <Layout title={property.Title}>
    <main className="main">
      <Breadcrumb 
        title={property.Title} 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Listings', href: '/listings' },
          { label: property.Title, active: true }
        ]} 
      />

      <section className="property-single py-80" style={{ background: '#f9f9f9', paddingTop: '120px' }}>
        <div className="container" style={{ maxWidth: '1400px' }}>
          <div className="row">
            <div className="col-lg-8">
              {/* Image Carousel */}
              {displayImage && !imageError && (
                <div className="property-single-gallery" style={{ position: 'relative', marginBottom: '2rem', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
                  <img 
                    src={displayImage}
                    alt={property.Title}
                    style={{ width: '100%', height: '550px', objectFit: 'cover', cursor: 'pointer' }}
                    onError={handleImageError}
                    onClick={() => setIsFullscreen(true)}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        style={{
                          position: 'absolute',
                          left: '20px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(14, 46, 80, 0.9)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '50px',
                          height: '50px',
                          zIndex: 2
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
                          background: 'rgba(14, 46, 80, 0.9)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '50px',
                          height: '50px',
                          cursor: 'pointer',
                          fontSize: '1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2
                        }}
                      >
                        ›
                      </button>
                      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 2 }}>
                        {images.map((_, index) => (
                          <div
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              background: index === currentImageIndex ? '#0e2e50' : 'rgba(255,255,255,0.5)',
                              cursor: 'pointer',
                              border: '2px solid #fff'
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => setIsFullscreen(true)}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: 'rgba(14, 46, 80, 0.9)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 15px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      zIndex: 2
                    }}
                  >
                    <i className="fas fa-expand"></i> Fullscreen
                  </button>
                </div>
              )}

              {/* Fullscreen Modal */}
              {isFullscreen && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 9000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => setIsFullscreen(false)}
                >
                  <button
                    onClick={() => setIsFullscreen(false)}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '50px',
                      height: '50px',
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      zIndex: 10000
                    }}
                  >
                    ×
                  </button>
                  <img
                    src={displayImage}
                    alt={property.Title}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      objectFit: 'contain'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        style={{
                          position: 'absolute',
                          left: '20px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '60px',
                          height: '60px',
                          cursor: 'pointer',
                          fontSize: '2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        style={{
                          position: 'absolute',
                          right: '20px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '60px',
                          height: '60px',
                          cursor: 'pointer',
                          fontSize: '2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>
              )}

              {imageError && (
                <div style={{ width: '100%', height: '600px', background: '#fff', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                  <div style={{ textAlign: 'center', color: '#757f95' }}>
                    <i className="fas fa-image" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#0e2e50' }}></i>
                    <p>Image not available</p>
                  </div>
                </div>
              )}

              {/* Property Details */}
              <div className="property-single-content" style={{ background: '#fff', padding: '2.5rem', borderRadius: '15px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 className="property-single-title" style={{ fontSize: '2rem', fontWeight: 700, color: '#0e2e50', margin: 0 }}>{property.Title}</h2>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ background: property.Asset_Type === 'Agriculture' ? 'linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%)' : 'linear-gradient(135deg, #0e2e50 0%, #1a3a5c 100%)', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '25px', fontSize: '0.875rem', fontWeight: 600 }}>
                      {property.Asset_Type === 'Agriculture' ? 'Agriculture' : 'Real Estate'}
                    </span>
                    <span style={{ background: 'linear-gradient(135deg, #0e2e50 0%, #1a3a5c 100%)', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '25px', fontSize: '0.875rem', fontWeight: 600 }}>
                      {property.Type}
                    </span>
                  </div>
                </div>

                <p className="property-single-location" style={{ fontSize: '1rem', color: '#666', marginBottom: '2rem' }}>
                  <i className="far fa-location-dot" style={{ color: '#0e2e50', marginRight: '8px' }}></i> {property.Address}, {property.City}, {property.LGA && `${property.LGA}, `}{property.State} {property.Zip_Code}
                </p>

                {/* Specs - Conditional based on Asset Type */}
                {property.Asset_Type === 'Real Estate' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem', padding: '2rem', background: 'linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%)', borderRadius: '15px' }}>
                    <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#fff', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '2px solid #f0f0f0' }}>
                      <i className="fas fa-bed" style={{ fontSize: '1.8rem', color: '#0e2e50', marginBottom: '0.75rem' }}></i>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0e2e50', marginBottom: '0.25rem' }}>{property.Bedroom}</div>
                      <div style={{ fontSize: '0.875rem', color: '#757f95', fontWeight: 500 }}>Bedrooms</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#fff', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '2px solid #f0f0f0' }}>
                      <i className="fas fa-shower" style={{ fontSize: '1.8rem', color: '#0e2e50', marginBottom: '0.75rem' }}></i>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0e2e50', marginBottom: '0.25rem' }}>{property.Bathroom}</div>
                      <div style={{ fontSize: '0.875rem', color: '#757f95', fontWeight: 500 }}>Bathrooms</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#fff', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '2px solid #f0f0f0' }}>
                      <i className="fas fa-ruler-combined" style={{ fontSize: '1.8rem', color: '#0e2e50', marginBottom: '0.75rem' }}></i>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0e2e50', marginBottom: '0.25rem' }}>{property.Area}</div>
                      <div style={{ fontSize: '0.875rem', color: '#757f95', fontWeight: 500 }}>Sq Ft</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#fff', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '2px solid #f0f0f0' }}>
                      <i className="fas fa-calendar" style={{ fontSize: '1.8rem', color: '#0e2e50', marginBottom: '0.75rem' }}></i>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0e2e50', marginBottom: '0.25rem' }}>{property.Built_Year}</div>
                      <div style={{ fontSize: '0.875rem', color: '#757f95', fontWeight: 500 }}>Built Year</div>
                    </div>
                  </div>
                )}

                {property.Asset_Type === 'Agriculture' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem', padding: '2rem', background: 'linear-gradient(135deg, #f0f7ed 0%, #e8f5e0 100%)', borderRadius: '15px' }}>
                    <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#fff', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '2px solid #d4e8cc' }}>
                      <i className="fas fa-map-marked-alt" style={{ fontSize: '1.8rem', color: '#2d5016', marginBottom: '0.75rem' }}></i>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2d5016', marginBottom: '0.25rem' }}>{property.Farm_Size_Hectares}</div>
                      <div style={{ fontSize: '0.875rem', color: '#757f95', fontWeight: 500 }}>Hectares</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#fff', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '2px solid #d4e8cc' }}>
                      <i className="fas fa-seedling" style={{ fontSize: '1.8rem', color: '#2d5016', marginBottom: '0.75rem' }}></i>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2d5016', marginBottom: '0.25rem' }}>{property.Crop_Type}</div>
                      <div style={{ fontSize: '0.875rem', color: '#757f95', fontWeight: 500 }}>Crop Type</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#fff', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '2px solid #d4e8cc' }}>
                      <i className="fas fa-clock" style={{ fontSize: '1.8rem', color: '#2d5016', marginBottom: '0.75rem' }}></i>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2d5016', marginBottom: '0.25rem' }}>{property.Harvest_Cycle_Months}</div>
                      <div style={{ fontSize: '0.875rem', color: '#757f95', fontWeight: 500 }}>Months Cycle</div>
                    </div>
                    {property.Expected_Yield && (
                      <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: '#fff', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '2px solid #d4e8cc' }}>
                        <i className="fas fa-chart-line" style={{ fontSize: '1.8rem', color: '#2d5016', marginBottom: '0.75rem' }}></i>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2d5016', marginBottom: '0.25rem' }}>{property.Expected_Yield}</div>
                        <div style={{ fontSize: '0.875rem', color: '#757f95', fontWeight: 500 }}>Expected Yield</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Price */}
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0e2e50', marginBottom: '2.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #e8f0f7 0%, #d4e4f3 100%)', borderRadius: '12px', textAlign: 'center' }}>
                  ₦{Number(property.Price).toLocaleString()}
                </div>

                {/* Description */}
                <div className="property-single-description" style={{ marginBottom: '2.5rem' }}>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0e2e50', marginBottom: '1rem' }}>Description</h4>
                  <p style={{ fontSize: '1rem', color: '#666', lineHeight: '1.8' }}>{property.Description || 'No description available.'}</p>
                </div>

                {/* Video */}
                {property.Video && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0e2e50', marginBottom: '1rem' }}>Property Video</h4>
                    <div 
                      style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                      dangerouslySetInnerHTML={{ __html: property.Video }}
                    />
                  </div>
                )}

                {/* Amenities - Real Estate Only */}
                {property.Asset_Type === 'Real Estate' && property.Ammenities && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#0e2e50' }}>Amenities</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                      {property.Ammenities.split(',').map((amenity, idx) => {
                        const [name, icon] = amenity.includes(':') ? amenity.split(':') : [amenity, null];
                        const iconClass = icon || (() => {
                          const trimmed = name.trim().toLowerCase();
                          if (trimmed.includes('pool') || trimmed.includes('swim')) return 'fa-swimming-pool';
                          if (trimmed.includes('gym') || trimmed.includes('fitness')) return 'fa-dumbbell';
                          if (trimmed.includes('security') || trimmed.includes('guard')) return 'fa-shield-alt';
                          if (trimmed.includes('park')) return 'fa-square-parking';
                          if (trimmed.includes('garden') || trimmed.includes('lawn')) return 'fa-leaf';
                          if (trimmed.includes('balcony') || trimmed.includes('terrace')) return 'fa-building';
                          if (trimmed.includes('ac') || trimmed.includes('air') || trimmed.includes('cooling')) return 'fa-snowflake';
                          if (trimmed.includes('wifi') || trimmed.includes('internet')) return 'fa-wifi';
                          return 'fa-check-circle';
                        })();
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '14px 18px',
                              background: '#fff',
                              border: '2px solid #d4e4f3',
                              borderRadius: '12px',
                              fontSize: '0.95rem',
                              color: '#0e2e50',
                              fontWeight: 600,
                              boxShadow: '0 3px 10px rgba(14, 46, 80, 0.08)',
                              transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-3px)';
                              e.currentTarget.style.boxShadow = '0 8px 20px rgba(14, 46, 80, 0.2)';
                              e.currentTarget.style.borderColor = '#0e2e50';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 3px 10px rgba(14, 46, 80, 0.08)';
                              e.currentTarget.style.borderColor = '#d4e4f3';
                            }}
                          >
                            <i className={`fas ${iconClass}`} style={{ color: '#0e2e50', fontSize: '1.25rem' }}></i>
                            {name.trim()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Farm Details - Agriculture Only */}
                {property.Asset_Type === 'Agriculture' && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#2d5016' }}>Farm Specifications</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1.5rem', background: '#f0f7ed', borderRadius: '12px' }}>
                      {property.Farming_Method && (
                        <div style={{ padding: '1rem', background: '#fff', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.875rem', color: '#757f95', marginBottom: '0.25rem' }}>Farming Method</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d5016' }}>{property.Farming_Method}</div>
                        </div>
                      )}
                      {property.Soil_Type && (
                        <div style={{ padding: '1rem', background: '#fff', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.875rem', color: '#757f95', marginBottom: '0.25rem' }}>Soil Type</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d5016' }}>{property.Soil_Type}</div>
                        </div>
                      )}
                      {property.Water_Source && (
                        <div style={{ padding: '1rem', background: '#fff', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.875rem', color: '#757f95', marginBottom: '0.25rem' }}>Water Source</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d5016' }}>{property.Water_Source}</div>
                        </div>
                      )}
                      {property.Insurance_Status && (
                        <div style={{ padding: '1rem', background: '#fff', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.875rem', color: '#757f95', marginBottom: '0.25rem' }}>Insurance</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d5016' }}>{property.Insurance_Status}</div>
                        </div>
                      )}
                    </div>
                    {property.Farm_Equipment && (
                      <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '2px solid #d4e8cc' }}>
                        <div style={{ fontSize: '0.875rem', color: '#757f95', marginBottom: '0.5rem' }}>Farm Equipment</div>
                        <div style={{ fontSize: '1rem', color: '#2d5016' }}>{property.Farm_Equipment}</div>
                      </div>
                    )}
                    {property.Farm_Manager && (
                      <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '2px solid #d4e8cc' }}>
                        <div style={{ fontSize: '0.875rem', color: '#757f95', marginBottom: '0.5rem' }}>Farm Manager</div>
                        <div style={{ fontSize: '1rem', color: '#2d5016' }}>{property.Farm_Manager}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Documents */}
                {documents.length > 0 && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#0e2e50' }}>Property Documents</h4>
                    <PropertyDocuments
                      propertyId={property.Id}
                      documents={documents}
                      onDocumentsChange={() => {}}
                      isEditing={false}
                    />
                  </div>
                )}

                {/* Investment Stats */}
                <div style={{ background: 'linear-gradient(135deg, #e8f0f7 0%, #d4e4f3 100%)', padding: '2.5rem', borderRadius: '15px', marginTop: '2.5rem', border: '2px solid #0e2e50' }}>
                  <h4 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#0e2e50' }}>Investment Progress</h4>
                  <div className="progress" style={{ height: '35px', marginBottom: '1.5rem', borderRadius: '20px', background: '#fff' }}>
                    <div 
                      className="progress-bar" 
                      style={{ width: `${stats.percentage}%`, background: 'linear-gradient(135deg, #0e2e50 0%, #1a3a5c 100%)', borderRadius: '20px', fontSize: '1rem', fontWeight: 700 }}
                    >
                      {stats.percentage}%
                    </div>
                  </div>
                  <div className="row text-center">
                    <div className="col-4">
                      <h5 style={{ color: '#0e2e50', fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.investors}</h5>
                      <p style={{ color: '#666', margin: 0, fontSize: '0.95rem' }}>Investors</p>
                    </div>
                    <div className="col-4">
                      <h5 style={{ color: '#0e2e50', fontSize: '1.75rem', fontWeight: 'bold' }}>₦{stats.raised.toLocaleString()}</h5>
                      <p style={{ color: '#666', margin: 0, fontSize: '0.95rem' }}>Raised</p>
                    </div>
                    <div className="col-4">
                      <h5 style={{ color: '#0e2e50', fontSize: '1.75rem', fontWeight: 'bold' }}>{packageData.interestRate}%</h5>
                      <p style={{ color: '#666', margin: 0, fontSize: '0.95rem' }}>Interest p.a.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <div className="property-sidebar" style={{ position: 'sticky', top: '100px' }}>
                {/* Investment Package Selector */}
                <InvestmentPackageSelector
                  propertyId={property.Id}
                  onInvest={handleInvest}
                />

                {/* Key Features */}
                <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '15px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginTop: '24px' }}>
                  <h4 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#0e2e50' }}>Key Features</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <i className="fas fa-check-circle" style={{ color: '#0e2e50', marginRight: '0.75rem', fontSize: '1.5rem' }}></i>
                      <span style={{ fontSize: '1rem', color: '#666' }}>Verified Property</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <i className="fas fa-check-circle" style={{ color: '#0e2e50', marginRight: '0.75rem', fontSize: '1.5rem' }}></i>
                      <span style={{ fontSize: '1rem', color: '#666' }}>Secure Investment</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <i className="fas fa-check-circle" style={{ color: '#0e2e50', marginRight: '0.75rem', fontSize: '1.5rem' }}></i>
                      <span style={{ fontSize: '1rem', color: '#666' }}>Guaranteed Returns</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                      <i className="fas fa-check-circle" style={{ color: '#0e2e50', marginRight: '0.75rem', fontSize: '1.5rem' }}></i>
                      <span style={{ fontSize: '1rem', color: '#666' }}>Professional Management</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    </Layout>
  );
};

export default ListingDetail;
