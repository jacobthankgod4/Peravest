import React, { useState, useEffect } from 'react';
import { settingsAdminService } from '../../services/settingsAdminService';
import Swal from 'sweetalert2';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsAdminService.getSettings();
      setSettings(data);
    } catch (error) {
      Swal.fire('Error', 'Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAdminService.updateSettings(settings);
      Swal.fire('Success!', 'Settings updated', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceToggle = async () => {
    const newValue = !settings.maintenance_mode;
    const result = await Swal.fire({
      title: `${newValue ? 'Enable' : 'Disable'} Maintenance Mode?`,
      text: newValue ? 'Users will not be able to access the platform' : 'Platform will be accessible to users',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed'
    });

    if (result.isConfirmed) {
      try {
        await settingsAdminService.toggleMaintenanceMode(newValue);
        setSettings({ ...settings, maintenance_mode: newValue });
        Swal.fire('Success!', `Maintenance mode ${newValue ? 'enabled' : 'disabled'}`, 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to toggle maintenance mode', 'error');
      }
    }
  };

  const handleClearCache = async () => {
    const result = await Swal.fire({
      title: 'Clear Cache?',
      text: 'This will clear all cached data',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear'
    });

    if (result.isConfirmed) {
      try {
        await settingsAdminService.clearCache();
        Swal.fire('Success!', 'Cache cleared', 'success');
      } catch (error) {
        Swal.fire('Error', 'Failed to clear cache', 'error');
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading settings...</div>;
  if (!settings) return null;

  return (
    <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '2rem' }}>System Settings</h2>

      {/* Platform Settings */}
      <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <h5 style={{ marginBottom: '1.5rem' }}>Platform Configuration</h5>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label>Platform Name</label>
            <input
              type="text"
              className="form-control"
              value={settings.platform_name || ''}
              onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
            />
          </div>

          <div>
            <label>Support Email</label>
            <input
              type="email"
              className="form-control"
              value={settings.support_email || ''}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
            />
          </div>

          <div>
            <label>Minimum Investment (₦)</label>
            <input
              type="number"
              className="form-control"
              value={settings.min_investment || ''}
              onChange={(e) => setSettings({ ...settings, min_investment: Number(e.target.value) })}
            />
          </div>

          <div>
            <label>Maximum Investment (₦)</label>
            <input
              type="number"
              className="form-control"
              value={settings.max_investment || ''}
              onChange={(e) => setSettings({ ...settings, max_investment: Number(e.target.value) })}
            />
          </div>

          <div>
            <label>Platform Fee (%)</label>
            <input
              type="number"
              step="0.1"
              className="form-control"
              value={settings.platform_fee || ''}
              onChange={(e) => setSettings({ ...settings, platform_fee: Number(e.target.value) })}
            />
          </div>

          <div>
            <label>Withdrawal Fee (%)</label>
            <input
              type="number"
              step="0.1"
              className="form-control"
              value={settings.withdrawal_fee || ''}
              onChange={(e) => setSettings({ ...settings, withdrawal_fee: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <h5 style={{ marginBottom: '1.5rem' }}>Payment Gateway</h5>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label>Paystack Public Key</label>
            <input
              type="text"
              className="form-control"
              value={settings.paystack_public_key || ''}
              onChange={(e) => setSettings({ ...settings, paystack_public_key: e.target.value })}
            />
          </div>

          <div>
            <label>Paystack Secret Key</label>
            <input
              type="password"
              className="form-control"
              value={settings.paystack_secret_key || ''}
              onChange={(e) => setSettings({ ...settings, paystack_secret_key: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* System Controls */}
      <div style={{ background: '#fff', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
        <h5 style={{ marginBottom: '1.5rem' }}>System Controls</h5>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Maintenance Mode</div>
              <div style={{ fontSize: '0.875rem', color: '#757f95' }}>
                {settings.maintenance_mode ? 'Platform is currently in maintenance mode' : 'Platform is accessible to users'}
              </div>
            </div>
            <button
              className="theme-btn"
              onClick={handleMaintenanceToggle}
              style={{ background: settings.maintenance_mode ? '#28a745' : '#dc3545' }}
            >
              {settings.maintenance_mode ? 'Disable' : 'Enable'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Clear Cache</div>
              <div style={{ fontSize: '0.875rem', color: '#757f95' }}>Clear all cached data to improve performance</div>
            </div>
            <button className="theme-btn" onClick={handleClearCache} style={{ background: '#17a2b8' }}>
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="theme-btn" onClick={handleSave} disabled={saving} style={{ padding: '0.75rem 2rem' }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;
