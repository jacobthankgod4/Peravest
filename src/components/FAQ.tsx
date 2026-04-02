import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: "How does real estate investment work?",
      answer: "Real estate investment involves purchasing properties to generate rental income and capital appreciation. Our platform allows you to invest in fractional ownership of premium properties."
    },
    {
      id: 2,
      question: "What is the minimum investment amount?",
      answer: "The minimum investment amount varies by property, typically starting from ₦100,000. Each property listing shows the minimum investment required."
    },
    {
      id: 3,
      question: "How are returns calculated and paid?",
      answer: "Returns are calculated based on rental income and property appreciation. Payments are made quarterly directly to your registered bank account."
    },
    {
      id: 4,
      question: "Is my investment secure?",
      answer: "All properties are thoroughly vetted, legally documented, and insured. We provide transparent reporting and regular updates on your investments."
    },
    {
      id: 5,
      question: "Can I withdraw my investment early?",
      answer: "Investment terms vary by property. Some allow early withdrawal with penalties, while others have fixed terms. Check individual property details for specific terms."
    },
    {
      id: 6,
      question: "What documents do I need to invest?",
      answer: "You need a valid ID, bank verification number (BVN), proof of address, and bank account details. All documents can be uploaded through our secure platform."
    }
  ];

  const toggleItem = (id: number) => {
    setActiveItem(activeItem === id ? null : id);
  };

  return (
    <>
      <Helmet>
        <title>FAQ - Real Estate Investment</title>
        <meta name="description" content="Frequently asked questions about real estate investment" />
      </Helmet>

      <div className="faq-page">
        <section className="hero-section bg-primary text-white py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center">
                <h1 className="display-4 mb-4">Frequently Asked Questions</h1>
                <p className="lead">
                  Find answers to common questions about our real estate investment platform
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto">
                <div className="faq-accordion">
                  {faqItems.map((item) => (
                    <div key={item.id} className="faq-item mb-3">
                      <div className="faq-header">
                        <button
                          className={`btn btn-link w-100 text-start p-3 ${
                            activeItem === item.id ? 'active' : ''
                          }`}
                          onClick={() => toggleItem(item.id)}
                          style={{
                            textDecoration: 'none',
                            border: '1px solid #dee2e6',
                            borderRadius: '0.375rem',
                            backgroundColor: activeItem === item.id ? '#f8f9fa' : 'white'
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-dark">{item.question}</h5>
                            <i
                              className={`fas ${
                                activeItem === item.id ? 'fa-minus' : 'fa-plus'
                              } text-primary`}
                            ></i>
                          </div>
                        </button>
                      </div>
                      {activeItem === item.id && (
                        <div className="faq-content p-3 border border-top-0 rounded-bottom">
                          <p className="mb-0 text-muted">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-cta bg-light py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center">
                <h3 className="mb-3">Still have questions?</h3>
                <p className="mb-4">
                  Our team is here to help you with any additional questions about real estate investment.
                </p>
                <a href="/contact" className="btn btn-primary">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default FAQ;