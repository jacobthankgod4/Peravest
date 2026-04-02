import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Real Estate Investment</title>
        <meta name="description" content="Get in touch with our real estate investment team" />
      </Helmet>

      <div className="contact-page">
        <section className="hero-section bg-primary text-white py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center">
                <h1 className="display-4 mb-4">Contact Us</h1>
                <p className="lead">
                  Get in touch with our team for any questions or investment inquiries
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-section py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8">
                <div className="contact-form bg-white p-4 rounded shadow">
                  <h3 className="mb-4">Send us a Message</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="subject" className="form-label">Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="message" className="form-label">Message</label>
                      <textarea
                        className="form-control"
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="contact-info">
                  <h3 className="mb-4">Contact Information</h3>
                  <div className="contact-item mb-4">
                    <i className="fas fa-map-marker-alt text-primary me-3"></i>
                    <div>
                      <h5>Address</h5>
                      <p>123 Business Street, Lagos, Nigeria</p>
                    </div>
                  </div>
                  <div className="contact-item mb-4">
                    <i className="fas fa-phone text-primary me-3"></i>
                    <div>
                      <h5>Phone</h5>
                      <p>+234 123 456 7890</p>
                    </div>
                  </div>
                  <div className="contact-item mb-4">
                    <i className="fas fa-envelope text-primary me-3"></i>
                    <div>
                      <h5>Email</h5>
                      <p>info@realestateinvestment.com</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-clock text-primary me-3"></i>
                    <div>
                      <h5>Business Hours</h5>
                      <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;