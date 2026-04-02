import React, { useState } from 'react';
import '../faq-modern.css';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'investment' | 'savings' | 'security' | 'account';
}

const FAQ: React.FC = () => {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      category: 'investment',
      question: "How can I start investing with just ₦5,000?",
      answer: "Simply create your free account, complete our quick KYC verification, browse our available properties, and select your investment amount starting from ₦5,000. You'll own a fraction of high-value properties and earn returns from day one."
    },
    {
      id: 2,
      category: 'investment',
      question: "What returns can I realistically expect?",
      answer: "Our properties typically generate 15-25% annual returns through rental income and capital appreciation. Returns vary by property location, type, and market conditions. All projected returns are based on thorough market analysis."
    },
    {
      id: 3,
      category: 'security',
      question: "How secure is my investment and personal data?",
      answer: "We use bank-level security with 256-bit SSL encryption. All properties are legally documented, insured, and managed by licensed professionals. Your funds are held in segregated accounts and protected by Nigerian investment regulations."
    },
    {
      id: 4,
      category: 'savings',
      question: "What's the difference between Ajo and Target Savings?",
      answer: "Ajo Savings is a community-based rotating savings where members contribute monthly and receive guaranteed payouts. Target Savings is individual goal-oriented saving with automated deposits and competitive interest rates for specific objectives."
    },
    {
      id: 5,
      category: 'investment',
      question: "Can I withdraw my investment before maturity?",
      answer: "Most investments have a minimum holding period of 6-12 months. Early withdrawal may be possible with penalties depending on the specific property terms. We recommend reviewing each investment's terms before committing."
    },
    {
      id: 6,
      category: 'account',
      question: "What documents do I need to get started?",
      answer: "You need a valid government-issued ID (NIN, Driver's License, or Passport), Bank Verification Number (BVN), proof of address, and active Nigerian bank account. All documents can be uploaded securely through our platform."
    },
    {
      id: 7,
      category: 'investment',
      question: "How are properties selected and vetted?",
      answer: "Our expert team conducts rigorous due diligence including location analysis, legal verification, market research, and financial projections. Only properties meeting our strict criteria for profitability and security are listed."
    },
    {
      id: 8,
      category: 'investment',
      question: "When and how do I receive my returns?",
      answer: "Returns are typically paid quarterly directly to your registered bank account. You'll receive detailed statements showing rental income, property appreciation, and your share of profits. Some properties may offer monthly distributions."
    },
    {
      id: 9,
      category: 'security',
      question: "What happens if a property doesn't perform as expected?",
      answer: "While we carefully vet all properties, real estate markets can fluctuate. We provide transparent reporting, professional property management, and work to optimize performance. Our diversified approach helps minimize risks."
    },
    {
      id: 10,
      category: 'account',
      question: "Are there any hidden fees or charges?",
      answer: "We believe in complete transparency. Our fees include a small management fee (typically 1-2% annually) and transaction fees clearly disclosed before investment. No hidden charges - what you see is what you pay."
    },
    {
      id: 11,
      category: 'savings',
      question: "How does the Ajo payout system work?",
      answer: "In Ajo Savings, members are assigned payout positions. If you're in a 12-member group contributing ₦10,000 monthly, you'll receive ₦120,000 when your turn comes. The system ensures everyone gets their full payout."
    },
    {
      id: 12,
      category: 'investment',
      question: "Can I invest from outside Nigeria?",
      answer: "Yes! We welcome diaspora investors. You can invest from anywhere in the world using international payment methods. However, you'll need a Nigerian bank account for receiving returns and must complete our international KYC process."
    }
  ];

  const toggleItem = (id: number) => {
    setActiveItem(activeItem === id ? null : id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'investment': return <i className="fas fa-chart-line text-success"></i>;
      case 'savings': return <i className="fas fa-piggy-bank text-primary"></i>;
      case 'security': return <i className="fas fa-shield-alt text-warning"></i>;
      case 'account': return <i className="fas fa-user-circle text-info"></i>;
      default: return <i className="fas fa-question-circle text-secondary"></i>;
    }
  };

  return (
    <div className="faq-area">
      <div className="faq-container">
        <div className="container py-5">
          <div className="faq-header">
            <h1>Frequently Asked Questions</h1>
            <p>Everything you need to know about investing with Peravest. Can't find what you're looking for? Contact our support team.</p>
          </div>

          <div className="faq-grid">
            {faqItems.map((item) => (
              <div key={item.id} className="faq-card">
                <button
                  className={`faq-question ${activeItem === item.id ? 'active' : ''}`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="d-flex align-items-center">
                    <div className="category-icon me-3">{getCategoryIcon(item.category)}</div>
                    <span>{item.question}</span>
                  </div>
                  <div className="faq-icon">
                    <i className={`fas ${activeItem === item.id ? 'fa-minus' : 'fa-plus'}`}></i>
                  </div>
                </button>
                <div className={`faq-answer ${activeItem === item.id ? 'active' : ''}`}>
                  <div className="faq-answer-content">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="faq-cta">
        <div className="container">
          <h3>Still have questions?</h3>
          <p>Our investment experts are here to help you make informed decisions</p>
          <a href="/contact" className="faq-cta-btn">
            Get In Touch <i className="fas fa-arrow-right ms-2"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;