import React, { useState } from 'react';
import axios from 'axios';
import PinConfirmationModal from './PinConfirmationModal';

interface VendorEntry {
  id: string;
  company: string;
  contactPerson: string;
  timeIn: string;
  timeOut: string;
  purpose: string;
  location: string;
  notes: string;
}

interface GuestEntry {
  id: string;
  guestName: string;
  company: string;
  timeIn: string;
  timeOut: string;
  department: string;
  hostContact: string;
  notes: string;
}

interface PackageEntry {
  id: string;
  carrier: string;
  trackingNumber: string;
  recipient: string;
  department: string;
  timeReceived: string;
  status: string;
  notes: string;
}

interface PatrolRound {
  roundNumber: number;
  time: string;
  notes: string;
}

interface EquipmentStatus {
  [key: string]: 'ok' | 'issue' | 'broken';
}

interface DailyLogFormData {
  reportDate: string;
  shiftPeriod: string;
  officerName: string;
  weatherConditions: string;
  vendors: VendorEntry[];
  guests: GuestEntry[];
  packages: PackageEntry[];
  patrolRounds: PatrolRound[];
  patrolObservations: string;
  equipmentStatus: EquipmentStatus;
  generalNotes: string;
  attachments: File[];
}

const DailyLogForm: React.FC = () => {
  const [formData, setFormData] = useState<DailyLogFormData>({
    reportDate: new Date().toISOString().split('T')[0],
    shiftPeriod: 'day',
    officerName: '',
    weatherConditions: 'clear',
    vendors: [],
    guests: [],
    packages: [],
    patrolRounds: [
      { roundNumber: 1, time: '', notes: '' },
      { roundNumber: 2, time: '', notes: '' },
      { roundNumber: 3, time: '', notes: '' },
      { roundNumber: 4, time: '', notes: '' }
    ],
    patrolObservations: '',
    equipmentStatus: {
      'CCTV Cameras': 'ok',
      'Access Control': 'ok',
      'Alarm System': 'ok',
      'Emergency Lighting': 'ok',
      'Fire Safety Equipment': 'ok',
      'Communication Devices': 'ok',
      'Locks & Keys': 'ok',
      'Barriers/Gates': 'ok'
    },
    generalNotes: '',
    attachments: []
  });

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Generate unique ID for entries
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Vendor management
  const addVendorEntry = () => {
    setFormData(prev => ({
      ...prev,
      vendors: [...prev.vendors, {
        id: generateId(),
        company: '',
        contactPerson: '',
        timeIn: '',
        timeOut: '',
        purpose: '',
        location: '',
        notes: ''
      }]
    }));
  };

  const updateVendorEntry = (id: string, field: keyof VendorEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      vendors: prev.vendors.map(vendor => 
        vendor.id === id ? { ...vendor, [field]: value } : vendor
      )
    }));
  };

  const removeVendorEntry = (id: string) => {
    setFormData(prev => ({
      ...prev,
      vendors: prev.vendors.filter(vendor => vendor.id !== id)
    }));
  };

  // Guest management
  const addGuestEntry = () => {
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, {
        id: generateId(),
        guestName: '',
        company: '',
        timeIn: '',
        timeOut: '',
        department: '',
        hostContact: '',
        notes: ''
      }]
    }));
  };

  const updateGuestEntry = (id: string, field: keyof GuestEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.map(guest => 
        guest.id === id ? { ...guest, [field]: value } : guest
      )
    }));
  };

  const removeGuestEntry = (id: string) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter(guest => guest.id !== id)
    }));
  };

  // Package management
  const addPackageEntry = () => {
    setFormData(prev => ({
      ...prev,
      packages: [...prev.packages, {
        id: generateId(),
        carrier: '',
        trackingNumber: '',
        recipient: '',
        department: '',
        timeReceived: '',
        status: 'received',
        notes: ''
      }]
    }));
  };

  const updatePackageEntry = (id: string, field: keyof PackageEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.map(pkg => 
        pkg.id === id ? { ...pkg, [field]: value } : pkg
      )
    }));
  };

  const removePackageEntry = (id: string) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.filter(pkg => pkg.id !== id)
    }));
  };

  // Patrol round management
  const updatePatrolRound = (roundNumber: number, field: keyof PatrolRound, value: string) => {
    setFormData(prev => ({
      ...prev,
      patrolRounds: prev.patrolRounds.map(round => 
        round.roundNumber === roundNumber ? { ...round, [field]: value } : round
      )
    }));
  };

  // Equipment status management
  const updateEquipmentStatus = (equipment: string, status: 'ok' | 'issue' | 'broken') => {
    setFormData(prev => ({
      ...prev,
      equipmentStatus: {
        ...prev.equipmentStatus,
        [equipment]: status
      }
    }));
  };

  // File upload handling
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Form submission
  const handleSubmit = () => {
    setPinModalOpen(true);
  };

  const handlePinConfirmed = async (verificationData: any) => {
    setSaving(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://verivault-production.up.railway.app';
      
      // Create FormData for file uploads
      const submitData = new FormData();
      submitData.append('reportType', 'Daily Log');
      submitData.append('formData', JSON.stringify(formData));
      submitData.append('verificationData', JSON.stringify(verificationData));
      
      // Add file attachments
      formData.attachments.forEach((file, index) => {
        submitData.append(`attachment_${index}`, file);
      });

      const response = await axios.post(`${apiUrl}/api/daily-logs/submit`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        alert(`✅ Daily Log submitted successfully!\n\n🔐 Security Features:\n• PIN Authentication Verified\n• ${formData.attachments.length} files uploaded\n• Submission ID: ${response.data.submissionId}`);
        
        // Reset form
        setFormData({
          reportDate: new Date().toISOString().split('T')[0],
          shiftPeriod: 'day',
          officerName: '',
          weatherConditions: 'clear',
          vendors: [],
          guests: [],
          packages: [],
          patrolRounds: [
            { roundNumber: 1, time: '', notes: '' },
            { roundNumber: 2, time: '', notes: '' },
            { roundNumber: 3, time: '', notes: '' },
            { roundNumber: 4, time: '', notes: '' }
          ],
          patrolObservations: '',
          equipmentStatus: {
            'CCTV Cameras': 'ok',
            'Access Control': 'ok',
            'Alarm System': 'ok',
            'Emergency Lighting': 'ok',
            'Fire Safety Equipment': 'ok',
            'Communication Devices': 'ok',
            'Locks & Keys': 'ok',
            'Barriers/Gates': 'ok'
          },
          generalNotes: '',
          attachments: []
        });
      }
    } catch (error) {
      console.error('Error submitting daily log:', error);
      alert('❌ Error submitting daily log. Please try again.');
    } finally {
      setSaving(false);
      setPinModalOpen(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '32px' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>📋 Enhanced Daily Log Report</h3>
        <p style={{ color: '#94a3b8', fontSize: '16px' }}>Complete daily security activity documentation with vendor, guest, package, and patrol tracking</p>
      </div>

      <form style={{ display: 'grid', gap: '24px' }}>
        {/* Basic Information */}
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>📝 Basic Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Report Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.reportDate}
                onChange={(e) => setFormData(prev => ({ ...prev, reportDate: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Shift Period</label>
              <select 
                className="form-input"
                value={formData.shiftPeriod}
                onChange={(e) => setFormData(prev => ({ ...prev, shiftPeriod: e.target.value }))}
              >
                <option value="day">Day Shift (06:00 - 18:00)</option>
                <option value="night">Night Shift (18:00 - 06:00)</option>
                <option value="custom">Custom Hours</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Officer Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Security Officer Name"
                value={formData.officerName}
                onChange={(e) => setFormData(prev => ({ ...prev, officerName: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weather Conditions</label>
              <select 
                className="form-input"
                value={formData.weatherConditions}
                onChange={(e) => setFormData(prev => ({ ...prev, weatherConditions: e.target.value }))}
              >
                <option value="clear">Clear</option>
                <option value="rain">Rain</option>
                <option value="snow">Snow</option>
                <option value="fog">Fog</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vendor Activities */}
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#3b82f6' }}>🏢 Vendor Activities</h4>
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ fontSize: '14px' }}
                onClick={addVendorEntry}
              >
                ➕ Add Vendor Entry
              </button>
              <span style={{ marginLeft: '12px', color: '#94a3b8', fontSize: '14px' }}>
                ({formData.vendors.length} entries)
              </span>
            </div>

            {formData.vendors.map((vendor) => (
              <div key={vendor.id} style={{ 
                background: 'white', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '12px',
                border: '1px solid rgba(59, 130, 246, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h5 style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' }}>Vendor Entry</h5>
                  <button 
                    type="button" 
                    onClick={() => removeVendorEntry(vendor.id)}
                    style={{ 
                      background: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Company Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Company name"
                      value={vendor.company}
                      onChange={(e) => updateVendorEntry(vendor.id, 'company', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Contact Person</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Representative name"
                      value={vendor.contactPerson}
                      onChange={(e) => updateVendorEntry(vendor.id, 'contactPerson', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Time In</label>
                    <input 
                      type="time" 
                      className="form-input"
                      value={vendor.timeIn}
                      onChange={(e) => updateVendorEntry(vendor.id, 'timeIn', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Time Out</label>
                    <input 
                      type="time" 
                      className="form-input"
                      value={vendor.timeOut}
                      onChange={(e) => updateVendorEntry(vendor.id, 'timeOut', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Purpose</label>
                    <select 
                      className="form-input"
                      value={vendor.purpose}
                      onChange={(e) => updateVendorEntry(vendor.id, 'purpose', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }}
                    >
                      <option value="">Select purpose</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="delivery">Delivery</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="repair">Repair</option>
                      <option value="inspection">Inspection</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Location/Area</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Specific location"
                      value={vendor.location}
                      onChange={(e) => updateVendorEntry(vendor.id, 'location', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label" style={{ fontSize: '14px' }}>Additional Notes</label>
                  <textarea 
                    className="form-input" 
                    rows={2}
                    placeholder="Notes about vendor activities..."
                    value={vendor.notes}
                    onChange={(e) => updateVendorEntry(vendor.id, 'notes', e.target.value)}
                    style={{ fontSize: '14px', resize: 'vertical' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guest Activities (Similar structure) */}
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#10b981' }}>👤 Guest & Visitor Activities</h4>
          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ fontSize: '14px' }}
                onClick={addGuestEntry}
              >
                ➕ Add Guest Entry
              </button>
              <span style={{ marginLeft: '12px', color: '#94a3b8', fontSize: '14px' }}>
                ({formData.guests.length} entries)
              </span>
            </div>

            {formData.guests.map((guest) => (
              <div key={guest.id} style={{ 
                background: 'white', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '12px',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h5 style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>Guest Entry</h5>
                  <button 
                    type="button" 
                    onClick={() => removeGuestEntry(guest.id)}
                    style={{ 
                      background: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Guest Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Full name"
                      value={guest.guestName}
                      onChange={(e) => updateGuestEntry(guest.id, 'guestName', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Company/Organization</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Visiting company"
                      value={guest.company}
                      onChange={(e) => updateGuestEntry(guest.id, 'company', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Time In</label>
                    <input 
                      type="time" 
                      className="form-input"
                      value={guest.timeIn}
                      onChange={(e) => updateGuestEntry(guest.id, 'timeIn', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Time Out</label>
                    <input 
                      type="time" 
                      className="form-input"
                      value={guest.timeOut}
                      onChange={(e) => updateGuestEntry(guest.id, 'timeOut', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Visiting Department</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Destination department"
                      value={guest.department}
                      onChange={(e) => updateGuestEntry(guest.id, 'department', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Host Contact</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Employee contacted"
                      value={guest.hostContact}
                      onChange={(e) => updateGuestEntry(guest.id, 'hostContact', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label" style={{ fontSize: '14px' }}>Visit Notes</label>
                  <textarea 
                    className="form-input" 
                    rows={2}
                    placeholder="Purpose of visit, special instructions..."
                    value={guest.notes}
                    onChange={(e) => updateGuestEntry(guest.id, 'notes', e.target.value)}
                    style={{ fontSize: '14px', resize: 'vertical' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Package Activities (Similar structure) */}
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>📦 Package & Delivery Activities</h4>
          <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ fontSize: '14px' }}
                onClick={addPackageEntry}
              >
                ➕ Add Package Entry
              </button>
              <span style={{ marginLeft: '12px', color: '#94a3b8', fontSize: '14px' }}>
                ({formData.packages.length} entries)
              </span>
            </div>

            {formData.packages.map((pkg) => (
              <div key={pkg.id} style={{ 
                background: 'white', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '12px',
                border: '1px solid rgba(245, 158, 11, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h5 style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b' }}>Package Entry</h5>
                  <button 
                    type="button" 
                    onClick={() => removePackageEntry(pkg.id)}
                    style={{ 
                      background: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Carrier/Service</label>
                    <select 
                      className="form-input"
                      value={pkg.carrier}
                      onChange={(e) => updatePackageEntry(pkg.id, 'carrier', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }}
                    >
                      <option value="">Select carrier</option>
                      <option value="fedex">FedEx</option>
                      <option value="ups">UPS</option>
                      <option value="usps">USPS</option>
                      <option value="dhl">DHL</option>
                      <option value="amazon">Amazon</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Tracking Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Package tracking #"
                      value={pkg.trackingNumber}
                      onChange={(e) => updatePackageEntry(pkg.id, 'trackingNumber', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Recipient</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Addressed to"
                      value={pkg.recipient}
                      onChange={(e) => updatePackageEntry(pkg.id, 'recipient', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Department</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Destination dept."
                      value={pkg.department}
                      onChange={(e) => updatePackageEntry(pkg.id, 'department', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Time Received</label>
                    <input 
                      type="time" 
                      className="form-input"
                      value={pkg.timeReceived}
                      onChange={(e) => updatePackageEntry(pkg.id, 'timeReceived', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Status</label>
                    <select 
                      className="form-input"
                      value={pkg.status}
                      onChange={(e) => updatePackageEntry(pkg.id, 'status', e.target.value)}
                      style={{ fontSize: '14px', padding: '8px' }}
                    >
                      <option value="received">Received</option>
                      <option value="delivered">Delivered</option>
                      <option value="pending">Pending Pickup</option>
                      <option value="returned">Returned</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label" style={{ fontSize: '14px' }}>Package Notes</label>
                  <textarea 
                    className="form-input" 
                    rows={2}
                    placeholder="Special handling requirements, delivery issues..."
                    value={pkg.notes}
                    onChange={(e) => updatePackageEntry(pkg.id, 'notes', e.target.value)}
                    style={{ fontSize: '14px', resize: 'vertical' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patrol Notes */}
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#8b5cf6' }}>🚶 Patrol Notes & Observations</h4>
          <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px', padding: '20px' }}>
            
            {/* Patrol Rounds */}
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Patrol Rounds Completed</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                {formData.patrolRounds.map((round) => (
                  <div key={round.roundNumber} style={{ background: 'white', padding: '12px', borderRadius: '6px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '14px' }}>Round {round.roundNumber} Time</label>
                      <input 
                        type="time" 
                        className="form-input"
                        value={round.time}
                        onChange={(e) => updatePatrolRound(round.roundNumber, 'time', e.target.value)}
                        style={{ fontSize: '14px', padding: '8px' }} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '14px' }}>Notes</label>
                      <textarea 
                        className="form-input" 
                        rows={2}
                        placeholder="Observations during this round..."
                        value={round.notes}
                        onChange={(e) => updatePatrolRound(round.roundNumber, 'notes', e.target.value)}
                        style={{ fontSize: '12px', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Observations */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontSize: '14px' }}>Detailed Patrol Observations</label>
              <textarea 
                className="form-input" 
                rows={4}
                placeholder="Security observations, unusual activities, maintenance needs, safety concerns..."
                value={formData.patrolObservations}
                onChange={(e) => setFormData(prev => ({ ...prev, patrolObservations: e.target.value }))}
                style={{ fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            {/* Security Equipment Check */}
            <div>
              <label className="form-label" style={{ fontSize: '14px', marginBottom: '12px' }}>Security Equipment Status</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {Object.entries(formData.equipmentStatus).map(([equipment, status]) => (
                  <div key={equipment} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', background: 'white', padding: '8px', borderRadius: '4px' }}>
                    <span style={{ marginRight: '8px', minWidth: '120px' }}>{equipment}:</span>
                    <select 
                      className="form-input" 
                      value={status}
                      onChange={(e) => updateEquipmentStatus(equipment, e.target.value as 'ok' | 'issue' | 'broken')}
                      style={{ fontSize: '12px', padding: '4px' }}
                    >
                      <option value="ok">✅ OK</option>
                      <option value="issue">⚠️ Issue</option>
                      <option value="broken">❌ Broken</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* File Attachments */}
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>📎 File Attachments</h4>
          <div style={{ border: '2px dashed rgba(255,255,255,0.3)', borderRadius: '8px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📁</div>
            <p style={{ marginBottom: '12px', color: '#94a3b8' }}>
              Upload photos, videos, documents, or other files related to today's activities
            </p>
            <input 
              type="file" 
              multiple 
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="dailyLogFiles"
            />
            <label htmlFor="dailyLogFiles" className="btn" style={{ cursor: 'pointer' }}>
              📤 Choose Files
            </label>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
              <strong>Supported:</strong> Photos, Videos, Documents (PDF, DOC, TXT, CSV) • Max 50MB per file
            </div>
          </div>

          {/* Display uploaded files */}
          {formData.attachments.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h5 style={{ fontSize: '16px', marginBottom: '8px' }}>Uploaded Files ({formData.attachments.length})</h5>
              <div style={{ display: 'grid', gap: '8px' }}>
                {formData.attachments.map((file, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    <span>
                      📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <button 
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{ 
                        background: '#ef4444', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* General Notes */}
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#94a3b8' }}>📝 General Notes</h4>
          <div className="form-group">
            <label className="form-label">Additional Notes & Observations</label>
            <textarea 
              className="form-input" 
              rows={4}
              placeholder="Any additional observations, notes, or information for this shift..."
              value={formData.generalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, generalNotes: e.target.value }))}
              style={{ fontSize: '14px', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button type="button" className="btn btn-secondary" style={{ flex: 1 }}>
            💾 Save Draft
          </button>
          <button 
            type="button" 
            className="btn" 
            style={{ flex: 1 }}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? '⏳ Submitting...' : '🔐 Submit with PIN'}
          </button>
        </div>
      </form>

      {/* PIN Confirmation Modal */}
      <PinConfirmationModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onConfirm={handlePinConfirmed}
        reportType="Daily Log"
        reportData={formData}
      />
    </div>
  );
};

export default DailyLogForm; 