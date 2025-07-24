import React, { useState } from 'react';
import axios from 'axios';
import PinConfirmationModal from './PinConfirmationModal';

interface ReportGenerationSystemProps {
  onClose?: () => void;
}

interface Discrepancy {
  id: number;
  system: string;
  issue: string;
  severity: string;
  action: string;
  flagged: boolean;
}

const ReportGenerationSystem: React.FC<ReportGenerationSystemProps> = ({ onClose }) => {
  const [activeReportType, setActiveReportType] = useState<string>('');
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Medical Incident Report Form State
  const [medicalReportForm, setMedicalReportForm] = useState({
    injuredPersonInfo: {
      firstName: '',
      lastName: '',
      employeeId: '',
      department: '',
      jobTitle: '',
      phone: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: ''
    },
    incidentDetails: {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      location: '',
      exactLocation: '',
      witnesses: '',
      reportedBy: '',
      supervisorNotified: ''
    },
    injuryDetails: {
      bodyPart: '',
      injuryType: '',
      severity: 'minor',
      description: '',
      causedBy: '',
      activityAtTime: ''
    },
    actionsTaken: {
      firstAid: false,
      medicalAttention: false,
      hospitalTransport: false,
      workRestrictions: false,
      description: '',
      treatedBy: '',
      facilityName: '',
      doctorName: ''
    },
    resolution: {
      currentStatus: '',
      returnToWork: '',
      expectedReturn: '',
      followUpRequired: false,
      workersComp: false,
      additionalNotes: ''
    }
  });

  // Non-Medical Incident Report Form State
  const [nonMedicalReportForm, setNonMedicalReportForm] = useState({
    incidentDetails: {
      type: 'security_breach',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      location: '',
      description: '',
      severity: 'low',
      reportedBy: ''
    },
    personsInvolved: [
      {
        name: '',
        role: '',
        department: '',
        involvement: '',
        contactInfo: ''
      }
    ],
    systemsAffected: {
      security: false,
      network: false,
      equipment: false,
      facility: false,
      other: '',
      description: ''
    },
    correctiveActions: {
      immediateActions: '',
      preventiveMeasures: '',
      responsiblePerson: '',
      completionDate: '',
      followUpRequired: false,
      additionalNotes: ''
    },
    investigation: {
      rootCause: '',
      contributingFactors: '',
      recommendations: '',
      investigatedBy: ''
    }
  });

  // Security Systems Audit Form State
  const [auditReportForm, setAuditReportForm] = useState({
    auditDetails: {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].slice(0, 5),
      auditedBy: '',
      auditType: 'routine',
      location: 'all_areas'
    },
    cameras: {
      totalCount: '',
      operational: '',
      issues: [],
      coverage: 'excellent',
      recordingQuality: 'good',
      storageStatus: 'sufficient',
      notes: ''
    },
    beams: {
      totalCount: '',
      operational: '',
      issues: [],
      sensitivity: 'normal',
      coverage: 'complete',
      notes: ''
    },
    emergencyEquipment: {
      alarms: { count: '', operational: '', issues: [] },
      exits: { count: '', operational: '', issues: [] },
      lighting: { count: '', operational: '', issues: [] },
      communication: { count: '', operational: '', issues: [] },
      notes: ''
    },
    accessControl: {
      doors: { count: '', operational: '', issues: [] },
      cardReaders: { count: '', operational: '', issues: [] },
      locks: { count: '', operational: '', issues: [] },
      notes: ''
    },
    otherNotes: {
      generalObservations: '',
      recommendations: '',
      urgentIssues: '',
      nextAuditDate: ''
    },
    discrepancies: [] as Discrepancy[]
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const handlePinVerification = async (pin: string) => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://verivault-production.up.railway.app';
      
      const formData = new FormData();
      
      // Add form data based on report type
      if (activeReportType === 'medical') {
        formData.append('reportType', 'medical_incident');
        formData.append('formData', JSON.stringify(medicalReportForm));
      } else if (activeReportType === 'non-medical') {
        formData.append('reportType', 'non_medical_incident');
        formData.append('formData', JSON.stringify(nonMedicalReportForm));
      } else if (activeReportType === 'audit') {
        formData.append('reportType', 'security_audit');
        formData.append('formData', JSON.stringify(auditReportForm));
      }
      
      // Add verification data
      formData.append('verificationData', JSON.stringify({
        pin: pin,
        username: user.username,
        timestamp: new Date().toISOString(),
        reportType: activeReportType
      }));
      
      // Add files
      uploadedFiles.forEach((file, index) => {
        formData.append('attachments', file);
      });
      
      const response = await axios.post(`${apiUrl}/api/reports/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob'
      });
      
      // Create download link for PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeReportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      alert('✅ Report generated successfully and downloaded!');
      
      // Reset forms
      resetForms();
      setActiveReportType('');
      setPinModalOpen(false);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('❌ Error generating report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setMedicalReportForm({
      injuredPersonInfo: {
        firstName: '',
        lastName: '',
        employeeId: '',
        department: '',
        jobTitle: '',
        phone: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: ''
      },
      incidentDetails: {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        location: '',
        exactLocation: '',
        witnesses: '',
        reportedBy: '',
        supervisorNotified: ''
      },
      injuryDetails: {
        bodyPart: '',
        injuryType: '',
        severity: 'minor',
        description: '',
        causedBy: '',
        activityAtTime: ''
      },
      actionsTaken: {
        firstAid: false,
        medicalAttention: false,
        hospitalTransport: false,
        workRestrictions: false,
        description: '',
        treatedBy: '',
        facilityName: '',
        doctorName: ''
      },
      resolution: {
        currentStatus: '',
        returnToWork: '',
        expectedReturn: '',
        followUpRequired: false,
        workersComp: false,
        additionalNotes: ''
      }
    });
    setUploadedFiles([]);
  };

  const handleSubmitReport = () => {
    if (!activeReportType) return;
    
    // Validate required fields based on report type
    let isValid = true;
    let missingFields: string[] = [];
    
    if (activeReportType === 'medical') {
      if (!medicalReportForm.injuredPersonInfo.firstName) missingFields.push('First Name');
      if (!medicalReportForm.injuredPersonInfo.lastName) missingFields.push('Last Name');
      if (!medicalReportForm.incidentDetails.location) missingFields.push('Location');
      if (!medicalReportForm.injuryDetails.description) missingFields.push('Injury Description');
    } else if (activeReportType === 'non-medical') {
      if (!nonMedicalReportForm.incidentDetails.description) missingFields.push('Incident Description');
      if (!nonMedicalReportForm.incidentDetails.location) missingFields.push('Location');
    } else if (activeReportType === 'audit') {
      if (!auditReportForm.auditDetails.auditedBy) missingFields.push('Audited By');
      if (!auditReportForm.cameras.totalCount) missingFields.push('Camera Count');
    }
    
    if (missingFields.length > 0) {
      alert(`❌ Please fill in the following required fields:\n${missingFields.join('\n')}`);
      return;
    }
    
    setPinModalOpen(true);
  };

  const addPersonInvolved = () => {
    setNonMedicalReportForm({
      ...nonMedicalReportForm,
      personsInvolved: [
        ...nonMedicalReportForm.personsInvolved,
        {
          name: '',
          role: '',
          department: '',
          involvement: '',
          contactInfo: ''
        }
      ]
    });
  };

  const removePersonInvolved = (index: number) => {
    const newPersons = nonMedicalReportForm.personsInvolved.filter((_, i) => i !== index);
    setNonMedicalReportForm({
      ...nonMedicalReportForm,
      personsInvolved: newPersons
    });
  };

  const addDiscrepancy = () => {
    const newDiscrepancy: Discrepancy = {
      id: Date.now(),
      system: '',
      issue: '',
      severity: 'low',
      action: '',
      flagged: false
    };
    
    setAuditReportForm({
      ...auditReportForm,
      discrepancies: [
        ...auditReportForm.discrepancies,
        newDiscrepancy
      ]
    });
  };

  const removeDiscrepancy = (index: number) => {
    const newDiscrepancies = auditReportForm.discrepancies.filter((_, i) => i !== index);
    setAuditReportForm({
      ...auditReportForm,
      discrepancies: newDiscrepancies
    });
  };

  if (!activeReportType) {
    return (
      <div>
        {/* Header Section */}
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
              Report Generation
            </h1>
            <p style={{ 
              fontSize: '20px', 
              color: '#94a3b8', 
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Generate professional security reports with automatic watermarking and timestamp verification
            </p>
          </div>
        </section>

        {/* Report Type Selection */}
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '24px' 
            }}>
              
              {/* Medical Incident Report */}
              <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}
                   onClick={() => setActiveReportType('medical')}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚑</div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                  Incident Report - Medical
                </h3>
                <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
                  Medical emergency documentation with injury details, actions taken, and resolution tracking.
                </p>
                <button className="btn" style={{ width: '100%', fontSize: '14px' }}>
                  🏥 Create Medical Report
                </button>
              </div>

              {/* Non-Medical Incident Report */}
              <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}
                   onClick={() => setActiveReportType('non-medical')}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                  Incident Report - Non-Medical
                </h3>
                <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
                  Security incidents, breaches, system failures, and disturbances with corrective actions.
                </p>
                <button className="btn" style={{ width: '100%', fontSize: '14px' }}>
                  🚨 Create Incident Report
                </button>
              </div>

              {/* Security Systems Audit */}
              <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}
                   onClick={() => setActiveReportType('audit')}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                  Security Systems Audit
                </h3>
                <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
                  Comprehensive security system evaluation with discrepancy analysis and recommendations.
                </p>
                <button className="btn" style={{ width: '100%', fontSize: '14px' }}>
                  🔐 Create Audit Report
                </button>
              </div>
              
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Back Button */}
      <section style={{ padding: '80px 24px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button 
            onClick={() => setActiveReportType('')}
            className="btn btn-secondary"
            style={{ position: 'absolute', left: '24px', top: '100px' }}
          >
            ← Back to Reports
          </button>
          
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            marginBottom: '24px',
            background: 'linear-gradient(45deg, #06b6d4, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {activeReportType === 'medical' ? '🚑 Medical Incident Report' :
             activeReportType === 'non-medical' ? '⚠️ Non-Medical Incident Report' :
             '🔍 Security Systems Audit'}
          </h1>
        </div>
      </section>

      {/* Medical Incident Report Form */}
      {activeReportType === 'medical' && (
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Injured Person Information */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>
                👤 Injured Person Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={medicalReportForm.injuredPersonInfo.firstName}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      injuredPersonInfo: { ...medicalReportForm.injuredPersonInfo, firstName: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={medicalReportForm.injuredPersonInfo.lastName}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      injuredPersonInfo: { ...medicalReportForm.injuredPersonInfo, lastName: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={medicalReportForm.injuredPersonInfo.employeeId}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      injuredPersonInfo: { ...medicalReportForm.injuredPersonInfo, employeeId: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={medicalReportForm.injuredPersonInfo.department}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      injuredPersonInfo: { ...medicalReportForm.injuredPersonInfo, department: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={medicalReportForm.injuredPersonInfo.jobTitle}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      injuredPersonInfo: { ...medicalReportForm.injuredPersonInfo, jobTitle: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={medicalReportForm.injuredPersonInfo.phone}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      injuredPersonInfo: { ...medicalReportForm.injuredPersonInfo, phone: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>
                📅 Incident Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={medicalReportForm.incidentDetails.date}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      incidentDetails: { ...medicalReportForm.incidentDetails, date: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={medicalReportForm.incidentDetails.time}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      incidentDetails: { ...medicalReportForm.incidentDetails, time: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="General location (e.g., Main Building, Parking Lot)"
                    value={medicalReportForm.incidentDetails.location}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      incidentDetails: { ...medicalReportForm.incidentDetails, location: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Exact Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Specific location details (e.g., Room 205, Near staircase)"
                    value={medicalReportForm.incidentDetails.exactLocation}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      incidentDetails: { ...medicalReportForm.incidentDetails, exactLocation: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Injury Details */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>
                🩹 Injury Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Body Part Affected</label>
                  <select
                    className="form-input"
                    value={medicalReportForm.injuryDetails.bodyPart}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      injuryDetails: { ...medicalReportForm.injuryDetails, bodyPart: e.target.value }
                    })}
                  >
                    <option value="">Select body part</option>
                    <option value="head">Head</option>
                    <option value="neck">Neck</option>
                    <option value="shoulder">Shoulder</option>
                    <option value="arm">Arm</option>
                    <option value="hand">Hand</option>
                    <option value="back">Back</option>
                    <option value="chest">Chest</option>
                    <option value="leg">Leg</option>
                    <option value="foot">Foot</option>
                    <option value="multiple">Multiple</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Injury Type</label>
                  <select
                    className="form-input"
                    value={medicalReportForm.injuryDetails.injuryType}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      injuryDetails: { ...medicalReportForm.injuryDetails, injuryType: e.target.value }
                    })}
                  >
                    <option value="">Select injury type</option>
                    <option value="cut">Cut/Laceration</option>
                    <option value="bruise">Bruise/Contusion</option>
                    <option value="burn">Burn</option>
                    <option value="sprain">Sprain/Strain</option>
                    <option value="fracture">Fracture</option>
                    <option value="puncture">Puncture</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Severity</label>
                  <select
                    className="form-input"
                    value={medicalReportForm.injuryDetails.severity}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      injuryDetails: { ...medicalReportForm.injuryDetails, severity: e.target.value }
                    })}
                  >
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="serious">Serious</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description of Injury *</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Detailed description of the injury and how it occurred"
                  value={medicalReportForm.injuryDetails.description}
                  onChange={(e) => setMedicalReportForm({
                    ...medicalReportForm,
                    injuryDetails: { ...medicalReportForm.injuryDetails, description: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Actions Taken */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#10b981' }}>
                🚑 Actions Taken
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px', accentColor: '#10b981' }}
                      checked={medicalReportForm.actionsTaken.firstAid}
                      onChange={(e) => setMedicalReportForm({
                        ...medicalReportForm,
                        actionsTaken: { ...medicalReportForm.actionsTaken, firstAid: e.target.checked }
                      })}
                    />
                    First Aid Administered
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px', accentColor: '#10b981' }}
                      checked={medicalReportForm.actionsTaken.medicalAttention}
                      onChange={(e) => setMedicalReportForm({
                        ...medicalReportForm,
                        actionsTaken: { ...medicalReportForm.actionsTaken, medicalAttention: e.target.checked }
                      })}
                    />
                    Medical Attention Sought
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px', accentColor: '#10b981' }}
                      checked={medicalReportForm.actionsTaken.hospitalTransport}
                      onChange={(e) => setMedicalReportForm({
                        ...medicalReportForm,
                        actionsTaken: { ...medicalReportForm.actionsTaken, hospitalTransport: e.target.checked }
                      })}
                    />
                    Hospital Transport Required
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px', accentColor: '#10b981' }}
                      checked={medicalReportForm.actionsTaken.workRestrictions}
                      onChange={(e) => setMedicalReportForm({
                        ...medicalReportForm,
                        actionsTaken: { ...medicalReportForm.actionsTaken, workRestrictions: e.target.checked }
                      })}
                    />
                    Work Restrictions Applied
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description of Actions Taken</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Detailed description of all actions taken immediately following the incident"
                  value={medicalReportForm.actionsTaken.description}
                  onChange={(e) => setMedicalReportForm({
                    ...medicalReportForm,
                    actionsTaken: { ...medicalReportForm.actionsTaken, description: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Resolution */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#8b5cf6' }}>
                ✅ Resolution & Follow-up
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Current Status</label>
                  <select
                    className="form-input"
                    value={medicalReportForm.resolution.currentStatus}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      resolution: { ...medicalReportForm.resolution, currentStatus: e.target.value }
                    })}
                  >
                    <option value="">Select status</option>
                    <option value="treated-returned">Treated and Returned to Work</option>
                    <option value="sent-hospital">Sent to Hospital</option>
                    <option value="sent-home">Sent Home</option>
                    <option value="under-medical-care">Under Medical Care</option>
                    <option value="light-duty">Light Duty Assignment</option>
                    <option value="off-work">Off Work</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Return Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={medicalReportForm.resolution.expectedReturn}
                    onChange={(e) => setMedicalReportForm({
                      ...medicalReportForm,
                      resolution: { ...medicalReportForm.resolution, expectedReturn: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Follow-up actions required, insurance claims, safety improvements needed..."
                  value={medicalReportForm.resolution.additionalNotes}
                  onChange={(e) => setMedicalReportForm({
                    ...medicalReportForm,
                    resolution: { ...medicalReportForm.resolution, additionalNotes: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>
                📸 Photo & Video Evidence
              </h3>
              <div style={{ border: '2px dashed rgba(245, 158, 11, 0.4)', borderRadius: '8px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📷</div>
                <p style={{ marginBottom: '12px', color: '#94a3b8' }}>
                  Upload photos and videos of the incident scene, injuries, or evidence
                </p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  id="medicalReportFiles"
                  onChange={handleFileUpload}
                />
                <label htmlFor="medicalReportFiles" className="btn" style={{ cursor: 'pointer' }}>
                  📎 Upload Files
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '14px' }}>{file.name}</span>
                      <button 
                        onClick={() => removeFile(index)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#ef4444', 
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={handleSubmitReport}
                className="btn"
                disabled={loading}
                style={{ fontSize: '16px', padding: '16px 32px' }}
              >
                {loading ? '⏳ Generating Report...' : '📝 Generate Medical Report'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Non-Medical Incident Report Form */}
      {activeReportType === 'non-medical' && (
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Incident Details */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>
                🚨 Incident Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Incident Type *</label>
                  <select
                    className="form-input"
                    value={nonMedicalReportForm.incidentDetails.type}
                    onChange={(e) => setNonMedicalReportForm({
                      ...nonMedicalReportForm,
                      incidentDetails: { ...nonMedicalReportForm.incidentDetails, type: e.target.value }
                    })}
                  >
                    <option value="security_breach">Security Breach</option>
                    <option value="system_failure">System Failure</option>
                    <option value="disturbance">Disturbance</option>
                    <option value="theft">Theft/Vandalism</option>
                    <option value="policy_violation">Policy Violation</option>
                    <option value="equipment_failure">Equipment Failure</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={nonMedicalReportForm.incidentDetails.date}
                    onChange={(e) => setNonMedicalReportForm({
                      ...nonMedicalReportForm,
                      incidentDetails: { ...nonMedicalReportForm.incidentDetails, date: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={nonMedicalReportForm.incidentDetails.time}
                    onChange={(e) => setNonMedicalReportForm({
                      ...nonMedicalReportForm,
                      incidentDetails: { ...nonMedicalReportForm.incidentDetails, time: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Severity</label>
                  <select
                    className="form-input"
                    value={nonMedicalReportForm.incidentDetails.severity}
                    onChange={(e) => setNonMedicalReportForm({
                      ...nonMedicalReportForm,
                      incidentDetails: { ...nonMedicalReportForm.incidentDetails, severity: e.target.value }
                    })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Where did the incident occur?"
                  value={nonMedicalReportForm.incidentDetails.location}
                  onChange={(e) => setNonMedicalReportForm({
                    ...nonMedicalReportForm,
                    incidentDetails: { ...nonMedicalReportForm.incidentDetails, location: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Detailed description of what happened, including timeline of events"
                  value={nonMedicalReportForm.incidentDetails.description}
                  onChange={(e) => setNonMedicalReportForm({
                    ...nonMedicalReportForm,
                    incidentDetails: { ...nonMedicalReportForm.incidentDetails, description: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Persons Involved */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
                  👥 Persons Involved
                </h3>
                <button onClick={addPersonInvolved} className="btn btn-secondary" style={{ fontSize: '14px' }}>
                  ➕ Add Person
                </button>
              </div>
              
              {nonMedicalReportForm.personsInvolved.map((person, index) => (
                <div key={index} style={{ 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '16px',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Person {index + 1}</h4>
                    {nonMedicalReportForm.personsInvolved.length > 1 && (
                      <button 
                        onClick={() => removePersonInvolved(index)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#ef4444', 
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={person.name}
                        onChange={(e) => {
                          const newPersons = [...nonMedicalReportForm.personsInvolved];
                          newPersons[index].name = e.target.value;
                          setNonMedicalReportForm({
                            ...nonMedicalReportForm,
                            personsInvolved: newPersons
                          });
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Employee, Visitor, Vendor, etc."
                        value={person.role}
                        onChange={(e) => {
                          const newPersons = [...nonMedicalReportForm.personsInvolved];
                          newPersons[index].role = e.target.value;
                          setNonMedicalReportForm({
                            ...nonMedicalReportForm,
                            personsInvolved: newPersons
                          });
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department/Company</label>
                      <input
                        type="text"
                        className="form-input"
                        value={person.department}
                        onChange={(e) => {
                          const newPersons = [...nonMedicalReportForm.personsInvolved];
                          newPersons[index].department = e.target.value;
                          setNonMedicalReportForm({
                            ...nonMedicalReportForm,
                            personsInvolved: newPersons
                          });
                        }}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Involvement Description</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="How was this person involved in the incident?"
                        value={person.involvement}
                        onChange={(e) => {
                          const newPersons = [...nonMedicalReportForm.personsInvolved];
                          newPersons[index].involvement = e.target.value;
                          setNonMedicalReportForm({
                            ...nonMedicalReportForm,
                            personsInvolved: newPersons
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Systems Affected */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>
                🖥️ Systems Affected
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px', accentColor: '#f59e0b' }}
                      checked={nonMedicalReportForm.systemsAffected.security}
                      onChange={(e) => setNonMedicalReportForm({
                        ...nonMedicalReportForm,
                        systemsAffected: { ...nonMedicalReportForm.systemsAffected, security: e.target.checked }
                      })}
                    />
                    Security Systems
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px', accentColor: '#f59e0b' }}
                      checked={nonMedicalReportForm.systemsAffected.network}
                      onChange={(e) => setNonMedicalReportForm({
                        ...nonMedicalReportForm,
                        systemsAffected: { ...nonMedicalReportForm.systemsAffected, network: e.target.checked }
                      })}
                    />
                    Network/IT Systems
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px', accentColor: '#f59e0b' }}
                      checked={nonMedicalReportForm.systemsAffected.equipment}
                      onChange={(e) => setNonMedicalReportForm({
                        ...nonMedicalReportForm,
                        systemsAffected: { ...nonMedicalReportForm.systemsAffected, equipment: e.target.checked }
                      })}
                    />
                    Equipment/Machinery
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      style={{ marginRight: '8px', accentColor: '#f59e0b' }}
                      checked={nonMedicalReportForm.systemsAffected.facility}
                      onChange={(e) => setNonMedicalReportForm({
                        ...nonMedicalReportForm,
                        systemsAffected: { ...nonMedicalReportForm.systemsAffected, facility: e.target.checked }
                      })}
                    />
                    Facility/Building
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">System Impact Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Describe how systems were affected and any downtime or damage"
                  value={nonMedicalReportForm.systemsAffected.description}
                  onChange={(e) => setNonMedicalReportForm({
                    ...nonMedicalReportForm,
                    systemsAffected: { ...nonMedicalReportForm.systemsAffected, description: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Corrective Actions */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#10b981' }}>
                🔧 Corrective Actions Taken
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Immediate Actions Taken</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="What was done immediately to address the incident?"
                    value={nonMedicalReportForm.correctiveActions.immediateActions}
                    onChange={(e) => setNonMedicalReportForm({
                      ...nonMedicalReportForm,
                      correctiveActions: { ...nonMedicalReportForm.correctiveActions, immediateActions: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Preventive Measures</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="What steps are being taken to prevent similar incidents?"
                    value={nonMedicalReportForm.correctiveActions.preventiveMeasures}
                    onChange={(e) => setNonMedicalReportForm({
                      ...nonMedicalReportForm,
                      correctiveActions: { ...nonMedicalReportForm.correctiveActions, preventiveMeasures: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Responsible Person</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Who is responsible for follow-up?"
                    value={nonMedicalReportForm.correctiveActions.responsiblePerson}
                    onChange={(e) => setNonMedicalReportForm({
                      ...nonMedicalReportForm,
                      correctiveActions: { ...nonMedicalReportForm.correctiveActions, responsiblePerson: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Completion Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={nonMedicalReportForm.correctiveActions.completionDate}
                    onChange={(e) => setNonMedicalReportForm({
                      ...nonMedicalReportForm,
                      correctiveActions: { ...nonMedicalReportForm.correctiveActions, completionDate: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>
                📎 Supporting Evidence
              </h3>
              <div style={{ border: '2px dashed rgba(245, 158, 11, 0.4)', borderRadius: '8px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
                <p style={{ marginBottom: '12px', color: '#94a3b8' }}>
                  Upload photos, videos, documents, or other evidence related to the incident
                </p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  id="nonMedicalReportFiles"
                  onChange={handleFileUpload}
                />
                <label htmlFor="nonMedicalReportFiles" className="btn" style={{ cursor: 'pointer' }}>
                  📎 Upload Files
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '14px' }}>{file.name}</span>
                      <button 
                        onClick={() => removeFile(index)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#ef4444', 
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={handleSubmitReport}
                className="btn"
                disabled={loading}
                style={{ fontSize: '16px', padding: '16px 32px' }}
              >
                {loading ? '⏳ Generating Report...' : '📝 Generate Incident Report'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Security Systems Audit Form */}
      {activeReportType === 'audit' && (
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Audit Details */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>
                📋 Audit Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={auditReportForm.auditDetails.date}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      auditDetails: { ...auditReportForm.auditDetails, date: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={auditReportForm.auditDetails.time}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      auditDetails: { ...auditReportForm.auditDetails, time: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Audited By *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={auditReportForm.auditDetails.auditedBy}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      auditDetails: { ...auditReportForm.auditDetails, auditedBy: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Audit Type</label>
                  <select
                    className="form-input"
                    value={auditReportForm.auditDetails.auditType}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      auditDetails: { ...auditReportForm.auditDetails, auditType: e.target.value }
                    })}
                  >
                    <option value="routine">Routine Inspection</option>
                    <option value="incident">Post-Incident</option>
                    <option value="maintenance">Maintenance Check</option>
                    <option value="compliance">Compliance Audit</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Camera Systems */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#8b5cf6' }}>
                📹 Camera Systems
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Total Count *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={auditReportForm.cameras.totalCount}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      cameras: { ...auditReportForm.cameras, totalCount: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Operational</label>
                  <input
                    type="number"
                    className="form-input"
                    value={auditReportForm.cameras.operational}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      cameras: { ...auditReportForm.cameras, operational: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Coverage Quality</label>
                  <select
                    className="form-input"
                    value={auditReportForm.cameras.coverage}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      cameras: { ...auditReportForm.cameras, coverage: e.target.value }
                    })}
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Recording Quality</label>
                  <select
                    className="form-input"
                    value={auditReportForm.cameras.recordingQuality}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      cameras: { ...auditReportForm.cameras, recordingQuality: e.target.value }
                    })}
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Camera Notes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Any issues, maintenance needs, or observations about camera systems"
                  value={auditReportForm.cameras.notes}
                  onChange={(e) => setAuditReportForm({
                    ...auditReportForm,
                    cameras: { ...auditReportForm.cameras, notes: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Beam Systems */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>
                📡 Beam/Motion Detection Systems
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Total Count</label>
                  <input
                    type="number"
                    className="form-input"
                    value={auditReportForm.beams.totalCount}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      beams: { ...auditReportForm.beams, totalCount: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Operational</label>
                  <input
                    type="number"
                    className="form-input"
                    value={auditReportForm.beams.operational}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      beams: { ...auditReportForm.beams, operational: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sensitivity</label>
                  <select
                    className="form-input"
                    value={auditReportForm.beams.sensitivity}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      beams: { ...auditReportForm.beams, sensitivity: e.target.value }
                    })}
                  >
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Coverage</label>
                  <select
                    className="form-input"
                    value={auditReportForm.beams.coverage}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      beams: { ...auditReportForm.beams, coverage: e.target.value }
                    })}
                  >
                    <option value="complete">Complete</option>
                    <option value="adequate">Adequate</option>
                    <option value="partial">Partial</option>
                    <option value="insufficient">Insufficient</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Beam System Notes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Any issues, false alarms, or observations about beam/motion systems"
                  value={auditReportForm.beams.notes}
                  onChange={(e) => setAuditReportForm({
                    ...auditReportForm,
                    beams: { ...auditReportForm.beams, notes: e.target.value }
                  })}
                />
              </div>
            </div>

            {/* Emergency Equipment */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>
                🚨 Emergency Equipment
              </h3>
              
              {/* Alarms */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#ef4444' }}>Fire/Security Alarms</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Count</label>
                    <input
                      type="number"
                      className="form-input"
                      value={auditReportForm.emergencyEquipment.alarms.count}
                      onChange={(e) => setAuditReportForm({
                        ...auditReportForm,
                        emergencyEquipment: {
                          ...auditReportForm.emergencyEquipment,
                          alarms: { ...auditReportForm.emergencyEquipment.alarms, count: e.target.value }
                        }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operational</label>
                    <input
                      type="number"
                      className="form-input"
                      value={auditReportForm.emergencyEquipment.alarms.operational}
                      onChange={(e) => setAuditReportForm({
                        ...auditReportForm,
                        emergencyEquipment: {
                          ...auditReportForm.emergencyEquipment,
                          alarms: { ...auditReportForm.emergencyEquipment.alarms, operational: e.target.value }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Exits */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#f59e0b' }}>Emergency Exits</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Count</label>
                    <input
                      type="number"
                      className="form-input"
                      value={auditReportForm.emergencyEquipment.exits.count}
                      onChange={(e) => setAuditReportForm({
                        ...auditReportForm,
                        emergencyEquipment: {
                          ...auditReportForm.emergencyEquipment,
                          exits: { ...auditReportForm.emergencyEquipment.exits, count: e.target.value }
                        }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operational</label>
                    <input
                      type="number"
                      className="form-input"
                      value={auditReportForm.emergencyEquipment.exits.operational}
                      onChange={(e) => setAuditReportForm({
                        ...auditReportForm,
                        emergencyEquipment: {
                          ...auditReportForm.emergencyEquipment,
                          exits: { ...auditReportForm.emergencyEquipment.exits, operational: e.target.value }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Lighting */}
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#10b981' }}>Emergency Lighting</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Count</label>
                    <input
                      type="number"
                      className="form-input"
                      value={auditReportForm.emergencyEquipment.lighting.count}
                      onChange={(e) => setAuditReportForm({
                        ...auditReportForm,
                        emergencyEquipment: {
                          ...auditReportForm.emergencyEquipment,
                          lighting: { ...auditReportForm.emergencyEquipment.lighting, count: e.target.value }
                        }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operational</label>
                    <input
                      type="number"
                      className="form-input"
                      value={auditReportForm.emergencyEquipment.lighting.operational}
                      onChange={(e) => setAuditReportForm({
                        ...auditReportForm,
                        emergencyEquipment: {
                          ...auditReportForm.emergencyEquipment,
                          lighting: { ...auditReportForm.emergencyEquipment.lighting, operational: e.target.value }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Discrepancies */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
                  ⚠️ Discrepancies & Issues
                </h3>
                <button onClick={addDiscrepancy} className="btn btn-secondary" style={{ fontSize: '14px' }}>
                  ➕ Add Discrepancy
                </button>
              </div>
              
              {auditReportForm.discrepancies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                  <p>No discrepancies recorded. Click "Add Discrepancy" to report any issues found.</p>
                </div>
              ) : (
                auditReportForm.discrepancies.map((discrepancy, index) => (
                  <div key={index} style={{ 
                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                    borderRadius: '8px', 
                    padding: '16px', 
                    marginBottom: '16px',
                    background: 'rgba(239, 68, 68, 0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>Discrepancy {index + 1}</h4>
                      <button 
                        onClick={() => removeDiscrepancy(index)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#ef4444', 
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                      <div className="form-group">
                        <label className="form-label">System</label>
                        <select
                          className="form-input"
                          value={discrepancy.system}
                          onChange={(e) => {
                            const newDiscrepancies = [...auditReportForm.discrepancies];
                            newDiscrepancies[index].system = e.target.value;
                            setAuditReportForm({
                              ...auditReportForm,
                              discrepancies: newDiscrepancies
                            });
                          }}
                        >
                          <option value="">Select system</option>
                          <option value="cameras">Cameras</option>
                          <option value="beams">Beams/Motion</option>
                          <option value="alarms">Alarms</option>
                          <option value="exits">Emergency Exits</option>
                          <option value="lighting">Emergency Lighting</option>
                          <option value="access_control">Access Control</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Severity</label>
                        <select
                          className="form-input"
                          value={discrepancy.severity}
                          onChange={(e) => {
                            const newDiscrepancies = [...auditReportForm.discrepancies];
                            newDiscrepancies[index].severity = e.target.value;
                            setAuditReportForm({
                              ...auditReportForm,
                              discrepancies: newDiscrepancies
                            });
                          }}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            style={{ marginRight: '8px', accentColor: '#ef4444' }}
                            checked={discrepancy.flagged}
                            onChange={(e) => {
                              const newDiscrepancies = [...auditReportForm.discrepancies];
                              newDiscrepancies[index].flagged = e.target.checked;
                              setAuditReportForm({
                                ...auditReportForm,
                                discrepancies: newDiscrepancies
                              });
                            }}
                          />
                          Flag for Priority
                        </label>
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label">Issue Description</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        placeholder="Describe the issue or discrepancy found"
                        value={discrepancy.issue}
                        onChange={(e) => {
                          const newDiscrepancies = [...auditReportForm.discrepancies];
                          newDiscrepancies[index].issue = e.target.value;
                          setAuditReportForm({
                            ...auditReportForm,
                            discrepancies: newDiscrepancies
                          });
                        }}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Recommended Action</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        placeholder="What action should be taken to resolve this issue?"
                        value={discrepancy.action}
                        onChange={(e) => {
                          const newDiscrepancies = [...auditReportForm.discrepancies];
                          newDiscrepancies[index].action = e.target.value;
                          setAuditReportForm({
                            ...auditReportForm,
                            discrepancies: newDiscrepancies
                          });
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Other Notes */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>
                📝 Other Notes & Recommendations
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">General Observations</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Overall observations about the security systems"
                    value={auditReportForm.otherNotes.generalObservations}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      otherNotes: { ...auditReportForm.otherNotes, generalObservations: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Recommendations</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Recommendations for improvements or upgrades"
                    value={auditReportForm.otherNotes.recommendations}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      otherNotes: { ...auditReportForm.otherNotes, recommendations: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Next Audit Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={auditReportForm.otherNotes.nextAuditDate}
                    onChange={(e) => setAuditReportForm({
                      ...auditReportForm,
                      otherNotes: { ...auditReportForm.otherNotes, nextAuditDate: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>
                📎 Supporting Documentation
              </h3>
              <div style={{ border: '2px dashed rgba(245, 158, 11, 0.4)', borderRadius: '8px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
                <p style={{ marginBottom: '12px', color: '#94a3b8' }}>
                  Upload photos of equipment, maintenance records, or other supporting documents
                </p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  id="auditReportFiles"
                  onChange={handleFileUpload}
                />
                <label htmlFor="auditReportFiles" className="btn" style={{ cursor: 'pointer' }}>
                  📎 Upload Files
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '14px' }}>{file.name}</span>
                      <button 
                        onClick={() => removeFile(index)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#ef4444', 
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={handleSubmitReport}
                className="btn"
                disabled={loading}
                style={{ fontSize: '16px', padding: '16px 32px' }}
              >
                {loading ? '⏳ Generating Report...' : '📝 Generate Audit Report'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* PIN Confirmation Modal */}
      <PinConfirmationModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onConfirm={handlePinVerification}
        reportType={activeReportType === 'medical' ? 'Medical Incident Report' :
                   activeReportType === 'non-medical' ? 'Non-Medical Incident Report' :
                   'Security Systems Audit'}
        reportData={activeReportType === 'medical' ? medicalReportForm :
                   activeReportType === 'non-medical' ? nonMedicalReportForm :
                   auditReportForm}
      />
    </div>
  );
};

export default ReportGenerationSystem; 