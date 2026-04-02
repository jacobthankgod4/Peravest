import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { kycVerificationService } from '../services/kycVerificationService';
import Swal from 'sweetalert2';

const KYC: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    bvn: '',
    nin: '',
    idType: '',
    idNumber: '',
    idDocument: null as File | null,
    proofOfAddress: null as File | null,
    selfie: null as File | null
  });

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(field, files[0]);
    }
  };

  const FileUploadBox = ({ field, label, accept, file }: { field: string; label: string; accept: string; file: File | null }) => (
    <div>
      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>{label}</label>
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, field)}
        style={{
          border: '2px dashed #e2e8f0',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          background: file ? '#f0f9ff' : '#fafafa'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#0e2e50';
          e.currentTarget.style.background = '#f0f9ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.background = file ? '#f0f9ff' : '#fafafa';
        }}
        onClick={() => document.getElementById(field)?.click()}
      >
        {file ? (
          <>
            <i className="fas fa-check-circle" style={{ fontSize: '2rem', color: '#0e2e50', marginBottom: '0.5rem' }}></i>
            <div style={{ color: '#0e2e50', fontWeight: '600' }}>{file.name}</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Click to change file</div>
          </>
        ) : (
          <>
            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: '#64748b', marginBottom: '0.5rem' }}></i>
            <div style={{ color: '#0e2e50', fontWeight: '600', marginBottom: '0.25rem' }}>Drag & drop your file here</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>or click to browse</div>
          </>
        )}
      </div>
      <input
        id={field}
        type="file"
        accept={accept}
        onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
        required
        style={{ display: 'none' }}
      />
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const kycData = new FormData();
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          kycData.append(key, value);
        } else if (value) {
          kycData.append(key, value.toString());
        }
      });

      const result = await kycVerificationService.submitKYC(kycData);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to submit KYC');
      }
      Swal.fire('Success!', 'KYC documents submitted successfully. We will review and get back to you within 24-48 hours.', 'success');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        bvn: '',
        nin: '',
        idType: '',
        idNumber: '',
        idDocument: null,
        proofOfAddress: null,
        selfie: null
      });
    } catch (error: any) {
      Swal.fire('Error!', error.message || 'Failed to submit KYC documents. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Complete Your KYC">
      <main style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', minHeight: '100vh', paddingTop: '2rem' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{ color: '#0e2e50', fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Complete Your KYC</h1>
              <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Verify your identity to unlock all PeraVest features</p>
            </div>

            {/* KYC Form */}
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '3rem',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0'
            }}>
              <form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ color: '#0e2e50', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Personal Information</h3>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ color: '#0e2e50', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Address Information</h3>
                  
                  <div className="row g-3">
                    <div className="col-12">
                      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>State</label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      >
                        <option value="">Select State</option>
                        <option value="Abia">Abia</option>
                        <option value="Adamawa">Adamawa</option>
                        <option value="Akwa Ibom">Akwa Ibom</option>
                        <option value="Anambra">Anambra</option>
                        <option value="Bauchi">Bauchi</option>
                        <option value="Bayelsa">Bayelsa</option>
                        <option value="Benue">Benue</option>
                        <option value="Borno">Borno</option>
                        <option value="Cross River">Cross River</option>
                        <option value="Delta">Delta</option>
                        <option value="Ebonyi">Ebonyi</option>
                        <option value="Edo">Edo</option>
                        <option value="Ekiti">Ekiti</option>
                        <option value="Enugu">Enugu</option>
                        <option value="FCT">FCT (Abuja)</option>
                        <option value="Gombe">Gombe</option>
                        <option value="Imo">Imo</option>
                        <option value="Jigawa">Jigawa</option>
                        <option value="Kaduna">Kaduna</option>
                        <option value="Kano">Kano</option>
                        <option value="Katsina">Katsina</option>
                        <option value="Kebbi">Kebbi</option>
                        <option value="Kogi">Kogi</option>
                        <option value="Kwara">Kwara</option>
                        <option value="Lagos">Lagos</option>
                        <option value="Nasarawa">Nasarawa</option>
                        <option value="Niger">Niger</option>
                        <option value="Ogun">Ogun</option>
                        <option value="Ondo">Ondo</option>
                        <option value="Osun">Osun</option>
                        <option value="Oyo">Oyo</option>
                        <option value="Plateau">Plateau</option>
                        <option value="Rivers">Rivers</option>
                        <option value="Sokoto">Sokoto</option>
                        <option value="Taraba">Taraba</option>
                        <option value="Yobe">Yobe</option>
                        <option value="Zamfara">Zamfara</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Verification Numbers */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ color: '#0e2e50', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Verification Numbers</h3>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>BVN</label>
                      <input
                        type="text"
                        value={formData.bvn}
                        onChange={(e) => setFormData({...formData, bvn: e.target.value})}
                        required
                        maxLength={11}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>NIN</label>
                      <input
                        type="text"
                        value={formData.nin}
                        onChange={(e) => setFormData({...formData, nin: e.target.value})}
                        required
                        maxLength={11}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ color: '#0e2e50', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Document Upload</h3>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>ID Type</label>
                      <select
                        value={formData.idType}
                        onChange={(e) => setFormData({...formData, idType: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      >
                        <option value="">Select ID Type</option>
                        <option value="passport">International Passport</option>
                        <option value="drivers_license">Driver's License</option>
                        <option value="voters_card">Voter's Card</option>
                        <option value="national_id">National ID Card</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label style={{ display: 'block', color: '#0e2e50', fontWeight: '600', marginBottom: '0.5rem' }}>ID Number</label>
                      <input
                        type="text"
                        value={formData.idNumber}
                        onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#0e2e50'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div className="col-md-4">
                      <FileUploadBox 
                        field="idDocument" 
                        label="ID Document" 
                        accept="image/*,.pdf" 
                        file={formData.idDocument} 
                      />
                      <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>Upload clear photo of your selected ID (front & back if applicable)</small>
                    </div>
                    <div className="col-md-4">
                      <FileUploadBox 
                        field="proofOfAddress" 
                        label="Proof of Address" 
                        accept="image/*,.pdf" 
                        file={formData.proofOfAddress} 
                      />
                      <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>Utility bill, bank statement, or tenancy agreement (not older than 3 months)</small>
                    </div>
                    <div className="col-md-4">
                      <FileUploadBox 
                        field="selfie" 
                        label="Selfie Photo" 
                        accept="image/*" 
                        file={formData.selfie} 
                      />
                      <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>Clear selfie holding your ID document next to your face</small>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    background: loading ? '#94a3b8' : '#0e2e50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(14, 46, 80, 0.3)',
                    marginBottom: '4rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = '#1e3a8a';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = '#0e2e50';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                      Submitting KYC Documents...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-shield-alt" style={{ marginRight: '0.5rem' }}></i>
                      Submit KYC Documents
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default KYC;