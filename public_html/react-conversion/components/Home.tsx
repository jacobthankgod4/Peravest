import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroCarousel from './HeroCarousel';
import PropertyCard from './PropertyCard';
import ServiceStep from './ServiceStep';
import TestimonialCarousel from './TestimonialCarousel';

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
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

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

  const serviceSteps = [
    {
      number: 1,
      title: 'Register',
      description: 'Subscribe for free and become a member of our community'
    },
    {
      number: 2,
      title: 'Explore',
      description: 'Explore our different investment deals and options'
    },
    {
      number: 3,
      title: 'Get verified',
      description: 'Go through our KYC process and become a verified member.'
    },
    {
      number: 4,
      title: 'Invest',
      description: 'Pick a deal and amount and invest in your first property'
    }
  ];

  return (
    <main className="main">
      <HeroCarousel />

      <section className="about-area pt-100 pb-30">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="about-left wow fadeInUp">
                <div className="site-heading mb-3">
                  <h2 className="site-title">
                    Peravest unlocks professional real estate investments for everyone
                  </h2>
                </div>
                <p className="about-text">
                  Real estate investing has long been limited to big institutions and high-net-worth individuals. 
                  Now, with just N5,000, anyone can enter the world of professional real estate investment
                </p>
                <hr />
                <div className="about-bottom">
                  <button 
                    onClick={() => navigate('/listings')}
                    className="theme-btn"
                  >
                    See our crowdfunding offers <i className="far fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-right wow fadeInLeft">
                <div className="about-left wow fadeInUp">
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
                    <button 
                      onClick={() => navigate('/register')}
                      className="theme-btn"
                    >
                      Sign Up <i className="far fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="property-listing pb-30">
        <div className="container">
          <div className="property-listing-slider">
            <div className="row">
              {loading ? (
                <div className="col-12 text-center">Loading properties...</div>
              ) : (
                properties.map((property) => (
                  <div key={property.id} className="col-md-6 col-lg-4">
                    <PropertyCard property={property} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="service-area mag001">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mx-auto wow fadeInDown">
              <div className="site-heading text-center mb-30">
                <span className="site-title-tagline">Your way to your investment</span>
                <h2 className="site-title">How it works</h2>
              </div>
            </div>
          </div>
          <div className="row">
            {serviceSteps.map((step) => (
              <div key={step.number} className="col-md-6 col-lg-3">
                <ServiceStep step={step} delay={step.number * 0.25} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="choose-area bg pt-70 pb-70">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mx-auto wow fadeInDown">
              <div className="site-heading text-center">
                <span className="site-title-tagline">Choose</span>
                <h2 className="site-title">Why Choose Us</h2>
                <p>
                  At Peravest, we're committed to providing a secure, flexible, and successful 
                  investment experience for Nigerians at home and abroad.
                </p>
              </div>
            </div>
          </div>
          <div className="choose-wrapper">
            <div className="row justify-content-center">
              <WhyChooseItem 
                icon="flaticon-discord"
                title="Rigorous Project Vetting"
                description="We carefully vet every project before listing it on our platform."
              />
              <WhyChooseItem 
                icon="flaticon-calculator"
                title="Variety of Investment Options"
                description="We offer a range of investment deals in Nigeria's most promising real estate markets."
              />
              <WhyChooseItem 
                icon="flaticon-house"
                title="Expert Support and Guidance"
                description="Our experienced team is dedicated to providing personalized support throughout your journey."
              />
              <WhyChooseItem 
                icon="flaticon-discord"
                title="Regulatory Compliance"
                description="We comply with all relevant Nigerian regulations and laws."
              />
              <WhyChooseItem 
                icon="img"
                title="Transparent and Secure Transactions"
                description="We prioritize transparency and security in all our transactions."
              />
              <WhyChooseItem 
                icon="img"
                title="Diaspora Friendly"
                description="We welcome investors from the Nigerian diaspora."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="cta-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-7 mx-auto text-center">
              <div className="cta-text">
                <h1>Looking To Invest in a Property?</h1>
              </div>
              <button 
                onClick={() => navigate('/listings')}
                className="theme-btn mt-30"
              >
                Invest Now <i className="far fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <TestimonialCarousel />
    </main>
  );
};

interface WhyChooseItemProps {
  icon: string;
  title: string;
  description: string;
}

const WhyChooseItem: React.FC<WhyChooseItemProps> = ({ icon, title, description }) => (
  <div className="col-md-6 col-lg-4">
    <div className="choose-item wow fadeInUp">
      <div className="choose-icon">
        {icon === 'img' ? (
          <img src="/i/trans.png" width="60px" height="auto" alt="" />
        ) : (
          <i className={icon}></i>
        )}
      </div>
      <h4 className="choose-title">{title}</h4>
      <p>{description}</p>
    </div>
  </div>
);

export default Home;
