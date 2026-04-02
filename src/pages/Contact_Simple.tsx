import React, { useState } from 'react';
import Breadcrumb from './Breadcrumb';

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
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <Breadcrumb 
        title="Contact Us" 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Contact', active: true }
        ]} 
      />

      <div className="contact-area py-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="contact-form">
                <div className="contact-form-header">
                  <h2>Get In Touch</h2>
                  <p>Send us a message and we'll respond as soon as possible</p>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="Your Email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      placeholder="Your Subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      name="message"
                      className="form-control"
                      rows={5}
                      placeholder="Write Your Message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="theme-btn" disabled={loading}>
                    <i className="far fa-paper-plane"></i>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="contact-info">
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <i className="far fa-map"></i>
                  </div>
                  <div className="contact-info-content">
                    <h5>Our Address</h5>
                    <p>123 Business Street, Lagos, Nigeria</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <i className="far fa-phone"></i>
                  </div>
                  <div className="contact-info-content">
                    <h5>Call Us</h5>
                    <p>+234 123 456 7890</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <i className="far fa-envelope"></i>
                  </div>
                  <div className="contact-info-content">
                    <h5>Email Us</h5>
                    <p>info@peravest.com</p>
                  </div>
                </div>
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <i className="far fa-clock"></i>
                  </div>
                  <div className="contact-info-content">
                    <h5>Open Hours</h5>
                    <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;