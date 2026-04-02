import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroCarousel: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Owl Carousel
    const $ = (window as any).$;
    if ($ && $.fn.owlCarousel) {
      $('.hero-slider').owlCarousel({
        items: 1,
        loop: true,
        autoplay: true,
        autoplayTimeout: 5000,
        nav: false,
        dots: true
      });
    }
  }, []);

  return (
    <div className="hero-section">
      <div className="hero-slider owl-carousel owl-theme">
        <div className="hero-single" style={{ background: 'url(/i/a3.jpg) center/cover' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-12 mx-auto">
                <div className="hero-content text-center">
                  <div className="hero-content-wrapper">
                    <h3 className="hero-title" data-animation="fadeInUp" data-delay=".25s">
                      Invest as low as <span> ₦5,000 </span>and earn up to<span> 25% </span>returns in high-yield properties
                    </h3>
                    <p data-animation="fadeInUp" data-delay=".50s"></p>
                    <div className="hero-btn d-block mt-5" data-animation="fadeInUp" data-delay=".75s">
                      <button onClick={() => navigate('/listings')} className="theme-btn">
                        Invest Now <i className="far fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-single" style={{ background: 'url(/i/16.jpg) center/cover' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-12 mx-auto">
                <div className="hero-content text-center">
                  <div className="hero-content-wrapper">
                    <h3 className="hero-title" data-animation="fadeInUp" data-delay=".25s">
                      Invest as low as <span> ₦5,000 </span>and earn up to<span> 25% </span>returns in high-yield properties
                    </h3>
                    <p data-animation="fadeInUp" data-delay=".50s"></p>
                    <div className="hero-btn d-block mt-5" data-animation="fadeInUp" data-delay=".75s">
                      <button onClick={() => navigate('/listings')} className="theme-btn">
                        Invest Now <i className="far fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
