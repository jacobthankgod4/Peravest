import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSmartRouting } from '../hooks/useSmartRouting';
import HeroCarousel from './HeroCarousel';
import PropertyCard from './PropertyCard';
import ServiceStep from './ServiceStep';
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
  const [loading, setLoading] = useState(true);
  const { handleFeatureClick } = useSmartRouting();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('property')
        .select('*')
        .eq('Status', 'active')
        .limit(6);

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
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="main">
      <HeroCarousel />

      {/* About Section */}
      <div className="about-area pt-100 pb-30">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="about-left wow fadeInUp" data-wow-duration="1s" data-wow-delay=".25s">
                <div className="site-heading mb-3">
                  <h2 className="site-title">
                    Peravest unlocks professional real estate investments for everyone
                  </h2>
                </div>
                <p className="about-text">
                  Real estate investing has long been limited to big institutions and high-net-worth individuals. 
                  Now, with just ₦5,000, anyone can enter the world of professional real estate investment.
                </p>
                <hr />
                <div className="about-bottom">
                  <Link to="/listings" className="theme-btn">
                    See our crowdfunding offers <i className="far fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-right wow fadeInLeft" data-wow-duration="1s" data-wow-delay=".25s">
                <div className="about-left wow fadeInUp" data-wow-duration="1s" data-wow-delay=".25s">
                  <div className="site-heading mb-3">
                    <h2 className="site-title">
                      A great investment shouldn't keep you up at night
                    </h2>
                  </div>
                  <p className="about-text">
                    Invest with confidence, thanks to peravest's rigorous pre-vetting processes. 
                    Every project completes a thorough due diligence so that you can invest easily.
                  </p>
                  <hr />
                  <div className="about-bottom">
                    <Link to="/register" className="theme-btn">
                      Sign Up <i className="far fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Listings */}
      <div className="property-listing pb-30">
        <div className="container">
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

      {/* How It Works */}
      <div className="service-area mag001">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mx-auto wow fadeInDown" data-wow-duration="1s" data-wow-delay=".25s">
              <div className="site-heading text-center mb-30">
                <span className="site-title-tagline">Your way to your investment</span>
                <h2 className="site-title">How it works</h2>
              </div>
            </div>
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

      {/* Savings Features */}
      <div className="savings-features-area py-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <div className="site-heading mb-50">
                <span className="site-title-tagline">Savings & Investment</span>
                <h2 className="site-title">Multiple Ways to Grow Your Money</h2>
                <p>Choose from our diverse range of savings and investment products designed for every financial goal</p>
              </div>
            </div>
          </div>

          {/* Real Estate Investment Section */}
          <div className="row align-items-center mb-5 wow fadeInUp" data-wow-duration="1s" data-wow-delay=".25s">
            <div className="col-lg-6">
              <div className="text-center">
                <img src="/i/a2.jpg" alt="Real Estate Investment" style={{ width: '500px', height: '281px', objectFit: 'cover', borderRadius: '10px' }} />
              </div>
            </div>
            <div className="col-lg-6">
              <h3>Real Estate Investment</h3>
              <p>Invest in high-yield properties with as low as ₦5,000</p>
              <ul className="about-list">
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Up to 25% annual returns</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Professional property management</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Fractional ownership</div></li>
              </ul>
              <button onClick={() => handleFeatureClick('real-estate')} className="theme-btn mt-3">Start Investing</button>
            </div>
          </div>

          {/* Ajo Savings Section */}
          <div className="row align-items-center mb-5 wow fadeInUp" data-wow-duration="1s" data-wow-delay=".50s">
            <div className="col-lg-6 order-lg-2">
              <div className="text-center">
                <img src="/i/ajo.png" alt="Ajo Savings" style={{ width: '500px', height: '281px', objectFit: 'cover', borderRadius: '10px' }} />
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <h3>Ajo Savings Circle</h3>
              <p>Traditional Nigerian savings with modern security</p>
              <ul className="about-list">
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Guaranteed monthly payouts</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Community-based savings</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Flexible contribution amounts</div></li>
              </ul>
              <button onClick={() => handleFeatureClick('ajo')} className="theme-btn mt-3">Join Ajo</button>
            </div>
          </div>

          {/* Target Savings Section */}
          <div className="row align-items-center wow fadeInUp" data-wow-duration="1s" data-wow-delay=".75s">
            <div className="col-lg-6">
              <div className="text-center">
                <img src="/i/target_savings.png" alt="Target Savings" style={{ width: '500px', height: '281px', objectFit: 'cover', borderRadius: '10px' }} />
              </div>
            </div>
            <div className="col-lg-6">
              <h3>Target Savings</h3>
              <p>Save towards specific goals with automated deposits</p>
              <ul className="about-list">
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Goal-oriented saving</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Automated contributions</div></li>
                <li><div className="about-icon"><span><i className="fas fa-check"></i></span></div><div>Competitive interest rates</div></li>
              </ul>
              <button onClick={() => handleFeatureClick('target-savings')} className="theme-btn mt-3">Set Goals</button>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Section */}
      <div className="location-area py-80">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-12 col-lg-12">
              <div className="location-item wow fadeInUp" data-wow-duration="1s" data-wow-delay=".50s">
                <div className="location-img">
                  <img src="/i/african_woman.jpg" className="img-fluid" alt="Happy African woman investor" />
                </div>
                <div className="location-info">
                  <h3>Peravest unlocks professional real estate investments for everyone.</h3>
                </div>
                <Link to="/about" className="location-btn" style={{ display: 'none' }}>
                  <i className="far fa-arrow-right"></i>
                </Link>
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-center mb-4">
              <Link to="/about" className="theme-btn mt-4">
                About Us <i className="far fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="choose-area bg pt-70 pb-70">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mx-auto wow fadeInDown" data-wow-duration="1s" data-wow-delay=".25s">
              <div className="site-heading text-center">
                <span className="site-title-tagline">Choose</span>
                <h2 className="site-title">Why Choose Us</h2>
                <p>
                  At Peravest, we're committed to providing a secure, flexible, and successful investment 
                  experience for Nigerians at home and abroad.
                </p>
              </div>
            </div>
          </div>
          <div className="choose-wrapper">
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-4">
                <div className="choose-item wow fadeInUp" data-wow-duration="1s" data-wow-delay=".25s">
                  <div className="choose-icon">
                    <i className="flaticon-discord"></i>
                  </div>
                  <h4 className="choose-title">Rigorous Project Vetting</h4>
                  <p>
                    We carefully vet every project before listing it on our platform. Our team conducts 
                    thorough research and due diligence to ensure every project meets our high standards.
                  </p>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="choose-item wow fadeInUp" data-wow-duration="1s" data-wow-delay=".50s">
                  <div className="choose-icon">
                    <i className="flaticon-calculator"></i>
                  </div>
                  <h4 className="choose-title">Variety of Investment Options</h4>
                  <p>
                    We offer a range of investment deals in Nigeria's most promising real estate markets, 
                    including Lagos, Abuja, and Port Harcourt.
                  </p>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="choose-item wow fadeInUp" data-wow-duration="1s" data-wow-delay=".75s">
                  <div className="choose-icon">
                    <i className="flaticon-house"></i>
                  </div>
                  <h4 className="choose-title">Expert Support and Guidance</h4>
                  <p>
                    Our experienced team provides personalized support throughout your investment journey, 
                    from choosing investments to providing regular portfolio updates.
                  </p>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="choose-item wow fadeInUp" data-wow-duration="1s" data-wow-delay=".25s">
                  <div className="choose-icon">
                    <i className="flaticon-discord"></i>
                  </div>
                  <h4 className="choose-title">Regulatory Compliance</h4>
                  <p>
                    We're committed to complying with all relevant Nigerian regulations and laws, including 
                    NIPC and SEC.
                  </p>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="choose-item wow fadeInUp" data-wow-duration="1s" data-wow-delay=".50s">
                  <div className="choose-icon">
                    <img src="/i/trans.png" width="60px" height="auto" alt="" />
                  </div>
                  <h4 className="choose-title">Transparent and Secure Transactions</h4>
                  <p>
                    We prioritize transparency and security. Our platform uses state-of-the-art technology, 
                    and our transparent fee structure means no hidden charges.
                  </p>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="choose-item wow fadeInUp" data-wow-duration="1s" data-wow-delay=".75s">
                  <div className="choose-icon">
                    <img src="/i/diaspora.png" width="60px" height="auto" alt="" />
                  </div>
                  <h4 className="choose-title">Diaspora Friendly</h4>
                  <p>
                    We welcome investors from the Nigerian diaspora, providing a secure and convenient way 
                    to invest in Nigerian real estate from anywhere in the world.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="cta-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-7 mx-auto text-center">
              <div className="cta-text">
                <h1>Looking To Invest in a Property?</h1>
              </div>
              <Link to="/listings" className="theme-btn mt-30">
                Invest Now <i className="far fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="team-area py-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mx-auto wow fadeInDown" data-wow-duration="1s" data-wow-delay=".25s">
              <div className="site-heading text-center">
                <span className="site-title-tagline">Our Team</span>
                <h2 className="site-title">Meet With Our Team</h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 col-lg-4">
              <div className="team-item wow fadeInUp" data-wow-duration="1s" data-wow-delay=".50s">
                <div className="team-img">
                  <img src="/i/1.jpg" alt="thumb" />
                </div>
                <div className="team-content">
                  <div className="team-bio">
                    <h5><Link to="#">OWOLABI ENOCH OLAWALE</Link></h5>
                    <span>CEO/DIRECTOR</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="team-item wow fadeInUp" data-wow-duration="1s" data-wow-delay=".75s">
                <div className="team-img">
                  <img src="/i/Eniola_Team_Member.jpg" alt="thumb" />
                </div>
                <div className="team-content">
                  <div className="team-bio">
                    <h5><Link to="#">Akinyode Eniola Tolulope</Link></h5>
                    <span>Chief Operating Officer | Manager</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="team-item wow fadeInUp" data-wow-duration="1s" data-wow-delay="1s">
                <div className="team-img">
                  <img src="/i/aaa.jpg" alt="thumb" />
                </div>
                <div className="team-content">
                  <div className="team-bio">
                    <h5><Link to="#">SOLICITOR OLUWASEUN TEMITOPE ADENUGA (LL.B)</Link></h5>
                    <span>Solicitor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Reviews */}
      <div style={{ backgroundColor: '#f5f5f7', padding: '100px 0', borderTop: '3px solid #e5e5e7', borderBottom: '3px solid #e5e5e7' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mx-auto wow fadeInDown" data-wow-duration="1s" data-wow-delay=".25s">
              <div className="site-heading text-center mb-50">
                <span className="site-title-tagline">Testimonials</span>
                <h2 className="site-title">What Our Clients Say</h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div id="shapo-widget-ab072b1a70921ee70116"></div>
              <script id="shapo-embed-js" type="text/javascript" src="https://cdn.shapo.io/js/embed.js" async></script>
            </div>
          </div>
        </div>
      </div>

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
            <div className="col-md-6 col-lg-4">
              <div className="blog-item wow fadeInUp" data-wow-duration="1s" data-wow-delay=".25s">
                <div className="blog-item-img">
                  <img className="img_list1" src="/assets/img/blog/blogc.jpg" alt="Thumb" />
                </div>
                <div className="blog-item-info">
                  <h4 className="blog-title">
                    <Link to="#">There are many variations of passages available suffer</Link>
                  </h4>
                  <div className="blog-item-meta">
                    <ul>
                      <li><Link to="#"><i className="far fa-user-circle"></i> By Alicia Davis</Link></li>
                      <li><Link to="#"><i className="far fa-calendar-alt"></i> May 12, 2024</Link></li>
                    </ul>
                  </div>
                  <p>
                    There are many variations of passages of Lorem Ipsum available, but the majority have 
                    suffered alteration in some form.
                  </p>
                  <Link className="theme-btn" to="#">
                    Read More<i className="far fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="blog-item wow fadeInUp" data-wow-duration="1s" data-wow-delay=".50s">
                <div className="blog-item-img">
                  <img className="img_list1" src="/assets/img/blog/bloga.jpg" alt="Thumb" />
                </div>
                <div className="blog-item-info">
                  <h4 className="blog-title">
                    <Link to="#">The Power of Small Steps: Building Wealth with PeraVest</Link>
                  </h4>
                  <div className="blog-item-meta">
                    <ul>
                      <li><Link to="#"><i className="far fa-user-circle"></i> By Alicia Davis</Link></li>
                      <li><Link to="#"><i className="far fa-calendar-alt"></i> May 12, 2024</Link></li>
                    </ul>
                  </div>
                  <p>
                    When it comes to achieving big goals, whether in life or in finances, we often get 
                    overwhelmed by the sheer size of the task...
                  </p>
                  <Link className="theme-btn" to="#">
                    Read More<i className="far fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4">
              <div className="blog-item wow fadeInUp" data-wow-duration="1s" data-wow-delay=".75s">
                <div className="blog-item-img">
                  <img className="img_list1" src="/assets/img/blog/blogb.jpg" alt="Thumb" />
                </div>
                <div className="blog-item-info">
                  <h4 className="blog-title">
                    <Link to="#">There are many variations of passages available suffer</Link>
                  </h4>
                  <div className="blog-item-meta">
                    <ul>
                      <li><Link to="#"><i className="far fa-user-circle"></i> By Alicia Davis</Link></li>
                      <li><Link to="#"><i className="far fa-calendar-alt"></i> May 12, 2024</Link></li>
                    </ul>
                  </div>
                  <p>
                    There are many variations of passages of Lorem Ipsum available, but the majority have 
                    suffered alteration in some form.
                  </p>
                  <Link className="theme-btn" to="#">
                    Read More<i className="far fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
