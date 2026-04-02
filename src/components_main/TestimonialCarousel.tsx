import React, { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

const TestimonialCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Real Estate Investor",
      content: "Excellent platform for property investment. The returns have been consistent and the process is transparent.",
      avatar: "/assets/img/testimonial/01.jpg",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Business Owner",
      content: "I've been investing through this platform for 2 years. Great customer service and reliable returns.",
      avatar: "/assets/img/testimonial/02.jpg",
      rating: 5
    },
    {
      id: 3,
      name: "Emma Williams",
      role: "Financial Advisor",
      content: "Highly recommend for anyone looking to diversify their investment portfolio with real estate.",
      avatar: "/assets/img/testimonial/03.jpg",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
    ));
  };

  return (
    <div className="testimonial-carousel">
      <div className="testimonial-slide">
        <div className="testimonial-content">
          <div className="rating">
            {renderStars(testimonials[currentSlide].rating)}
          </div>
          <p>"{testimonials[currentSlide].content}"</p>
          <div className="testimonial-author">
            <img 
              src={testimonials[currentSlide].avatar} 
              alt={testimonials[currentSlide].name}
              className="avatar"
            />
            <div className="author-info">
              <h5>{testimonials[currentSlide].name}</h5>
              <span>{testimonials[currentSlide].role}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="carousel-indicators">
        {testimonials.map((_, index) => (
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

export default TestimonialCarousel;