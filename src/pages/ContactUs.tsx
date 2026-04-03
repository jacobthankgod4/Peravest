import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const officeImages = [
    '/perazim-office-1.webp',
    '/perazim-office-2.webp'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % officeImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [officeImages.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
            created_at: new Date().toISOString()
          }
        ]);

      if (dbError) throw dbError;

      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to send email');

      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)',
      padding: '120px 20px',
      minHeight: '100vh',
      position: 'relative' as const,
      overflow: 'hidden' as const
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '80px',
      color: '#fff'
    },
    headerTitle: {
      fontSize: '48px',
      fontWeight: 700,
      marginBottom: '15px',
      letterSpacing: '-1px',
      color: '#fff'
    },
    headerText: {
      fontSize: '18px',
      color: '#a0a0b0',
      maxWidth: '500px',
      margin: '0 auto'
    },
    grid: {
      display: 'grid' as const,
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: '60px',
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative' as const,
      zIndex: 1
    },
    imageContainer: {
      position: 'relative' as const,
      borderRadius: '16px',
      overflow: 'hidden' as const,
      height: '400px',
      marginBottom: '30px'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      transition: 'transform 0.6s ease'
    },
    infoCards: {
      display: 'grid' as const,
      gap: '20px',
      marginBottom: '30px'
    },
    infoCard: {
      display: 'flex' as const,
      gap: '20px',
      padding: '24px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    cardIcon: {
      width: '50px',
      height: '50px',
      background: 'linear-gradient(135deg, #09c398 0%, #06a876 100%)',
      borderRadius: '10px',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      color: '#fff',
      fontSize: '20px',
      flexShrink: 0
    },
    cardContent: {
      color: '#fff'
    },
    cardTitle: {
      margin: '0 0 8px 0',
      fontSize: '16px',
      fontWeight: 600,
      color: '#fff'
    },
    cardText: {
      margin: 0,
      color: '#a0a0b0',
      fontSize: '14px',
      lineHeight: '1.6'
    },
    cardLink: {
      color: '#09c398',
      textDecoration: 'none',
      transition: 'color 0.3s'
    },
    mapContainer: {
      borderRadius: '12px',
      overflow: 'hidden' as const,
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
    },
    formWrapper: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '40px',
      backdropFilter: 'blur(10px)'
    },
    formGroup: {
      marginBottom: '24px'
    },
    formInput: {
      width: '100%',
      padding: '14px 18px',
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '10px',
      color: '#fff',
      fontSize: '14px',
      fontFamily: 'inherit',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box' as const
    },
    textarea: {
      width: '100%',
      padding: '14px 18px',
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '10px',
      color: '#fff',
      fontSize: '14px',
      fontFamily: 'inherit',
      transition: 'all 0.3s ease',
      minHeight: '140px',
      resize: 'vertical' as const,
      boxSizing: 'border-box' as const
    },
    alert: {
      padding: '16px 20px',
      borderRadius: '10px',
      marginBottom: '24px',
      display: 'flex' as const,
      alignItems: 'center' as const,
      gap: '12px',
      fontSize: '14px'
    },
    alertSuccess: {
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      color: '#10b981'
    },
    alertError: {
      background: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#ef4444'
    },
    submitBtn: {
      width: '100%',
      padding: '16px 24px',
      background: 'linear-gradient(135deg, #09c398 0%, #06a876 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        input::placeholder, textarea::placeholder { color: #707080; }
        input:focus, textarea:focus { outline: none; background: rgba(255, 255, 255, 0.12); border-color: #09c398; box-shadow: 0 0 0 3px rgba(9, 195, 152, 0.15); }
        input:hover, textarea:hover { border-color: rgba(9, 195, 152, 0.3); }
        button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(9, 195, 152, 0.3); }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        .info-card:hover { background: rgba(9, 195, 152, 0.1); border-color: rgba(9, 195, 152, 0.3); transform: translateY(-4px); }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .contact-header h2 { font-size: 32px !important; }
          .office-showcase { height: 300px !important; }
          .form-wrapper { padding: 30px 20px !important; }
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Get In Touch</h2>
          <p style={styles.headerText}>We're here to help. Send us a message and we'll respond within 24 hours.</p>
        </div>

        <div style={styles.grid} className="contact-grid">
          {/* Left Column */}
          <div>
            <div style={{ ...styles.imageContainer, position: 'relative', overflow: 'hidden' }}>
              <div style={{
                display: 'flex',
                height: '100%',
                transition: 'transform 0.8s ease-in-out',
                transform: `translateX(-${currentImageIndex * 100}%)`
              }}>
                {officeImages.map((img, idx) => (
                  <img key={idx} src={img} alt={`Perazim Office ${idx + 1}`} style={{ ...styles.image, minWidth: '100%', height: '100%', flexShrink: 0 }} />
                ))}
              </div>
              <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
                {officeImages.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: idx === currentImageIndex ? '#09c398' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={styles.infoCards}>
              <div style={styles.infoCard} className="info-card">
                <div style={styles.cardIcon}>
                  <i className="fas fa-map-pin"></i>
                </div>
                <div style={styles.cardContent}>
                  <h4 style={styles.cardTitle}>Location</h4>
                  <p style={styles.cardText}>154, by Dipeolu St<br />Allen bus stop, Ikeja<br />Lagos 300001, Nigeria</p>
                </div>
              </div>

              <div style={styles.infoCard} className="info-card">
                <div style={styles.cardIcon}>
                  <i className="fas fa-envelope"></i>
                </div>
                <div style={styles.cardContent}>
                  <h4 style={styles.cardTitle}>Email</h4>
                  <p style={styles.cardText}><a href="mailto:perazimproptee@gmail.com" style={styles.cardLink}>perazimproptee@gmail.com</a></p>
                </div>
              </div>

              <div style={styles.infoCard} className="info-card">
                <div style={styles.cardIcon}>
                  <i className="fas fa-phone"></i>
                </div>
                <div style={styles.cardContent}>
                  <h4 style={styles.cardTitle}>Phone</h4>
                  <p style={styles.cardText}><a href="tel:+2348109344800" style={styles.cardLink}>(+234) 810 934 4800</a></p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.formWrapper}>
            {success && (
              <div style={{ ...styles.alert, ...styles.alertSuccess }}>
                <i className="fas fa-check-circle"></i>
                <span>Message sent successfully! We'll get back to you soon.</span>
              </div>
            )}
            {error && (
              <div style={{ ...styles.alert, ...styles.alertError }}>
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Name"
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Your Email"
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Subject"
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Your Message"
                  style={styles.textarea}
                ></textarea>
              </div>

              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Sending...
                  </>
                ) : (
                  <>
                    Send Message <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Full Width Map with Directions */}
        <div style={{ ...styles.mapContainer, marginTop: '60px', width: '100%' }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.0987654321!2d3.5234!3d6.5944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b9c7c7c7c7c7d%3A0x1234567890abcdef!2s154%20Dipeolu%20St%2C%20Allen%2C%20Ikeja%20300001%2C%20Lagos!5e0!3m2!1sen!2sng!4v1234567890"
            width="100%"
            height="500"
            title="Peravest office location on Google Maps"
            style={{ border: 'none', borderRadius: '12px', display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        {/* Get Directions Button */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=154+Dipeolu+St,+Allen,+Ikeja+300001,+Lagos"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #09c398 0%, #06a876 100%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '15px',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(9, 195, 152, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(9, 195, 152, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(9, 195, 152, 0.3)';
            }}
          >
            <i className="fas fa-directions"></i> Get Directions
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
