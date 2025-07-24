import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  type: 'Staff' | 'Vendor' | 'Guest';
  company?: string;
  department?: string;
  phone?: string;
}

interface DailyLogEntry {
  id: string;
  timestamp: string;
  type: 'guest' | 'vendor' | 'package' | 'note';
  details: any;
  enteredBy: string;
}

interface PackageEntry {
  id: string;
  recipientFirstName: string;
  recipientLastName: string;
  senderName: string;
  senderCompany: string;
  trackingLastFour: string;
  packageType: string;
  placementLocation: string;
  timestamp: string;
  enteredBy: string;
}

const EnhancedDailyLog: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('log');
  const [people, setPeople] = useState<Person[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // User role management
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isManager = user.role === 'manager' || user.role === 'administrator' || user.username === 'admin';
  const isResidentialAgent = user.role === 'residential_agent' || isManager;

  // Form states
  const [newPersonForm, setNewPersonForm] = useState({
    firstName: '',
    lastName: '',
    type: 'Guest' as 'Staff' | 'Vendor' | 'Guest',
    company: '',
    department: '',
    phone: ''
  });

  const [newPackageForm, setNewPackageForm] = useState({
    recipientFirstName: '',
    recipientLastName: '',
    senderName: '',
    senderCompany: '',
    trackingLastFour: '',
    packageType: 'Box',
    placementLocation: ''
  });

  const [quickLogForm, setQuickLogForm] = useState({
    selectedPersonId: '',
    logType: 'guest' as 'guest' | 'vendor',
    timeIn: '',
    timeOut: '',
    purpose: '',
    notes: ''
  });

  useEffect(() => {
    loadPeople();
    loadDailyEntries();
  }, []);

  // Auto-complete functionality
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = people.filter(person =>
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPeople(filtered);
      setShowDropdown(true);
    } else {
      setFilteredPeople([]);
      setShowDropdown(false);
    }
  }, [searchQuery, people]);

  const loadPeople = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://verivault-production.up.railway.app';
      const response = await axios.get(`${apiUrl}/api/people`);
      setPeople(response.data.people || []);
    } catch (error) {
      console.error('Error loading people:', error);
      // Mock data for development
      setPeople([
        { id: '1', firstName: 'John', lastName: 'Smith', type: 'Staff', department: 'Security' },
        { id: '2', firstName: 'Jane', lastName: 'Doe', type: 'Vendor', company: 'ABC Cleaning' },
        { id: '3', firstName: 'Mike', lastName: 'Johnson', type: 'Guest', company: 'Tech Corp' }
      ]);
    }
  };

  const loadDailyEntries = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://verivault-production.up.railway.app';
      const response = await axios.get(`${apiUrl}/api/daily-entries/today`);
      setDailyEntries(response.data.entries || []);
    } catch (error) {
      console.error('Error loading daily entries:', error);
      // Mock data for development
      setDailyEntries([
        {
          id: '1',
          timestamp: new Date().toISOString(),
          type: 'guest',
          details: { name: 'John Smith', company: 'Tech Corp', timeIn: '09:00' },
          enteredBy: 'Agent Smith'
        }
      ]);
    }
  };

  const handleAddPerson = async () => {
    if (!newPersonForm.firstName || !newPersonForm.lastName) {
      alert('First name and last name are required');
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://verivault-production.up.railway.app';
      const response = await axios.post(`${apiUrl}/api/people`, {
        ...newPersonForm,
        addedBy: user.username
      });

      if (response.data.success) {
        setPeople([...people, response.data.person]);
        setNewPersonForm({
          firstName: '',
          lastName: '',
          type: 'Guest',
          company: '',
          department: '',
          phone: ''
        });
        alert(`✅ ${newPersonForm.type} added successfully!`);
      }
    } catch (error) {
      console.error('Error adding person:', error);
      alert('❌ Error adding person. Please try again.');
    }
  };

  const handleAddPackage = async () => {
    if (!newPackageForm.recipientFirstName || !newPackageForm.recipientLastName) {
      alert('Recipient name is required');
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://verivault-production.up.railway.app';
      const packageEntry: PackageEntry = {
        ...newPackageForm,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        enteredBy: user.username
      };

      const response = await axios.post(`${apiUrl}/api/packages`, packageEntry);

      if (response.data.success) {
        const newLogEntry: DailyLogEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: 'package',
          details: packageEntry,
          enteredBy: user.username
        };
        
        setDailyEntries([newLogEntry, ...dailyEntries]);
        setNewPackageForm({
          recipientFirstName: '',
          recipientLastName: '',
          senderName: '',
          senderCompany: '',
          trackingLastFour: '',
          packageType: 'Box',
          placementLocation: ''
        });
        alert('✅ Package logged successfully!');
      }
    } catch (error) {
      console.error('Error adding package:', error);
      alert('❌ Error logging package. Please try again.');
    }
  };

  const handleQuickLog = async () => {
    if (!quickLogForm.selectedPersonId) {
      alert('Please select a person from the dropdown');
      return;
    }

    const selectedPerson = people.find(p => p.id === quickLogForm.selectedPersonId);
    if (!selectedPerson) return;

    try {
      const logEntry: DailyLogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: quickLogForm.logType,
        details: {
          person: selectedPerson,
          timeIn: quickLogForm.timeIn,
          timeOut: quickLogForm.timeOut,
          purpose: quickLogForm.purpose,
          notes: quickLogForm.notes
        },
        enteredBy: user.username
      };

      setDailyEntries([logEntry, ...dailyEntries]);
      setQuickLogForm({
        selectedPersonId: '',
        logType: 'guest',
        timeIn: '',
        timeOut: '',
        purpose: '',
        notes: ''
      });
      setSearchQuery('');
      alert('✅ Entry logged successfully!');
    } catch (error) {
      console.error('Error adding log entry:', error);
      alert('❌ Error logging entry. Please try again.');
    }
  };

  const handlePersonSelect = (person: Person) => {
    setQuickLogForm({ ...quickLogForm, selectedPersonId: person.id });
    setSearchQuery(`${person.firstName} ${person.lastName}`);
    setShowDropdown(false);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      {/* Header */}
      <section style={{ padding: '80px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            marginBottom: '24px',
            background: 'linear-gradient(45deg, #06b6d4, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Daily Log
          </h1>
          <p style={{ 
            fontSize: '20px',
            color: '#94a3b8',
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Comprehensive daily activity tracking and management
          </p>
        </div>
      </section>

      {/* Sub-navigation */}
      <section style={{ padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            background: 'rgba(255,255,255,0.05)', 
            padding: '8px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={() => setActiveSubTab('log')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: activeSubTab === 'log' ? 'linear-gradient(45deg, #06b6d4, #3b82f6)' : 'transparent',
                color: 'white',
                fontSize: '14px',
                fontWeight: activeSubTab === 'log' ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              📝 Daily Entries
            </button>
            
            {isResidentialAgent && (
              <button
                onClick={() => setActiveSubTab('people')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeSubTab === 'people' ? 'linear-gradient(45deg, #06b6d4, #3b82f6)' : 'transparent',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: activeSubTab === 'people' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                👥 Add Guest/Vendor{isManager ? '/Staff' : ''}
              </button>
            )}
            
            <button
              onClick={() => setActiveSubTab('packages')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: activeSubTab === 'packages' ? 'linear-gradient(45deg, #06b6d4, #3b82f6)' : 'transparent',
                color: 'white',
                fontSize: '14px',
                fontWeight: activeSubTab === 'packages' ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              📦 Add Package
            </button>
          </div>
        </div>
      </section>

      {/* Content based on active sub-tab */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Daily Entries Tab */}
          {activeSubTab === 'log' && (
            <div>
              {/* Quick Add Entry (Smaller, above log) */}
              <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>
                  ➕ Add New Daily Entry
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {/* Name Search with Auto-complete */}
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label" style={{ fontSize: '14px' }}>Search Person</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Start typing name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowDropdown(searchQuery.length > 0)}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                    
                    {/* Auto-complete Dropdown */}
                    {showDropdown && filteredPeople.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        marginTop: '4px'
                      }}>
                        {filteredPeople.map((person) => (
                          <div
                            key={person.id}
                            onClick={() => handlePersonSelect(person)}
                            style={{
                              padding: '12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid rgba(255,255,255,0.1)',
                              fontSize: '14px',
                              transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ fontWeight: 'bold' }}>
                              {person.firstName} {person.lastName} ({person.type})
                            </div>
                            {person.company && (
                              <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                                {person.company}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Entry Type</label>
                    <select
                      className="form-input"
                      value={quickLogForm.logType}
                      onChange={(e) => setQuickLogForm({ ...quickLogForm, logType: e.target.value as 'guest' | 'vendor' })}
                      style={{ fontSize: '14px', padding: '8px' }}
                    >
                      <option value="guest">Guest Visit</option>
                      <option value="vendor">Vendor Activity</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Time In</label>
                    <input
                      type="time"
                      className="form-input"
                      value={quickLogForm.timeIn}
                      onChange={(e) => setQuickLogForm({ ...quickLogForm, timeIn: e.target.value })}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Time Out</label>
                    <input
                      type="time"
                      className="form-input"
                      value={quickLogForm.timeOut}
                      onChange={(e) => setQuickLogForm({ ...quickLogForm, timeOut: e.target.value })}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px' }}>Purpose</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Visit purpose..."
                      value={quickLogForm.purpose}
                      onChange={(e) => setQuickLogForm({ ...quickLogForm, purpose: e.target.value })}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontSize: '14px' }}>Notes</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Additional notes..."
                      value={quickLogForm.notes}
                      onChange={(e) => setQuickLogForm({ ...quickLogForm, notes: e.target.value })}
                      style={{ fontSize: '14px', padding: '8px' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <button
                    onClick={handleQuickLog}
                    className="btn btn-secondary"
                    style={{ fontSize: '14px' }}
                  >
                    ➕ Add Entry
                  </button>
                </div>
              </div>

              {/* Today's Log Entries */}
              <div className="card">
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#06b6d4' }}>
                  📋 Today's Entries ({dailyEntries.length})
                </h3>
                
                {dailyEntries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                    <p>No entries for today yet. Add the first entry above!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {dailyEntries.map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'grid',
                          gridTemplateColumns: '100px 1fr auto',
                          gap: '16px',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>
                            {formatTime(entry.timestamp)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {formatDate(entry.timestamp)}
                          </div>
                        </div>
                        
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ 
                              fontSize: '12px', 
                              background: entry.type === 'guest' ? '#10b981' : entry.type === 'vendor' ? '#3b82f6' : '#f59e0b',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              fontWeight: 'bold'
                            }}>
                              {entry.type}
                            </span>
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                              {entry.type === 'package' 
                                ? `${entry.details.recipientFirstName} ${entry.details.recipientLastName}`
                                : entry.details.person 
                                  ? `${entry.details.person.firstName} ${entry.details.person.lastName}`
                                  : entry.details.name
                              }
                            </span>
                          </div>
                          
                          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                            {entry.type === 'package' ? (
                              <>
                                {entry.details.packageType} from {entry.details.senderName} 
                                {entry.details.senderCompany && ` (${entry.details.senderCompany})`}
                                • Placed: {entry.details.placementLocation}
                                {entry.details.trackingLastFour && ` • Tracking: ***${entry.details.trackingLastFour}`}
                              </>
                            ) : (
                              <>
                                {entry.details.person?.company && `${entry.details.person.company} • `}
                                {entry.details.purpose && `${entry.details.purpose} • `}
                                {entry.details.timeIn && `In: ${entry.details.timeIn}`}
                                {entry.details.timeOut && ` • Out: ${entry.details.timeOut}`}
                                {entry.details.notes && ` • ${entry.details.notes}`}
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
                          by {entry.enteredBy}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add People Tab */}
          {activeSubTab === 'people' && isResidentialAgent && (
            <div className="card">
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                👥 Add New {isManager ? 'Guest/Vendor/Staff' : 'Guest/Vendor'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '24px' }}>
                Add people to the system for quick daily log entries
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="First name"
                    value={newPersonForm.firstName}
                    onChange={(e) => setNewPersonForm({ ...newPersonForm, firstName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Last name"
                    value={newPersonForm.lastName}
                    onChange={(e) => setNewPersonForm({ ...newPersonForm, lastName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-input"
                    value={newPersonForm.type}
                    onChange={(e) => setNewPersonForm({ ...newPersonForm, type: e.target.value as 'Staff' | 'Vendor' | 'Guest' })}
                  >
                    <option value="Guest">Guest</option>
                    <option value="Vendor">Vendor</option>
                    {isManager && <option value="Staff">Staff</option>}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {newPersonForm.type === 'Staff' ? 'Department' : 'Company'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={newPersonForm.type === 'Staff' ? 'Department' : 'Company name'}
                    value={newPersonForm.type === 'Staff' ? newPersonForm.department : newPersonForm.company}
                    onChange={(e) => setNewPersonForm({ 
                      ...newPersonForm, 
                      [newPersonForm.type === 'Staff' ? 'department' : 'company']: e.target.value 
                    })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone (Optional)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Phone number"
                    value={newPersonForm.phone}
                    onChange={(e) => setNewPersonForm({ ...newPersonForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={handleAddPerson}
                  className="btn"
                  disabled={!newPersonForm.firstName || !newPersonForm.lastName}
                >
                  ➕ Add {newPersonForm.type}
                </button>
              </div>

              {/* Permission Notice */}
              {!isManager && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '12px', 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#f59e0b'
                }}>
                  ⚠️ Note: Only Managers can add Staff members. You can add Guests and Vendors.
                </div>
              )}
            </div>
          )}

          {/* Add Package Tab */}
          {activeSubTab === 'packages' && (
            <div className="card">
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                📦 Log Package Delivery
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '24px' }}>
                Record package deliveries and placement information
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Recipient First Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="First name"
                    value={newPackageForm.recipientFirstName}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, recipientFirstName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Recipient Last Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Last name"
                    value={newPackageForm.recipientLastName}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, recipientLastName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sender Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Who sent it"
                    value={newPackageForm.senderName}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, senderName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sender Company</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Company name"
                    value={newPackageForm.senderCompany}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, senderCompany: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last 4 Digits of Tracking</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="1234"
                    maxLength={4}
                    value={newPackageForm.trackingLastFour}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, trackingLastFour: e.target.value.replace(/\D/g, '') })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Package Type</label>
                  <select
                    className="form-input"
                    value={newPackageForm.packageType}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, packageType: e.target.value })}
                  >
                    <option value="Box">Box</option>
                    <option value="Envelope">Envelope</option>
                    <option value="Tube">Tube</option>
                    <option value="Bag">Bag</option>
                    <option value="Multiple Items">Multiple Items</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Placement Location *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Where was the package placed?"
                    value={newPackageForm.placementLocation}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, placementLocation: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={handleAddPackage}
                  className="btn"
                  disabled={!newPackageForm.recipientFirstName || !newPackageForm.recipientLastName || !newPackageForm.placementLocation}
                >
                  📦 Log Package
                </button>
              </div>
            </div>
          )}
          
          {/* Generate Daily Report - At Bottom */}
          <div style={{ marginTop: '48px', textAlign: 'center', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button className="btn" style={{ fontSize: '16px', padding: '16px 32px' }}>
              📊 Generate Daily Report
            </button>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
              Create a comprehensive daily activity report
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedDailyLog; 