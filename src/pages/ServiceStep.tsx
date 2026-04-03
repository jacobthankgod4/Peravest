import React from 'react';

interface ServiceStepProps {
  step: {
    number: number;
    title: string;
    description: string;
  };
  delay: number;
}

const ServiceStep: React.FC<ServiceStepProps> = ({ step, delay }) => {
  return (
    <div 
      className="service-item wow fadeInUp"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="service-icon p-3 text-white" style={{ fontSize: '40px' }}>
        {step.number}.
      </div>
      <div className="service-content">
        <h3 className="service-title">
          <span>{step.title}</span>
        </h3>
        <p className="service-text">{step.description}</p>
        <div className="service-arrow">
          <span><i className="far fa-arrow-right"></i></span>
        </div>
      </div>
    </div>
  );
};

export default ServiceStep;
