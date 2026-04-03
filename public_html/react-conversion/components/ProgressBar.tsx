import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div progress-bar data-percentage={`${percentage}%`}>
      <div className="progress-number">
        <div className="progress-number-mark">
          <span className="percent">{percentage}%</span>
          <span className="down-arrow"></span>
        </div>
      </div>
      <div className="progress-bg">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
