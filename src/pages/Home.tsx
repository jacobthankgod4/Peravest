import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSmartRouting } from '../hooks/useSmartRouting';
import { blogPublicService } from '../services/blogService';
import Layout from '../components_main/Layout';
import HeroCarousel from './HeroCarousel';
import PropertyCard from './PropertyCard';
import ServiceStep from './ServiceStep';
import ContactUs from './ContactUs';
import '../savings-features.css';
import '../testimonial-override.css';

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

const Home: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const { handleFeatureClick } = useSmartRouting();

  useEffect(() => {
    fetchProperties();
    fetchBlogs();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('property')
        .select(`
          *,
          property_image(Image_Url, Display_Order),
          investment_package(Share_Cost, Interest_Rate, Property_Id)
        `)
        .eq('Status', 'active')
        .eq('is_deleted', false)
        .limit(6);

      if (error) {
        console.error('[Home] Property fetch error:', error);
        throw error;
      }
      
      const propertyIds = (data || []).map((p: any) => p.Id);
      
      const { data: investData, error: investError } = await supabase
        .from('invest_now')
        .select('proptee_id, share_cost, Usa_Id')
        .in('proptee_id', propertyIds);
      
      if (investError) {
        console.error('[Home] Investment fetch error:', investError);
      }
      
      const mapped = (data || []).map((p: any) => {
        const imageUrls: string[] = [];
        if (p.property_image && Array.isArray(p.property_image) && p.property_image.length > 0) {
          imageUrls.push(...p.property_image.sort((a: any, b: any) => a.Display_Order - b.Display_Order).map((img: any) => img.Image_Url));
        } else if (p.Images && p.Images.trim()) {
          imageUrls.push(p.Images);
        }
        
        if (imageUrls.length === 0) {
          imageUrls.push('/assets/img/property/default.jpg');
        }

        const investments = (investData || []).filter((inv: any) => inv.proptee_id === p.Id);
        const totalRaised = investments.reduce((sum: number, inv: any) => sum + Number(inv.share_cost || 0), 0);
        const uniqueInvestors = new Set(investments.map((inv: any) => inv.Usa_Id)).size;
        const targetAmount = Number(p.Price || 10000000);
        const percentage = Math.min((totalRaised / targetAmount) * 100, 100);

        const packageData = Array.isArray(p.investment_package) && p.investment_package.length > 0
          ? p.investment_package[0]
          : null;
        
        const interestRate = packageData ? Number(packageData.Interest_Rate) : 25;
        const shareCost = packageData ? Number(packageData.Share_Cost) : 5000;

        return {
          id: p.Id,
          title: p.Title,
          address: p.Address,
          image: imageUrls.join(','),
          shareCost: shareCost,
          interest: interestRate,
          percent: Math.round(percentage),
          investors: uniqueInvestors,
          raised: totalRaised
        };
      });
      
      setProperties(mapped);
    } catch (error) {
      console.error('[Home] Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const data = await blogPublicService.getPublishedBlogs(3);
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setBlogsLoading(false);
    }
  };

  return (
    <Layout title="PeraVest - Real Estate Investment Platform">
      <main className="main">
      <HeroCarousel />

      {/* About Section - White Background */}
      <div style={{ background: '#fff', padding: '80px 20px' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#0e2e50', marginBottom: '15px' }}>Peravest unlocks professional real estate investments for everyone</h2>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.8', marginBottom: '20px' }}>Real estate investing has long been limited to big institutions and high-net-worth individuals. Now, with just ₦5,000, anyone can enter the world of professional real estate investment.</p>
                <Link to="/listings" style={{ display: 'inline-block', padding: '12px 32px', background: 'linear-gradient(135deg, #09c398 0%, #06a876 100%)', color: '#fff', textDecoration: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(9, 195, 152, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>See our crowdfunding offers <i className="far fa-arrow-right" style={{ marginLeft: '8px' }}></i></Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#0e2e50', marginBottom: '15px' }}>A great investment shouldn't keep you up at night</h2>
                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.8', marginBottom: '20px' }}>Invest with confidence, thanks to peravest's rigorous pre-vetting processes. Every project completes a thorough due diligence so that you can invest easily.</p>
                <Link to="/register" style={{ display: 'inline-block', padding: '12px 32px', background: 'linear-gradient(135deg, #09c398 0%, #06a876 100%)', color: '#fff', textDecoration: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(9, 195, 152, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>Sign Up <i className="far fa-arrow-right" style={{ marginLeft: '8px' }}></i></Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Listings - Light Gray Background */}
      <div style={{ background: '#f9f9f9', padding: '80px 20px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#0e2e50', marginBottom: '15px' }}>Featured Properties</h2>
            <p style={{ fontSize: '16px', color: '#666' }}>Explore our curated selection of premium real estate investment opportunities</p>
          </div>
          <div className="row">
            {loading ? (
              <div className="col-12 text-center">Loading properties...</div>
            ) : properties.length > 0 ? (
              properties.map((property) => (
                <div key={property.id} className="col-md-6 col-lg-4 mb-4">
                  <PropertyCard property={property} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center">No properties available</div>
            )}
          </div>
        </div>
      </div>

      {/* How It Works - Dark Gradient Background */}
      <div style={{ background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)', padding: '80px 20px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: '#09c398', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Your way to your investment</span>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#fff', marginBottom: '15px', marginTop: '10px' }}>How it works</h2>
          </div>
          <div className="row">
            <div className="col-md-6 col-lg-3">
              <ServiceStep step={{ number: 1, title: "Register", description: "Subscribe for free and become a member of our community" }} delay={0.25} />
            </div>
            <div className="col-md-6 col-lg-3">
              <ServiceStep step={{ number: 2, title: "Explore", description: "Explore our different investment deals and options" }} delay={0.5} />
            </div>
            <div className="col-md-6 col-lg-3">
              <ServiceStep step={{ number: 3, title: "Get verified", description: "Go through our KYC process and become a verified member." }} delay={0.75} />
            </div>
            <div className="col-md-6 col-lg-3">
              <ServiceStep step={{ number: 4, title: "Invest", description: "Pick a deal and amount and invest in your first property" }} delay={1} />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <ContactUs />

      {/* Blog Section */}
      <div className="blog-area py-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mx-auto wow fadeInDown" data-wow-duration="1s" data-wow-delay=".25s">
              <div className="site-heading text-center">
                <span className="site-title-tagline">Our Blog</span>
                <h2 className="site-title">Our Latest News & Blog</h2>
              </div>
            </div>
          </div>
          <div className="row">
            {blogsLoading ? (
              <div className="col-12 text-center">Loading blogs...</div>
            ) : blogs.length > 0 ? (
              blogs.map((blog, index) => (
                <div key={blog.id} className="col-md-6 col-lg-4">
                  <div className="blog-item wow fadeInUp" data-wow-duration="1s" data-wow-delay={`.${25 + (index * 25)}s`}>
                    <div className="blog-item-img">
                      <img className="img_list1" src={blog.image_url || '/assets/img/blog/blogc.jpg'} alt={blog.title} />
                    </div>
                    <div className="blog-item-info">
                      <h4 className="blog-title">
                        <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                      </h4>
                      <div className="blog-item-meta">
                        <ul>
                          <li><Link to="#"><i className="far fa-user-circle"></i> By {blog.author_name}</Link></li>
                          <li><Link to="#"><i className="far fa-calendar-alt"></i> {new Date(blog.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</Link></li>
                        </ul>
                      </div>
                      <p>{blog.excerpt || blog.content.substring(0, 150) + '...'}</p>
                      <Link className="theme-btn" to={`/blog/${blog.slug}`}>
                        Read More<i className="far fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">No blog posts available</div>
            )}
          </div>
        </div>
      </div>
      </main>
    </Layout>
  );
};

export default Home;
