import React, { useState } from 'react';

export interface AmenityIcon {
  name: string;
  icon: string;
}

export const AMENITY_ICONS: AmenityIcon[] = [
  // Power & Utilities
  { name: '24/7 Power Supply', icon: 'fa-bolt' },
  { name: 'Generator', icon: 'fa-plug' },
  { name: 'Solar Power', icon: 'fa-sun' },
  { name: 'Water Supply', icon: 'fa-faucet' },
  { name: 'Borehole', icon: 'fa-water' },
  
  // Security
  { name: 'Security', icon: 'fa-shield-alt' },
  { name: 'CCTV', icon: 'fa-video' },
  { name: 'Gated Estate', icon: 'fa-lock' },
  { name: 'Security Gate', icon: 'fa-door-closed' },
  { name: 'Intercom', icon: 'fa-phone' },
  
  // Parking
  { name: 'Parking Space', icon: 'fa-square-parking' },
  { name: 'Garage', icon: 'fa-warehouse' },
  { name: 'Carport', icon: 'fa-car' },
  
  // Kitchen & Dining
  { name: 'Fitted Kitchen', icon: 'fa-utensils' },
  { name: 'Kitchen Cabinets', icon: 'fa-cabinet-filing' },
  { name: 'Dining Area', icon: 'fa-chair' },
  { name: 'Gas Cooker', icon: 'fa-fire-burner' },
  
  // Comfort & Climate
  { name: 'Air Conditioning', icon: 'fa-snowflake' },
  { name: 'Ceiling Fans', icon: 'fa-fan' },
  { name: 'Ventilation', icon: 'fa-wind' },
  
  // Outdoor & Recreation
  { name: 'Swimming Pool', icon: 'fa-swimming-pool' },
  { name: 'Garden', icon: 'fa-leaf' },
  { name: 'Balcony', icon: 'fa-building' },
  { name: 'Terrace', icon: 'fa-home' },
  { name: 'Playground', icon: 'fa-child' },
  { name: 'Lawn', icon: 'fa-seedling' },
  { name: 'Backyard', icon: 'fa-tree' },
  
  // Facilities
  { name: 'Gym', icon: 'fa-dumbbell' },
  { name: 'Elevator', icon: 'fa-elevator' },
  { name: 'Laundry Room', icon: 'fa-soap' },
  { name: 'Storage Room', icon: 'fa-box' },
  { name: 'Boys Quarters', icon: 'fa-house-user' },
  { name: 'Guest Room', icon: 'fa-bed' },
  { name: 'Study Room', icon: 'fa-book' },
  
  // Connectivity
  { name: 'WiFi', icon: 'fa-wifi' },
  { name: 'Internet Ready', icon: 'fa-network-wired' },
  { name: 'Cable TV', icon: 'fa-tv' },
  
  // Flooring & Finishes
  { name: 'Tiled Floor', icon: 'fa-th' },
  { name: 'Marble Floor', icon: 'fa-gem' },
  { name: 'POP Ceiling', icon: 'fa-layer-group' },
  { name: 'Painted Walls', icon: 'fa-paint-roller' },
  
  // Bathroom
  { name: 'Ensuite Bathroom', icon: 'fa-shower' },
  { name: 'Bathtub', icon: 'fa-bath' },
  { name: 'Water Heater', icon: 'fa-temperature-hot' },
  
  // Additional Features
  { name: 'Furnished', icon: 'fa-couch' },
  { name: 'Semi-Furnished', icon: 'fa-loveseat' },
  { name: 'Wardrobe', icon: 'fa-door-open' },
  { name: 'Chandelier', icon: 'fa-lightbulb' },
  { name: 'Pet Friendly', icon: 'fa-paw' },
  { name: 'Serviced', icon: 'fa-broom' }
];

interface AmenityIconLibraryProps {
  selectedAmenities: Array<{ name: string; icon: string }>;
  onAmenitiesChange: (amenities: Array<{ name: string; icon: string }>) => void;
}

const AmenityIconLibrary: React.FC<AmenityIconLibraryProps> = ({ selectedAmenities, onAmenitiesChange }) => {
  const [customName, setCustomName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('fa-check-circle');

  const toggleAmenity = (amenity: AmenityIcon) => {
    const exists = selectedAmenities.find(a => a.name === amenity.name);
    if (exists) {
      onAmenitiesChange(selectedAmenities.filter(a => a.name !== amenity.name));
    } else {
      onAmenitiesChange([...selectedAmenities, amenity]);
    }
  };

  const addCustomAmenity = () => {
    if (customName.trim()) {
      onAmenitiesChange([...selectedAmenities, { name: customName.trim(), icon: selectedIcon }]);
      setCustomName('');
      setSelectedIcon('fa-check-circle');
    }
  };

  const removeAmenity = (name: string) => {
    onAmenitiesChange(selectedAmenities.filter(a => a.name !== name));
  };

  return (
    <div>
      <label className="form-label">Amenities</label>
      
      {/* Selected Amenities */}
      {selectedAmenities.length > 0 && (
        <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {selectedAmenities.map((amenity, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: '#09c398',
                color: '#fff',
                borderRadius: '20px',
                fontSize: '0.875rem'
              }}
            >
              <i className={`fas ${amenity.icon}`}></i>
              {amenity.name}
              <button
                type="button"
                onClick={() => removeAmenity(amenity.name)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '0 0 0 4px',
                  fontSize: '1rem'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Amenity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '1rem' }}>
        {AMENITY_ICONS.map((amenity, idx) => {
          const isSelected = selectedAmenities.some(a => a.name === amenity.name);
          return (
            <div
              key={idx}
              onClick={() => toggleAmenity(amenity)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px',
                border: `2px solid ${isSelected ? '#09c398' : '#ddd'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                background: isSelected ? '#f0f9f7' : '#fff',
                transition: 'all 0.2s'
              }}
            >
              <i className={`fas ${amenity.icon}`} style={{ fontSize: '1.5rem', color: isSelected ? '#09c398' : '#757f95', marginBottom: '6px' }}></i>
              <span style={{ fontSize: '0.75rem', textAlign: 'center', color: '#0e2e50' }}>{amenity.name}</span>
            </div>
          );
        })}
      </div>

      {/* Custom Amenity */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', background: '#f8f9fa' }}>
        <h6 style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>Add Custom Amenity</h6>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Amenity name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>
          <div style={{ width: '120px' }}>
            <select
              className="form-select form-select-sm"
              value={selectedIcon}
              onChange={(e) => setSelectedIcon(e.target.value)}
            >
              {AMENITY_ICONS.map((a, i) => (
                <option key={i} value={a.icon}>{a.name}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={addCustomAmenity}
            disabled={!customName.trim()}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmenityIconLibrary;
