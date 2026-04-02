import React from 'react';

const HeroTest: React.FC = () => {
  return (
    <div style={{ 
      width: '100%', 
      height: '600px', 
      background: 'url(/i/a3.jpg) center/cover',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      HERO TEST - If you see this with background image, images work
    </div>
  );
};

export default HeroTest;