import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSmartRouting } from '../hooks/useSmartRouting';
import Header from '../components_main/layout/Header';
import Footer from '../components_main/Footer';
import '../faq-modern.css';
import '../styles/listing-mobile.css';

interface PackageData {
  id: string;
  title: string;
  description: string;
  features: string[];
  benefits: string[];
  images: string[];
  minAmount: number;
  expectedReturn: string;
  duration: string;
  faqs: { question: string; answer: string; }[];
}

const packageData: Record<string, PackageData> = {
  'real-estate': {
    id: 'real-estate',
    title: 'Real Estate Investment',
    description: 'Ever wanted to own property but don\'t have millions of naira? With our Real Estate Investment, you can own a piece of expensive properties with just ₦5,000! We buy big properties and divide them into small shares that you can afford. You earn money from rent and when the property value increases.',
    features: [
      'Own a piece of expensive properties with small money',
      'Professional property managers handle everything',
      'Receive your share of rent money every 3 months',
      'Property value can increase over time',
      'Invest in different properties to spread risk'
    ],
    benefits: [
      'Earn 15-25% profit every year',
      'Start with as little as ₦5,000',
      'Get money without doing any work',
      'Property prices usually go up over time',
      'Experts manage the properties for you'
    ],
    images: [
      '/i/a2.jpg',
      '/i/1.jpg',
      '/i/16.jpg'
    ],
    minAmount: 5000,
    expectedReturn: '15-25%',
    duration: '12-36 months',
    faqs: [
      {
        question: 'How can I own property with just ₦5,000?',
        answer: 'We buy expensive properties (like a ₦50 million house) and divide it into 10,000 shares of ₦5,000 each. When you buy one share, you own 1/10,000 of that property. You get your share of rent and profit when we sell.'
      },
      {
        question: 'What kind of properties do you buy?',
        answer: 'We buy houses, shops, and office buildings in the best areas of Lagos, Abuja, and Port Harcourt. These are places where property values grow fast and many people want to rent.'
      },
      {
        question: 'When do I get my rent money?',
        answer: 'Every 3 months, we share the rent money among all investors based on how many shares they own. If you own 2 shares and someone owns 1 share, you get twice as much rent money as them.'
      },
      {
        question: 'Can I sell my property shares?',
        answer: 'Yes! If you need money urgently, you can sell your shares to other people on our platform. The price depends on how well the property is doing.'
      }
    ]
  },
  'ajo': {
    id: 'ajo',
    title: 'Ajo Savings',
    description: 'Remember the traditional Ajo system where you and your friends contribute money monthly and take turns collecting the total? We\'ve made it digital, safer, and more profitable! Join a group of trusted people, contribute monthly, and earn extra money while building your savings discipline.',
    features: [
      'Save money with trusted friends and family',
      'We collect your contribution automatically',
      'Choose daily, weekly, or monthly contributions',
      'Earn extra money on top of your contributions',
      'Group members encourage each other to save'
    ],
    benefits: [
      'Earn 12-18% extra money every year',
      'Learn to save money regularly',
      'Get support from your group members',
      'Choose how often you want to contribute',
      'Get emergency loans from your group savings'
    ],
    images: [
      '/i/ajo.png',
      '/i/african_woman.jpg',
      '/i/a3.jpg'
    ],
    minAmount: 5000,
    expectedReturn: '12-18%',
    duration: '6-12 months',
    faqs: [
      {
        question: 'How does the digital Ajo work?',
        answer: 'Just like traditional Ajo! You join a group of 10-20 people. Everyone contributes the same amount monthly (like ₦10,000). Each month, one person collects all the money (₦100,000-200,000). This continues until everyone has collected once.'
      },
      {
        question: 'What if someone doesn\'t pay their contribution?',
        answer: 'Don\'t worry! We have insurance that covers defaulters. Even if someone doesn\'t pay, you will still get your money when it\'s your turn. We also carefully check people before they join groups.'
      },
      {
        question: 'Can I be in multiple Ajo groups?',
        answer: 'Yes! You can join different groups with different contribution amounts. For example, you can be in a ₦5,000 monthly group and a ₦10,000 monthly group at the same time.'
      },
      {
        question: 'How do you choose group members?',
        answer: 'We check people\'s bank statements, verify their identity, and look at their savings history. You can also invite people you trust like family and friends to join your group.'
      }
    ]
  },
  'target-savings': {
    id: 'target-savings',
    title: 'Target Savings',
    description: 'Want to buy a car, build a house, or plan your dream wedding? Our Target Savings helps you save money towards any specific goal. Just tell us what you want to achieve and when, and we\'ll help you save the right amount every month to reach your target on time.',
    features: [
      'Set any savings goal (car, house, wedding, etc.)',
      'Automatic money transfer from your account',
      'See your progress with our simple dashboard',
      'Get bonus rewards when you save consistently',
      'Change your target amount anytime'
    ],
    benefits: [
      'Earn 10-15% interest on your savings yearly',
      'Build the habit of saving regularly',
      'Track how close you are to your goal',
      'Get extra money as rewards for not missing payments',
      'Take out money early if there\'s an emergency'
    ],
    images: [
      '/i/target_savings.png',
      '/i/a2.jpg',
      '/i/african_woman.jpg'
    ],
    minAmount: 5000,
    expectedReturn: '10-15%',
    duration: '3-24 months',
    faqs: [
      {
        question: 'How do I set up a target savings goal?',
        answer: 'It\'s very simple! Just tell us how much money you want to save (like ₦500,000 for a car) and when you want to reach this goal (like in 12 months). We will calculate how much you need to save each month (about ₦42,000) and automatically collect it from your account.'
      },
      {
        question: 'Can I change my savings target later?',
        answer: 'Yes, you can! If you want to save more money or change your deadline, just let us know. We will recalculate how much you need to save each month and adjust your plan accordingly.'
      },
      {
        question: 'What happens if I miss a monthly payment?',
        answer: 'Don\'t worry! You have 7 days to make the payment without any penalty. If you still can\'t pay, we will either extend your target date or suggest increasing your future monthly savings to stay on track.'
      },
      {
        question: 'Can I collect my money before reaching my target?',
        answer: 'Yes, but you might earn less interest if you withdraw early. However, if it\'s an emergency, you can always access your money. We understand that life happens!'
      },
      {
        question: 'How is my money kept safe?',
        answer: 'Your money is kept in secure, regulated bank accounts. We use the same security standards as major Nigerian banks, with 256-bit encryption and are regulated by relevant financial authorities.'
      },
      {
        question: 'What documents do I need to start?',
        answer: 'You need a valid ID (NIN, driver\'s license, or passport), your BVN, and a Nigerian bank account. The whole process takes less than 5 minutes to complete online.'
      },
      {
        question: 'Can I have multiple savings goals?',
        answer: 'Absolutely! You can save for your car, house, wedding, and vacation all at the same time. Each goal will have its own savings plan and timeline.'
      },
      {
        question: 'What if I want to save more than planned?',
        answer: 'Great! You can increase your monthly savings anytime. This will help you reach your goal faster or save more than your original target.'
      }
    ]
  },
  'safelock': {
    id: 'safelock',
    title: 'SafeLock',
    description: 'Do you find it hard to save money because you always spend it on other things? SafeLock is perfect for you! We lock your money away for a chosen period (6-12 months) so you can\'t touch it. In return, we give you very high interest rates. It\'s like putting your money in a safe that only opens after the agreed time.',
    features: [
      'Lock your money for 6-12 months',
      'Get guaranteed high interest rates',
      'No way to withdraw money early (helps you save!)',
      'Your money grows automatically',
      'Earn compound interest (interest on your interest)'
    ],
    benefits: [
      'Earn 18-25% guaranteed profit every year',
      'Your returns are guaranteed, no market risk',
      'Forces you to save without temptation',
      'Your money grows faster with compound interest',
      'No risk of losing money'
    ],
    images: [
      '/i/secure.png',
      '/i/trans.png',
      '/i/african_woman.jpg'
    ],
    minAmount: 5000,
    expectedReturn: '18-25%',
    duration: '6-12 months',
    faqs: [
      {
        question: 'Why is SafeLock different from regular savings?',
        answer: 'With regular savings, you can withdraw your money anytime, so you might spend it on other things. With SafeLock, your money is completely locked away, so you can\'t touch it. This helps you save and we reward you with much higher interest rates.'
      },
      {
        question: 'What if I have an emergency and need the money?',
        answer: 'Unfortunately, SafeLock money cannot be withdrawn for any reason until the time is up. That\'s why we recommend keeping some emergency money in other flexible savings accounts before using SafeLock.'
      },
      {
        question: 'How do you calculate my returns?',
        answer: 'We calculate your interest every day and add it to your account every month. This means you earn interest on your original money plus the interest we\'ve already added. This is called compound interest and it makes your money grow faster.'
      },
      {
        question: 'Can I add more money to my SafeLock account?',
        answer: 'No, you cannot add money to an existing SafeLock. But you can create a new SafeLock account with different money and different time periods. Each SafeLock account is separate.'
      }
    ]
  }
};

const PackageDetail: React.FC = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const { handleFeatureClick } = useSmartRouting();

  const packageInfo = packageId ? packageData[packageId] : null;

  if (!packageInfo) {
    return (
      <div className="container py-5 text-center">
        <h2>Package not found</h2>
        <Link to="/" className="theme-btn">Back to Home</Link>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div style={{ background: 'linear-gradient(135deg, #0e2e50 0%, #09c398 100%)', minHeight: '100vh' }}>
      {/* Ultra Modern Hero Section */}
      <section style={{ 
        background: '#0e2e50',
        padding: '120px 0 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div style={{ marginBottom: '2rem' }}>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '8px 20px',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backdropFilter: 'blur(10px)'
                }}>
                  {packageInfo.expectedReturn} Annual Returns
                </span>
              </div>
              
              <h1 style={{
                color: '#fff',
                fontSize: '3.5rem',
                fontWeight: '700',
                lineHeight: '1.2',
                marginBottom: '1.5rem',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}>
                {packageInfo.title}
              </h1>
              
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1.2rem',
                lineHeight: '1.6',
                marginBottom: '2.5rem',
                maxWidth: '500px'
              }}>
                {packageInfo.description}
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => handleFeatureClick(packageInfo.id as any)}
                  style={{
                    background: '#09c398',
                    color: '#fff',
                    border: 'none',
                    padding: '18px 35px',
                    borderRadius: '50px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 15px 40px rgba(9, 195, 152, 0.5)',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)',
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(9, 195, 152, 0.7)';
                    e.currentTarget.style.background = '#0bb8a6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(9, 195, 152, 0.5)';
                    e.currentTarget.style.background = '#09c398';
                  }}
                >
                  Start Investing Now
                </button>
                
                <Link 
                  to="/contact" 
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    padding: '13px 28px',
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                >
                  Learn More
                </Link>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
                transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)'
              }}>
                <img 
                  src={packageInfo.images[activeImageIndex]} 
                  alt={packageInfo.title}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    transition: 'all 0.5s ease'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Content Section */}
      <section style={{ background: '#f8fafc', padding: '80px 0' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* How It Works Section */}
              <div style={{ marginBottom: '4rem' }}>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#0e2e50',
                  marginBottom: '2rem'
                }}>How It Works</h3>
                <div className="row g-4">
                  <div className="col-md-3">
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem 1rem',
                      borderRadius: '15px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      height: '100%'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: '#09c398',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: '#fff',
                        fontSize: '24px'
                      }}>
                        <i className="fas fa-user-plus"></i>
                      </div>
                      <h5 style={{ color: '#0e2e50', marginBottom: '1rem' }}>Sign Up</h5>
                      <p style={{ color: '#64748b', fontSize: '14px' }}>Create your account in less than 2 minutes with just your phone number</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem 1rem',
                      borderRadius: '15px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      height: '100%'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: '#09c398',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: '#fff',
                        fontSize: '24px'
                      }}>
                        <i className="fas fa-wallet"></i>
                      </div>
                      <h5 style={{ color: '#0e2e50', marginBottom: '1rem' }}>Fund Wallet</h5>
                      <p style={{ color: '#64748b', fontSize: '14px' }}>Add money to your wallet using bank transfer or debit card</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem 1rem',
                      borderRadius: '15px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      height: '100%'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: '#09c398',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: '#fff',
                        fontSize: '24px'
                      }}>
                        <i className="fas fa-chart-line"></i>
                      </div>
                      <h5 style={{ color: '#0e2e50', marginBottom: '1rem' }}>Start Investing</h5>
                      <p style={{ color: '#64748b', fontSize: '14px' }}>Choose your investment amount and watch your money grow</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem 1rem',
                      borderRadius: '15px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      height: '100%'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: '#09c398',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: '#fff',
                        fontSize: '24px'
                      }}>
                        <i className="fas fa-money-bill-wave"></i>
                      </div>
                      <h5 style={{ color: '#0e2e50', marginBottom: '1rem' }}>Earn Returns</h5>
                      <p style={{ color: '#64748b', fontSize: '14px' }}>Get your profits and withdraw anytime you want</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Product Description */}
              <div className="mb-5">
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body p-4">
                        {packageInfo.id === 'target-savings' && (
                          <div>
                            <h4 className="mb-4">What is Target Savings?</h4>
                            <p className="lead mb-4">Target Savings is your personal savings assistant that helps you save money for specific goals. Whether you want to buy a car, pay for your wedding, build a house, or go on vacation, we make it easy to reach your financial targets.</p>
                            
                            <h5 className="mb-3">How Target Savings Works:</h5>
                            <div className="row mb-4">
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>1</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Set Your Goal</h6>
                                    <p className="mb-0">Tell us what you're saving for and how much you need</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>2</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Choose Timeline</h6>
                                    <p className="mb-0">Pick when you want to reach your goal</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>3</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Auto-Save</h6>
                                    <p className="mb-0">We automatically save the right amount for you</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>4</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Earn Interest</h6>
                                    <p className="mb-0">Your money grows with 10-15% annual interest</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-light p-4 rounded mb-4">
                              <h5 className="mb-3">Real Example: Saving for a Car</h5>
                              <p><strong>Goal:</strong> Buy a Toyota Camry worth ₦8,000,000</p>
                              <p><strong>Timeline:</strong> 2 years (24 months)</p>
                              <p><strong>Monthly savings needed:</strong> ₦8,000,000 ÷ 24 = ₦333,333</p>
                              <p><strong>With 12% annual interest:</strong> You'll actually need to save less because your money grows!</p>
                              <p><strong>What happens:</strong></p>
                              <ul>
                                <li>Every month, we take ₦320,000 from your account automatically</li>
                                <li>Your money earns 12% interest annually</li>
                                <li>After 24 months, you'll have over ₦8,000,000 for your car</li>
                                <li>You save ₦13,333 monthly because of the interest earned!</li>
                              </ul>
                            </div>

                            <h5 className="mb-3">Why Target Savings is Perfect for You:</h5>
                            <div className="row">
                              <div className="col-md-6">
                                <ul>
                                  <li><strong>No Temptation:</strong> Money is automatically saved, so you can't spend it on other things</li>
                                  <li><strong>Flexible Goals:</strong> Save for anything - car, house, wedding, vacation, business</li>
                                  <li><strong>Smart Calculation:</strong> We do the math for you</li>
                                </ul>
                              </div>
                              <div className="col-md-6">
                                <ul>
                                  <li><strong>Earn While You Save:</strong> 10-15% annual interest on your savings</li>
                                  <li><strong>Track Progress:</strong> See how close you are to your goal</li>
                                  <li><strong>Emergency Access:</strong> Withdraw if there's a real emergency</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {packageInfo.id === 'real-estate' && (
                          <div>
                            <h4 className="mb-4">What is Real Estate Investment?</h4>
                            <p className="lead mb-4">Real Estate Investment lets you own expensive properties with small money. Instead of needing millions to buy a house, you can own a piece of valuable properties starting with just ₦5,000. You earn money from rent and property value increases.</p>
                            
                            <h5 className="mb-3">How Real Estate Investment Works:</h5>
                            <div className="row mb-4">
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>1</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>We Buy Properties</h6>
                                    <p className="mb-0">We purchase expensive properties in prime locations</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>2</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Divide into Shares</h6>
                                    <p className="mb-0">Break properties into affordable shares you can buy</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>3</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>You Buy Shares</h6>
                                    <p className="mb-0">Purchase as many shares as you can afford</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>4</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Earn Returns</h6>
                                    <p className="mb-0">Get your share of rent + property value growth</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-light p-4 rounded mb-4">
                              <h5 className="mb-3">Real Example: Lekki Property Investment</h5>
                              <p><strong>Property:</strong> 4-bedroom duplex in Lekki Phase 1, Lagos</p>
                              <p><strong>Property Value:</strong> ₦100,000,000</p>
                              <p><strong>Divided into:</strong> 20,000 shares at ₦5,000 each</p>
                              <p><strong>You buy:</strong> 20 shares for ₦100,000 (0.1% ownership)</p>
                              <p><strong>Monthly rent:</strong> ₦1,500,000</p>
                              <p><strong>Your monthly rent share:</strong> ₦1,500 (₦18,000 yearly)</p>
                              <p><strong>After 3 years:</strong></p>
                              <ul>
                                <li>Rent earned: ₦54,000</li>
                                <li>Property value increases to ₦130,000,000</li>
                                <li>Your shares now worth: ₦130,000</li>
                                <li><strong>Total return: ₦84,000 profit on ₦100,000 investment (84% return!)</strong></li>
                              </ul>
                            </div>

                            <h5 className="mb-3">Why Real Estate Investment Works:</h5>
                            <div className="row">
                              <div className="col-md-6">
                                <ul>
                                  <li><strong>Prime Locations:</strong> We buy in areas where property values grow fast</li>
                                  <li><strong>Professional Management:</strong> We handle tenants, maintenance, everything</li>
                                  <li><strong>Passive Income:</strong> Earn money without doing any work</li>
                                </ul>
                              </div>
                              <div className="col-md-6">
                                <ul>
                                  <li><strong>Low Entry:</strong> Start with just ₦5,000</li>
                                  <li><strong>Diversification:</strong> Own pieces of multiple properties</li>
                                  <li><strong>Liquidity:</strong> Sell your shares anytime on our platform</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {packageInfo.id === 'ajo' && (
                          <div>
                            <h4 className="mb-4">What is Ajo Savings?</h4>
                            <p className="lead mb-4">Ajo Savings is the digital version of the traditional Nigerian Ajo system. Join a group of trusted people, contribute money regularly, and take turns collecting the total contributions. It's a proven way to save money and get large sums when you need them.</p>
                            
                            <h5 className="mb-3">How Ajo Savings Works:</h5>
                            <div className="row mb-4">
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>1</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Join a Group</h6>
                                    <p className="mb-0">We match you with 10-20 verified, trustworthy people</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>2</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Set Contribution</h6>
                                    <p className="mb-0">Everyone agrees on the same monthly amount</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>3</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Auto-Contribute</h6>
                                    <p className="mb-0">We collect your contribution automatically each month</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>4</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Take Turns</h6>
                                    <p className="mb-0">Each month, one person gets all contributions + interest</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-light p-4 rounded mb-4">
                              <h5 className="mb-3">Real Example: 15-Person Ajo Group</h5>
                              <p><strong>Group Size:</strong> 15 people</p>
                              <p><strong>Monthly Contribution:</strong> ₦50,000 per person</p>
                              <p><strong>Total Pool:</strong> ₦750,000 monthly</p>
                              <p><strong>Your Position:</strong> 8th to collect</p>
                              <p><strong>Timeline:</strong></p>
                              <ul>
                                <li><strong>Months 1-7:</strong> You pay ₦50,000 monthly (₦350,000 total)</li>
                                <li><strong>Month 8:</strong> You receive ₦750,000 + 15% interest = ₦862,500</li>
                                <li><strong>Months 9-15:</strong> You continue paying ₦50,000 monthly (₦350,000 more)</li>
                                <li><strong>Total paid:</strong> ₦700,000</li>
                                <li><strong>Total received:</strong> ₦862,500</li>
                                <li><strong>Your profit:</strong> ₦162,500 (23% return!)</li>
                              </ul>
                              <p><strong>Best part:</strong> In month 8, you get ₦862,500 to use for business, emergency, or investment!</p>
                            </div>

                            <h5 className="mb-3">Why Ajo Savings is Powerful:</h5>
                            <div className="row">
                              <div className="col-md-6">
                                <ul>
                                  <li><strong>Large Lump Sum:</strong> Get big money when you need it most</li>
                                  <li><strong>Forced Savings:</strong> You must contribute, so you save consistently</li>
                                  <li><strong>Community Support:</strong> Group members encourage each other</li>
                                </ul>
                              </div>
                              <div className="col-md-6">
                                <ul>
                                  <li><strong>Insurance Protected:</strong> We cover defaulters so you always get paid</li>
                                  <li><strong>Verified Members:</strong> We check everyone's background</li>
                                  <li><strong>Multiple Groups:</strong> Join different groups with different amounts</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {packageInfo.id === 'safelock' && (
                          <div>
                            <h4 className="mb-4">What is SafeLock?</h4>
                            <p className="lead mb-4">SafeLock is for people who find it hard to save because they always spend their money on other things. We lock your money away for 6-12 months so you can't touch it, and in return, we give you the highest interest rates available - up to 25% annually.</p>
                            
                            <h5 className="mb-3">How SafeLock Works:</h5>
                            <div className="row mb-4">
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>1</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Choose Amount</h6>
                                    <p className="mb-0">Decide how much money you want to lock away</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>2</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Pick Duration</h6>
                                    <p className="mb-0">Choose 6 months or 12 months lock period</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>3</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Money is Locked</h6>
                                    <p className="mb-0">Your money is completely inaccessible until maturity</p>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="d-flex mb-3">
                                  <div className="flex-shrink-0">
                                    <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '14px'}}>4</div>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6>Earn High Interest</h6>
                                    <p className="mb-0">Get 18-25% annual returns, compounded monthly</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="bg-light p-4 rounded mb-4">
                              <h5 className="mb-3">Real Example: 12-Month SafeLock</h5>
                              <p><strong>Amount Locked:</strong> ₦500,000</p>
                              <p><strong>Duration:</strong> 12 months</p>
                              <p><strong>Interest Rate:</strong> 22% annually</p>
                              <p><strong>Monthly Growth:</strong></p>
                              <ul>
                                <li><strong>Month 1:</strong> ₦500,000</li>
                                <li><strong>Month 3:</strong> ₦527,000 (compound interest working)</li>
                                <li><strong>Month 6:</strong> ₦557,000</li>
                                <li><strong>Month 9:</strong> ₦589,000</li>
                                <li><strong>Month 12:</strong> ₦622,000</li>
                              </ul>
                              <p><strong>Total Return:</strong> ₦122,000 profit (24.4% return)</p>
                              <p><strong>Why it works:</strong> Because you can't withdraw, we invest your money in high-return, safe investments and share the profits with you.</p>
                            </div>

                            <h5 className="mb-3">Who Should Use SafeLock:</h5>
                            <div className="row">
                              <div className="col-md-6">
                                <ul>
                                  <li><strong>Impulse Spenders:</strong> People who spend money as soon as they have it</li>
                                  <li><strong>Goal Savers:</strong> Saving for something specific in 6-12 months</li>
                                  <li><strong>High Return Seekers:</strong> Want the best interest rates available</li>
                                </ul>
                              </div>
                              <div className="col-md-6">
                                <ul>
                                  <li><strong>Disciplined Savers:</strong> Want to force themselves to save</li>
                                  <li><strong>Risk-Averse:</strong> Want guaranteed returns with no market risk</li>
                                  <li><strong>Long-term Planners:</strong> Have emergency funds elsewhere</li>
                                </ul>
                              </div>
                            </div>
                            
                            <div className="alert alert-warning mt-3">
                              <strong>Important:</strong> SafeLock money cannot be withdrawn for ANY reason until maturity. Make sure you have emergency funds in other accounts before using SafeLock.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-5">
                <h3 className="mb-4">Key Features</h3>
                <div className="row">
                  {packageInfo.features.map((feature, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-check-circle text-success me-3"></i>
                        <span>{feature}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-5">
                <h3 className="mb-4">Benefits</h3>
                <div className="row">
                  {packageInfo.benefits.map((benefit, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-star text-warning me-3"></i>
                        <span>{benefit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="mb-5">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <h3 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#0e2e50',
                    marginBottom: '1rem'
                  }}>Frequently Asked Questions</h3>
                  <p style={{ color: '#64748b', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Everything you need to know about {packageInfo.title.toLowerCase()}
                  </p>
                </div>
                
                <div className="row justify-content-center">
                  <div className="col-lg-10">
                    <div className="row">
                      <div className="col-md-6">
                        {packageInfo.faqs.slice(0, Math.ceil(packageInfo.faqs.length / 2)).map((faq, index) => (
                          <div key={index} style={{
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                            borderRadius: '20px',
                            marginBottom: '1.5rem',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.3s ease'
                          }}>
                            <button
                              style={{
                                width: '100%',
                                padding: '2rem',
                                background: 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#0e2e50',
                                transition: 'all 0.3s ease'
                              }}
                              onClick={() => setActiveFaqIndex(activeFaqIndex === index ? null : index)}
                              onMouseEnter={(e) => {
                                e.currentTarget.parentElement.style.transform = 'translateY(-5px)';
                                e.currentTarget.parentElement.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.parentElement.style.transform = 'translateY(0)';
                                e.currentTarget.parentElement.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
                              }}
                            >
                              <span style={{ flex: 1, paddingRight: '1rem' }}>{faq.question}</span>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: activeFaqIndex === index ? '#09c398' : '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                              }}>
                                <i className={`fas ${activeFaqIndex === index ? 'fa-minus' : 'fa-plus'}`} 
                                   style={{ color: activeFaqIndex === index ? '#fff' : '#64748b', fontSize: '14px' }}></i>
                              </div>
                            </button>
                            {activeFaqIndex === index && (
                              <div style={{
                                padding: '0 2rem 2rem',
                                color: '#64748b',
                                lineHeight: '1.7',
                                fontSize: '16px',
                                animation: 'fadeIn 0.3s ease'
                              }}>
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="col-md-6">
                        {packageInfo.faqs.slice(Math.ceil(packageInfo.faqs.length / 2)).map((faq, index) => {
                          const actualIndex = index + Math.ceil(packageInfo.faqs.length / 2);
                          return (
                            <div key={actualIndex} style={{
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                              borderRadius: '20px',
                              marginBottom: '1.5rem',
                              border: '1px solid #e2e8f0',
                              overflow: 'hidden',
                              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                              transition: 'all 0.3s ease'
                            }}>
                              <button
                                style={{
                                  width: '100%',
                                  padding: '2rem',
                                  background: 'transparent',
                                  border: 'none',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '18px',
                                  fontWeight: '600',
                                  color: '#0e2e50',
                                  transition: 'all 0.3s ease'
                                }}
                                onClick={() => setActiveFaqIndex(activeFaqIndex === actualIndex ? null : actualIndex)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.parentElement.style.transform = 'translateY(-5px)';
                                  e.currentTarget.parentElement.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.12)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.parentElement.style.transform = 'translateY(0)';
                                  e.currentTarget.parentElement.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
                                }}
                              >
                                <span style={{ flex: 1, paddingRight: '1rem' }}>{faq.question}</span>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  background: activeFaqIndex === actualIndex ? '#09c398' : '#f1f5f9',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.3s ease'
                                }}>
                                  <i className={`fas ${activeFaqIndex === actualIndex ? 'fa-minus' : 'fa-plus'}`} 
                                     style={{ color: activeFaqIndex === actualIndex ? '#fff' : '#64748b', fontSize: '14px' }}></i>
                                </div>
                              </button>
                              {activeFaqIndex === actualIndex && (
                                <div style={{
                                  padding: '0 2rem 2rem',
                                  color: '#64748b',
                                  lineHeight: '1.7',
                                  fontSize: '16px',
                                  animation: 'fadeIn 0.3s ease'
                                }}>
                                  {faq.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ultra Modern Sidebar */}
            <div className="col-lg-4">
              <div style={{
                position: 'sticky',
                top: '100px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(226, 232, 240, 0.8)'
              }}>
                <h5 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#0e2e50',
                  marginBottom: '2rem',
                  textAlign: 'center'
                }}>Investment Summary</h5>
                
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Minimum Investment</div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0e2e50' }}>₦{packageInfo.minAmount.toLocaleString()}</div>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ color: '#059669', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Expected Returns</div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#065f46' }}>{packageInfo.expectedReturn}</div>
                    <div style={{ color: '#059669', fontSize: '0.8rem' }}>per annum</div>
                  </div>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: '15px',
                    padding: '1.5rem'
                  }}>
                    <div style={{ color: '#d97706', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Investment Duration</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#92400e' }}>{packageInfo.duration}</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleFeatureClick(packageInfo.id as any)}
                  style={{
                    width: '100%',
                    background: '#09c398',
                    color: '#fff',
                    border: 'none',
                    padding: '18px',
                    borderRadius: '15px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    boxShadow: '0 15px 40px rgba(9, 195, 152, 0.4)',
                    transition: 'all 0.3s ease',
                    minHeight: '60px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(9, 195, 152, 0.6)';
                    e.currentTarget.style.background = '#0bb8a6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(9, 195, 152, 0.4)';
                    e.currentTarget.style.background = '#09c398';
                  }}
                >
                  Start Investing Now
                </button>
                
                <Link 
                  to="/contact" 
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    background: 'transparent',
                    color: '#64748b',
                    border: '2px solid #e2e8f0',
                    padding: '13px',
                    borderRadius: '15px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#09c398';
                    e.currentTarget.style.color = '#09c398';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#64748b';
                  }}
                >
                  Get More Information
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default PackageDetail;