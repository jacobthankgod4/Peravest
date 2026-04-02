import React from 'react';

interface AmenitiesDisplayProps {
  amenities: string;
}

const AmenitiesDisplay: React.FC<AmenitiesDisplayProps> = ({ amenities }) => {
  if (!amenities) return null;

  const amenityList = amenities.split(',').map(a => a.trim()).filter(a => a);

  const getIcon = (amenity: string) => {
    const iconMap: { [key: string]: string } = {
      'Swimming Pool': '🏊',
      'Gym': '💪',
      'Security': '🔒',
      'Parking': '🅿️',
      'Garden': '🌳',
      'Balcony': '🪟',
      'AC': '❄️',
      'WiFi': '📶'
    };
    return iconMap[amenity] || '✓';
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h6 style={{ marginBottom: '1rem', fontWeight: '600', color: '#333' }}>Amenities</h6>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
        {amenityList.map((amenity, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              backgroundColor: '#f0f9f7',
              border: '1px solid #09c398',
              borderRadius: '8px',
              fontSize: '0.9rem',
              color: '#09c398',
              fontWeight: '500'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{getIcon(amenity)}</span>
            {amenity}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmenitiesDisplay;
