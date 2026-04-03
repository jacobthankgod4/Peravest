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
          <h2>2. Cooperative Participation Terms</h2>
          <p>PeraVest operates as a cooperative platform. All member participations are subject to market risks and cooperative operations. Past performance does not guarantee future member benefits.</p>
          <ul>
            <li>Minimum participation amount applies</li>
            <li>Participation duration is fixed as per cooperative project terms</li>
            <li>Member benefits are calculated based on cooperative project performance and surplus allocation</li>
            <li>Member benefits are NOT guaranteed</li>
          </ul>
        </section>

        <section>
          <h2>3. Important Cooperative Notice</h2>
          <p><strong>PeraVest is a cooperative platform. Member participations are NOT investments and are NOT regulated by the SEC.</strong></p>
          <p>By participating in PeraVest, you acknowledge:</p>
          <ul>
            <li>This is a cooperative venture, not a securities investment</li>
            <li>You are a cooperative member, not an investor</li>
            <li>Member benefits are NOT guaranteed and depend on project performance</li>
            <li>You participate at your own risk</li>
            <li>PeraVest is not regulated by the SEC</li>
            <li>Cooperative surplus is distributed per cooperative bylaws</li>
          </ul>
        </section>

        <section>
          <h2>4. Withdrawal Policy</h2>
          <p>Withdrawals are processed within 3-5 business days. Minimum withdrawal amount and fees may apply.</p>
        </section>

        <section>
          <h2>5. User Responsibilities</h2>
          <ul>
            <li>Maintain account security</li>
            <li>Provide accurate information</li>
            <li>Comply with all applicable laws</li>
          </ul>
        </section>

        <section>
          <h2>6. Limitation of Liability</h2>
          <p>The cooperative is not liable for losses from member participations. Members participate at their own risk. This is a cooperative venture, not a guaranteed investment product.</p>
        </section>

        <section>
          <h2>7. Modifications</h2>
          <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of modified terms.</p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>For questions about these terms, contact us at support@example.com</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
