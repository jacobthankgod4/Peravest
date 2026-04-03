import React from 'react';
import { Helmet } from 'react-helmet-async';

const About: React.FC = () => {
  const teamMembers = [
    {
      id: 1,
      name: "John Doe",
      position: "CEO & Founder",
      image: "/assets/images/team/team1.jpg",
      bio: "Leading the company with over 15 years of real estate experience."
    },
    {
      id: 2,
      name: "Jane Smith",
      position: "Investment Director",
      image: "/assets/images/team/team2.jpg",
      bio: "Expert in property investment strategies and portfolio management."
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Michael Johnson",
      text: "Excellent investment platform with great returns.",
      rating: 5
    },
    {
      id: 2,
      name: "Sarah Wilson",
      text: "Professional service and transparent processes.",
      rating: 5
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us - Real Estate Investment</title>
        <meta name="description" content="Learn about our team and mission in real estate investment" />
      </Helmet>

      <div className="about-page">
        <section className="hero-section bg-primary text-white py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center">
                <h1 className="display-4 mb-4">About Our Company</h1>
                <p className="lead">
                  We are dedicated to providing exceptional real estate investment opportunities
                  with transparency and professional service.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="team-section py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center mb-5">
                <h2 className="section-title">Our Team</h2>
                <p className="text-muted">
                  Meet the professionals behind our success
                </p>
              </div>
            </div>
            <div className="row">
              {teamMembers.map(member => (
                <div key={member.id} className="col-lg-6 col-md-6 mb-4">
                  <div className="team-card text-center">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="team-image rounded-circle mb-3"
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                    <h4>{member.name}</h4>
                    <p className="text-primary">{member.position}</p>
                    <p className="text-muted">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="testimonials-section bg-light py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center mb-5">
                <h2 className="section-title">What Our Clients Say</h2>
              </div>
            </div>
            <div className="row">
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="col-lg-6 mb-4">
                  <div className="testimonial-card bg-white p-4 rounded shadow-sm">
                    <div className="stars mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <i key={i} className="fas fa-star text-warning"></i>
                      ))}
                    </div>
                    <p className="mb-3">"{testimonial.text}"</p>
                    <h6 className="mb-0">- {testimonial.name}</h6>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;