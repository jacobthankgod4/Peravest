import React from 'react';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  image: string;
  bio: string;
}

interface Testimonial {
  id: number;
  name: string;
  position: string;
  content: string;
  rating: number;
}

const About: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "John Doe",
      position: "CEO & Founder",
      image: "/images/team/ceo.jpg",
      bio: "Leading the company with 15+ years of real estate experience"
    },
    {
      id: 2,
      name: "Jane Smith",
      position: "Investment Director",
      image: "/images/team/director.jpg",
      bio: "Expert in property investment strategies and portfolio management"
    }
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Michael Johnson",
      position: "Investor",
      content: "Excellent returns on my investment. Professional and transparent service.",
      rating: 5
    },
    {
      id: 2,
      name: "Sarah Wilson",
      position: "Property Owner",
      content: "Great platform for real estate investment. Highly recommended!",
      rating: 5
    }
  ];

  const stats = [
    { label: "Properties", value: "500+" },
    { label: "Investors", value: "1000+" },
    { label: "Total Investment", value: "₦2B+" },
    { label: "Years Experience", value: "10+" }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">About Our Company</h1>
              <p className="lead">
                We are a leading real estate investment platform connecting investors 
                with profitable property opportunities across Nigeria.
              </p>
            </div>
            <div className="col-lg-6">
              <img 
                src="/images/about-hero.jpg" 
                alt="About Us" 
                className="img-fluid rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5">
        <div className="container">
          <div className="row">
            {stats.map((stat, index) => (
              <div key={index} className="col-md-3 text-center mb-4">
                <div className="stat-item">
                  <h2 className="display-4 fw-bold text-primary">{stat.value}</h2>
                  <p className="text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">Our Team</h2>
              <p className="text-muted">Meet the experts behind our success</p>
            </div>
          </div>
          <div className="row">
            {teamMembers.map((member) => (
              <div key={member.id} className="col-lg-6 mb-4">
                <div className="team-card card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="rounded-circle mb-3"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                    <h5 className="card-title">{member.name}</h5>
                    <p className="text-primary fw-semibold">{member.position}</p>
                    <p className="text-muted">{member.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">What Our Clients Say</h2>
              <p className="text-muted">Hear from our satisfied investors</p>
            </div>
          </div>
          <div className="row">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="col-lg-6 mb-4">
                <div className="testimonial-card card h-100 border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="stars mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="fas fa-star text-warning"></i>
                      ))}
                    </div>
                    <p className="card-text mb-3">"{testimonial.content}"</p>
                    <div className="testimonial-author">
                      <h6 className="mb-0">{testimonial.name}</h6>
                      <small className="text-muted">{testimonial.position}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="section-title">Our Mission</h2>
              <p className="lead mb-4">
                To democratize real estate investment by providing accessible, 
                transparent, and profitable opportunities for everyone.
              </p>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-check text-primary me-2"></i>
                  Transparent investment process
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-primary me-2"></i>
                  Professional property management
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-primary me-2"></i>
                  Competitive returns
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-primary me-2"></i>
                  Secure investment platform
                </li>
              </ul>
            </div>
            <div className="col-lg-6">
              <img 
                src="/images/mission.jpg" 
                alt="Our Mission" 
                className="img-fluid rounded"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;