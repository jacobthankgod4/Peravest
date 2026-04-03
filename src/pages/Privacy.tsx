import React from 'react';
import { Helmet } from 'react-helmet-async';

const Privacy: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Real Estate Investment</title>
        <meta name="description" content="Privacy policy for our real estate investment platform" />
      </Helmet>

      <div className="privacy-page">
        <section className="hero-section bg-primary text-white py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center">
                <h1 className="display-4 mb-4">Privacy Policy</h1>
                <p className="lead">
                  Your privacy is important to us. Learn how we collect, use, and protect your information.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="privacy-content py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto">
                <div className="content-section mb-5">
                  <h2>Information We Collect</h2>
                  <p>
                    We collect information you provide directly to us, such as when you create an account,
                    make an investment, or contact us for support. This may include:
                  </p>
                  <ul>
                    <li>Personal identification information (name, email, phone number)</li>
                    <li>Financial information (bank account details, participation preferences)</li>
                    <li>Identity verification documents</li>
                    <li>Communication records</li>
                  </ul>
                </div>

                <div className="content-section mb-5">
                  <h2>How We Use Your Information</h2>
                  <p>We use the information we collect to:</p>
                  <ul>
                    <li>Provide and maintain our cooperative participation services</li>
                    <li>Process transactions and send related information</li>
                    <li>Verify member identity and prevent fraud</li>
                    <li>Communicate with you about your account and cooperative participations</li>
                    <li>Comply with legal and regulatory requirements</li>
                  </ul>
                </div>

                <div className="content-section mb-5">
                  <h2>Information Sharing</h2>
                  <p>
                    We do not sell, trade, or otherwise transfer your personal information to third parties
                    without your consent, except in the following circumstances:
                  </p>
                  <ul>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and prevent fraud</li>
                    <li>With service providers who assist in our operations</li>
                    <li>In connection with a business transfer or merger</li>
                  </ul>
                </div>

                <div className="content-section mb-5">
                  <h2>Data Security</h2>
                  <p>
                    We implement appropriate security measures to protect your personal information against
                    unauthorized access, alteration, disclosure, or destruction. These measures include:
                  </p>
                  <ul>
                    <li>Encryption of sensitive data</li>
                    <li>Secure server infrastructure</li>
                    <li>Regular security audits</li>
                    <li>Access controls and authentication</li>
                  </ul>
                </div>

                <div className="content-section mb-5">
                  <h2>Your Rights</h2>
                  <p>You have the right to:</p>
                  <ul>
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your information</li>
                    <li>Object to processing of your information</li>
                    <li>Data portability</li>
                  </ul>
                </div>

                <div className="content-section mb-5">
                  <h2>Cookies and Tracking</h2>
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience on our platform.
                    You can control cookie settings through your browser preferences.
                  </p>
                </div>

                <div className="content-section mb-5">
                  <h2>Changes to This Policy</h2>
                  <p>
                    We may update this privacy policy from time to time. We will notify you of any changes
                    by posting the new policy on this page and updating the effective date.
                  </p>
                </div>

                <div className="content-section">
                  <h2>Contact Us</h2>
                  <p>
                    If you have any questions about this privacy policy, please contact us at:
                  </p>
                  <ul>
                    <li>Email: privacy@realestateinvestment.com</li>
                    <li>Phone: +234 123 456 7890</li>
                    <li>Address: 123 Business Street, Lagos, Nigeria</li>
                  </ul>
                </div>

                <div className="last-updated mt-4 p-3 bg-light rounded">
                  <small className="text-muted">
                    Last updated: {new Date().toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Privacy;