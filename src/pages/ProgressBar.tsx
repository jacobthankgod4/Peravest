import React from 'react';

interface ProgressBarProps {
  percentage: number;
  height?: string;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  height = '8px', 
  color = '#28a745' 
}) => {
  return (
    <div className="progress-bar-container" style={{ width: '100%', marginBottom: '10px' }}>
      <div 
        className="progress-bar-bg" 
        style={{
          width: '100%',
          height,
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <div 
          className="progress-bar-fill"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s ease',
            borderRadius: '4px'
          }}
        />
      </div>
      <div className="progress-text" style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
        {percentage}% funded
      </div>
    </div>
  );
};

export default ProgressBar;