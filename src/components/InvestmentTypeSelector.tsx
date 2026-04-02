import React from 'react';

interface InvestmentTypeSelectorProps {
  selectedType: 'Real Estate' | 'Agriculture';
  onTypeChange: (type: 'Real Estate' | 'Agriculture') => void;
}

const InvestmentTypeSelector: React.FC<InvestmentTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h5 style={{ marginBottom: '1rem', color: '#0e2e50' }}>What type of investment are you creating?</h5>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        
        {/* Real Estate Card */}
        <div
          onClick={() => onTypeChange('Real Estate')}
          style={{
            border: selectedType === 'Real Estate' ? '3px solid #0e2e50' : '2px solid #ddd',
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.3s',
            backgroundColor: selectedType === 'Real Estate' ? '#e8f0f7' : '#fff',
            boxShadow: selectedType === 'Real Estate' ? '0 4px 12px rgba(14, 46, 80, 0.2)' : '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          <i className="fas fa-home" style={{ fontSize: '3rem', color: '#0e2e50', marginBottom: '0.5rem' }}></i>
          <h6 style={{ fontWeight: 'bold', color: '#0e2e50', marginBottom: '0.5rem' }}>Real Estate</h6>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>Properties, Land, Commercial Spaces</p>
          {selectedType === 'Real Estate' && (
            <div style={{ marginTop: '0.75rem', color: '#0e2e50', fontWeight: 'bold' }}>✓ Selected</div>
          )}
        </div>

        {/* Agriculture Card */}
        <div
          onClick={() => onTypeChange('Agriculture')}
          style={{
            border: selectedType === 'Agriculture' ? '3px solid #0e2e50' : '2px solid #ddd',
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.3s',
            backgroundColor: selectedType === 'Agriculture' ? '#e8f0f7' : '#fff',
            boxShadow: selectedType === 'Agriculture' ? '0 4px 12px rgba(14, 46, 80, 0.2)' : '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          <i className="fas fa-tractor" style={{ fontSize: '3rem', color: '#2d5016', marginBottom: '0.5rem' }}></i>
          <h6 style={{ fontWeight: 'bold', color: '#0e2e50', marginBottom: '0.5rem' }}>Agriculture</h6>
          <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>Farms, Crops, Livestock</p>
          {selectedType === 'Agriculture' && (
            <div style={{ marginTop: '0.75rem', color: '#0e2e50', fontWeight: 'bold' }}>✓ Selected</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default InvestmentTypeSelector;
