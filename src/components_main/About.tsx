import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import { useSmartRouting } from '../hooks/useSmartRouting';

const About: React.FC = () => {
  const { handleFeatureClick } = useSmartRouting();

  return (
    <main className="main">
      <Breadcrumb 
        title="About Us" 
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', active: true }
        ]} 
      />

      {/* Vision Section */}
      <div className="about-area pt-30">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="about-left wow fadeInLeft" data-wow-duration="1s" data-wow-delay=".25s">
                <div className="about-img">
                  <img src="/i/i/7.jpg" alt="" />
                </div>
                <div className="about-experience">
                  <h1>7 <span>+</span></h1>
                  <span className="about-experience-text">Years Of Experience</span>
                </div>
                <div className="about-shape">
                  <img src="/assets/img/shape/01.svg" alt="" />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-left wow fadeInUp" data-wow-duration="1s" data-wow-delay=".25s">
                <div className="site-heading mb-3">
                  <span className="site-title-tagline">About Us</span>
                  <h2 className="site-title">The peravest vision</h2>
                  <p className="about-text">
                    At peravest, we believe in ethical, sustainable real estate investing that, where investors can have a positive impact on real communities, while making a profit.
                  </p>
                </div>
                <div className="site-heading mb-3">
                  <p className="about-text">
                    At the same time, we believe the right projects deserve to be funded and allowed to realise their full potential.
                  </p>
                </div>
                <div className="site-heading mb-3">
                  <p className="about-text">
                    As the first real estate crowdfunding platform in Africa, peravest's goal has always been to match the right people with the right projects and keep everything crystal clear for all involved, every step of the way.
                  </p>
                </div>
                <hr />
                <div className="about-bottom">
                  <Link to="/register" className="theme-btn">Sign Up Today <i className="far fa-arrow-right"></i></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="choose-area pt-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mx-auto wow fadeInDown" data-wow-duration="1s" data-wow-delay=".25s">
              <div className="site-heading text-center">
                <span className="site-title-tagline">Why Choose Us</span>
                <h2 className="site-title">peravest is unlocking real estate investments for everyone</h2>
              </div>
            </div>
          </div>
          <div className="choose-wrapper">
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-4">
                <div className="choose-item py-2 wow fadeInUp" data-wow-duration="1s" data-wow-delay=".25s">
                  <div className="choose-icon"><i className="flaticon-discord"></i></div>
                  <h4 className="choose-title">Safe and reliable</h4>
                  <p>Since 2020, peravest has delivered safe and secure real estate investment solutions for tens of thousands of happy customers - plus we're a regulated Africa crowdfunding service provider and a payment institution</p>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="choose-item py-2 wow fadeInUp" data-wow-duration="1s" data-wow-delay=".50s">
                  <div className="choose-icon"><i className="flaticon-calculator"></i></div>
                  <h4 className="choose-title">Excellent returns</h4>
                  <p>You can look forward to average annual net returns of 25%, from a wide range of real estate investment projects from across the Nigeria.</p>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="choose-item py-2 wow fadeInUp" data-wow-duration="1s" data-wow-delay=".75s">
                  <div className="choose-icon"><i className="flaticon-house"></i></div>
                  <h4 className="choose-title">Investing made easy</h4>
                  <p>Get 24/7 access to a wide variety of pre-vetted international real estate investments by creating a free account, then automate your investments with Autoinvest.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="about-area" style={{ marginTop: '80px', marginBottom: '60px' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="about-left wow fadeInLeft" data-wow-duration="1s" data-wow-delay=".25s">
                <div className="about-img">
                  <img src="/i/i/4.jpg" alt="" />
                </div>
                <div className="about-experience">
                  <h1>7 <span>+</span></h1>
                  <span className="about-experience-text">Years Of Experience</span>
                </div>
                <div className="about-shape">
                  <img src="/assets/img/shape/01.svg" alt="" />
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-left wow fadeInUp" data-wow-duration="1s" data-wow-delay=".25s">
                <div className="site-heading mb-3">
                  <span className="site-title-tagline">Our Story</span>
                  <h2 className="site-title">Our Story</h2>
                  <p className="about-text">
                    Real estate investing has long been limited to big institutions and high-net-worth individuals. Most Nigerians dream of owning property but lack access to capital or the expertise to navigate the complex real estate market.
                  </p>
                </div>
                <div className="site-heading mb-3">
                  <p className="about-text">
                    In 2020, Peravest was born with a simple mission: democratize real estate investment in Nigeria. We created Nigeria's first real estate crowdfunding platform, allowing anyone to start investing with as little as ₦5,000.
                  </p>
                </div>
                <div className="site-heading mb-3">
                  <p className="about-text">
                    Today, Peravest combines rigorous property vetting, transparent processes, and innovative savings programs like Ajo and Target Savings to give both first-time investors and seasoned pros the tools and confidence they need to build wealth through real estate.
                  </p>
                </div>
                <hr />
                <div className="about-bottom">
                  <Link to="/register" className="theme-btn">Sign Up Today <i className="far fa-arrow-right"></i></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Features - keeping from original */}
      <div className="feature-area py-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mx-auto">
              <div className="site-heading text-center">
                <span className="site-title-tagline">Savings & Investment</span>
                <h2 className="site-title">Multiple Ways to Grow Your <span>Money</span></h2>
                <p>Choose from our diverse range of savings and investment products designed for every financial goal.</p>
              </div>
            </div>
          </div>

          <div className="row align-items-center mb-5 wow fadeInUp" data-wow-duration="1s" data-wow-delay=".25s">
            <div className="col-lg-6">
              <div className="text-center">
                <img src="/i/a2.jpg" alt="Real Estate Investment" style={{ width: '500px', height: '281px', objectFit: 'cover', borderRadius: '10px' }} />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="feature-content">
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
          </div>

          <div className="row align-items-center mb-5 wow fadeInUp" data-wow-duration="1s" data-wow-delay=".50s">
            <div className="col-lg-6 order-lg-2">
              <div className="text-center">
                <img src="/i/ajo.png" alt="Ajo Savings" style={{ width: '500px', height: '281px', objectFit: 'cover', borderRadius: '10px' }} />
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div className="feature-content">
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
          </div>

          <div className="row align-items-center wow fadeInUp" data-wow-duration="1s" data-wow-delay=".75s">
            <div className="col-lg-6">
              <div className="text-center">
                <img src="/i/target_savings.png" alt="Target Savings" style={{ width: '500px', height: '281px', objectFit: 'cover', borderRadius: '10px' }} />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="feature-content">
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
      </div>
    </main>
  );
};

export default About;
