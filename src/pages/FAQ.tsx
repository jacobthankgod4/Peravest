import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components_main/Layout';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'investment' | 'savings' | 'security' | 'account';
}

const FAQ: React.FC = () => {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    { id: 1, category: 'investment', question: "How can I start investing with just ₦5,000?", answer: "Simply create your free account, complete our quick KYC verification, browse our available properties, and select your investment amount starting from ₦5,000. You'll own a fraction of high-value properties and earn returns from day one." },
    { id: 2, category: 'investment', question: "What returns can I realistically expect?", answer: "Our properties typically generate 15-25% annual returns through rental income and capital appreciation. Returns vary by property location, type, and market conditions. All projected returns are based on thorough market analysis." },
    { id: 3, category: 'security', question: "How secure is my investment and personal data?", answer: "We use bank-level security with 256-bit SSL encryption. All properties are legally documented, insured, and managed by licensed professionals. Your funds are held in segregated accounts and protected by Nigerian investment regulations." },
    { id: 4, category: 'savings', question: "What's the difference between Ajo and Target Savings?", answer: "Ajo Savings is a community-based rotating savings where members contribute monthly and receive guaranteed payouts. Target Savings is individual goal-oriented saving with automated deposits and competitive interest rates for specific objectives." },
    { id: 5, category: 'investment', question: "Can I withdraw my investment before maturity?", answer: "Most investments have a minimum holding period of 6-12 months. Early withdrawal may be possible with penalties depending on the specific property terms. We recommend reviewing each investment's terms before committing." },
    { id: 6, category: 'account', question: "What documents do I need to get started?", answer: "You need a valid government-issued ID (NIN, Driver's License, or Passport), Bank Verification Number (BVN), proof of address, and active Nigerian bank account. All documents can be uploaded securely through our platform." },
    { id: 7, category: 'investment', question: "How are properties selected and vetted?", answer: "Our expert team conducts rigorous due diligence including location analysis, legal verification, market research, and financial projections. Only properties meeting our strict criteria for profitability and security are listed." },
    { id: 8, category: 'investment', question: "When and how do I receive my returns?", answer: "Returns are typically paid quarterly directly to your registered bank account. You'll receive detailed statements showing rental income, property appreciation, and your share of profits. Some properties may offer monthly distributions." },
    { id: 9, category: 'security', question: "What happens if a property doesn't perform as expected?", answer: "While we carefully vet all properties, real estate markets can fluctuate. We provide transparent reporting, professional property management, and work to optimize performance. Our diversified approach helps minimize risks." },
    { id: 10, category: 'account', question: "Are there any hidden fees or charges?", answer: "We believe in complete transparency. Our fees include a small management fee (typically 1-2% annually) and transaction fees clearly disclosed before investment. No hidden charges - what you see is what you pay." },
    { id: 11, category: 'savings', question: "How does the Ajo payout system work?", answer: "In Ajo Savings, members are assigned payout positions. If you're in a 12-member group contributing ₦10,000 monthly, you'll receive ₦120,000 when your turn comes. The system ensures everyone gets their full payout." },
    { id: 12, category: 'investment', question: "Can I invest from outside Nigeria?", answer: "Yes! We welcome diaspora investors. You can invest from anywhere in the world using international payment methods. However, you'll need a Nigerian bank account for receiving returns and must complete our international KYC process." }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'investment': return '#09c398';
      case 'savings': return '#3b82f6';
      case 'security': return '#f59e0b';
      case 'account': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  return (
    <Layout title="FAQ - Peravest">
      <main style={{ background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)', minHeight: '100vh', padding: '80px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 style={{ color: '#fff', fontSize: '42px', fontWeight: 700, margin: '0 0 15px 0' }}>Frequently Asked Questions</h1>
            <p style={{ color: '#a0a0b0', fontSize: '16px', margin: 0 }}>Everything you need to know about investing with Peravest</p>
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            {faqItems.map((item) => (
              <div key={item.id} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', overflow: 'hidden', backdropFilter: 'blur(10px)', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}>
                <button onClick={() => setActiveItem(activeItem === item.id ? null : item.id)} style={{ width: '100%', padding: '20px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, textAlign: 'left' }}>
                    <div style={{ width: '40px', height: '40px', background: `${getCategoryColor(item.category)}20`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`fas ${item.category === 'investment' ? 'fa-chart-line' : item.category === 'savings' ? 'fa-piggy-bank' : item.category === 'security' ? 'fa-shield-alt' : 'fa-user-circle'}`} style={{ color: getCategoryColor(item.category), fontSize: '18px' }}></i>
                    </div>
                    <span style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>{item.question}</span>
                  </div>
                  <i className={`fas ${activeItem === item.id ? 'fa-minus' : 'fa-plus'}`} style={{ color: '#09c398', fontSize: '18px', flexShrink: 0 }}></i>
                </button>
                {activeItem === item.id && (
                  <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', color: '#a0a0b0', fontSize: '14px', lineHeight: '1.6' }}>
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(9, 195, 152, 0.1)', border: '1px solid rgba(9, 195, 152, 0.3)', borderRadius: '12px', padding: '40px', textAlign: 'center', marginTop: '60px' }}>
            <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, margin: '0 0 10px 0' }}>Still have questions?</h3>
            <p style={{ color: '#a0a0b0', fontSize: '14px', margin: '0 0 20px 0' }}>Our investment experts are here to help you make informed decisions</p>
            <Link to="/contact" style={{ display: 'inline-block', padding: '12px 32px', background: 'linear-gradient(135deg, #09c398 0%, #06a876 100%)', color: '#fff', textDecoration: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(9, 195, 152, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              Get In Touch <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default FAQ;
