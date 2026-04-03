import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/i/a3.jpg',
      title: 'Invest as low as ₦5,000 and earn up to 25% returns in high-yield properties'
    },
    {
      image: '/i/16.jpg',
      title: 'Invest as low as ₦5,000 and earn up to 25% returns in high-yield properties'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-section">
      <div className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-single ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
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
                      >
                        {slide.title.split(' and ').map((part, i) => (
                          <React.Fragment key={i}>
                            {i === 0 ? part : <span> and {part}</span>}
                          </React.Fragment>
                        ))}
                      </h3>
                      <div className="hero-btn d-block mt-5" data-animation="fadeInUp">
                        <button 
                          onClick={() => navigate('/listings')}
                          className="theme-btn"
                        >
                          Invest Now <i className="far fa-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="carousel-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
