import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const slides = [
  { bg: `${process.env.PUBLIC_URL}/i/a3.jpg` },
  { bg: `${process.env.PUBLIC_URL}/i/16.jpg` },
];

const HeroCarousel: React.FC = () => {
  useEffect(() => {
    const $ = (window as any).$;
    if (!$ || !$.fn || !$.fn.owlCarousel) return;

    const $carousel = $('.hero-slider');
    if (!$carousel.length) return;

    // Destroy existing instance before reinitialising
    if ($carousel.hasClass('owl-loaded')) {
      $carousel.trigger('destroy.owl.carousel').removeClass('owl-loaded');
    }

    $carousel.owlCarousel({
      items: 1,
      loop: true,
      autoplay: true,
      autoplayTimeout: 5000,
      autoplayHoverPause: true,
      animateOut: 'fadeOut',
      nav: false,
      dots: true,
      smartSpeed: 800,
    });
  }, []);

  return (
    <div className="hero-section">
      <div className="hero-slider owl-carousel owl-theme">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="hero-single"
            style={{ background: `url(${slide.bg}) center/cover no-repeat` }}
          >
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-12 mx-auto">
                  <div className="hero-content text-center">
                    <div className="hero-content-wrapper">
                      <h3
                        className="hero-title"
                        style={{ fontSize: '40px' }}
                        data-animation="fadeInUp"
                        data-delay=".25s"
                      >
                        Invest as low as <span> ₦5,000 </span> and earn up to
                        <span> 25% </span> returns in high-yield properties
                      </h3>
                      <p data-animation="fadeInUp" data-delay=".50s"></p>
                      <div className="hero-btn d-block mt-5" data-animation="fadeInUp" data-delay=".75s">
                        <Link to="/listings" className="theme-btn" style={{ fontWeight: 900, letterSpacing: '0.5px' }}>
                          Invest Now <i className="far fa-arrow-right"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
