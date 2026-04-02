import React from 'react';

interface AgricultureFieldsProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const AgricultureFields: React.FC<AgricultureFieldsProps> = ({ formData, onChange }) => {
  return (
    <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
      <h5 style={{ marginBottom: '1.5rem', color: '#0e2e50' }}>🌾 Farm Details</h5>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Farm Size (Hectares) *</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              name="Farm_Size_Hectares"
              value={formData.Farm_Size_Hectares || ''}
              onChange={onChange}
              placeholder="e.g., 50"
              required
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Primary Crop/Product *</label>
            <select
              className="form-select"
              name="Crop_Type"
              value={formData.Crop_Type || ''}
              onChange={onChange}
              required
            >
              <option value="">Select Crop/Product</option>
              <option value="Rice">Rice</option>
              <option value="Maize">Maize</option>
              <option value="Cassava">Cassava</option>
              <option value="Yam">Yam</option>
              <option value="Tomatoes">Tomatoes</option>
              <option value="Pepper">Pepper</option>
              <option value="Palm Oil">Palm Oil</option>
              <option value="Cocoa">Cocoa</option>
              <option value="Poultry">Poultry</option>
              <option value="Catfish">Catfish</option>
              <option value="Tilapia">Tilapia</option>
              <option value="Cattle">Cattle</option>
              <option value="Goat">Goat</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Harvest/Production Cycle (Months) *</label>
            <input
              type="number"
              className="form-control"
              name="Harvest_Cycle_Months"
              value={formData.Harvest_Cycle_Months || ''}
              onChange={onChange}
              placeholder="e.g., 4"
              min="1"
              max="24"
              required
            />
            <small className="text-muted">How long from planting to harvest</small>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Expected Yield per Cycle</label>
            <input
              type="text"
              className="form-control"
              name="Expected_Yield"
              value={formData.Expected_Yield || ''}
              onChange={onChange}
              placeholder="e.g., 200 tons"
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Farming Method</label>
            <select
              className="form-select"
              name="Farming_Method"
              value={formData.Farming_Method || ''}
              onChange={onChange}
            >
              <option value="">Select Method</option>
              <option value="Organic">Organic</option>
              <option value="Conventional">Conventional</option>
              <option value="Hydroponic">Hydroponic</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Soil Type</label>
            <select
              className="form-select"
              name="Soil_Type"
              value={formData.Soil_Type || ''}
              onChange={onChange}
            >
              <option value="">Select Soil Type</option>
              <option value="Loamy">Loamy</option>
              <option value="Sandy">Sandy</option>
              <option value="Clay">Clay</option>
              <option value="Silt">Silt</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Water Source</label>
        <input
          type="text"
          className="form-control"
          name="Water_Source"
          value={formData.Water_Source || ''}
          onChange={onChange}
          placeholder="e.g., Borehole, River, Irrigation System"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Farm Equipment Included</label>
        <textarea
          className="form-control"
          name="Farm_Equipment"
          rows={3}
          value={formData.Farm_Equipment || ''}
          onChange={onChange}
          placeholder="e.g., 2 Tractors, 1 Harvester, Storage facility (500 tons)"
        />
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Insurance Status</label>
            <select
              className="form-select"
              name="Insurance_Status"
              value={formData.Insurance_Status || ''}
              onChange={onChange}
            >
              <option value="">Select Status</option>
              <option value="Fully Insured">Fully Insured</option>
              <option value="Partially Insured">Partially Insured</option>
              <option value="Not Insured">Not Insured</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Farm Manager/Contact</label>
            <input
              type="text"
              className="form-control"
              name="Farm_Manager"
              value={formData.Farm_Manager || ''}
              onChange={onChange}
              placeholder="Name and phone number"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgricultureFields;
