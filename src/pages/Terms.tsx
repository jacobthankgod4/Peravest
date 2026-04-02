import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="terms-page">
      <div className="container">
        <h1>Terms and Conditions</h1>
        
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </section>

        <section>
          <h2>2. Investment Terms</h2>
          <p>All investments are subject to market risks. Past performance does not guarantee future returns.</p>
          <ul>
            <li>Minimum investment amount applies</li>
            <li>Investment duration is fixed as per property terms</li>
            <li>ROI is calculated based on property performance</li>
          </ul>
        </section>

        <section>
          <h2>3. Withdrawal Policy</h2>
          <p>Withdrawals are processed within 3-5 business days. Minimum withdrawal amount and fees may apply.</p>
        </section>

        <section>
          <h2>4. User Responsibilities</h2>
          <ul>
            <li>Maintain account security</li>
            <li>Provide accurate information</li>
            <li>Comply with all applicable laws</li>
          </ul>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>The platform is not liable for any losses incurred from investments. Users invest at their own risk.</p>
        </section>

        <section>
          <h2>6. Modifications</h2>
          <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of modified terms.</p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>For questions about these terms, contact us at support@example.com</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
