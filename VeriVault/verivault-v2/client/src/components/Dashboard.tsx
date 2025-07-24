import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PinConfirmationModal from './PinConfirmationModal';
import EnhancedDailyLog from './EnhancedDailyLog';
import ReportGenerationSystem from './ReportGenerationSystem';

interface LogEntry {
  id: number;
  category: string;
  timestamp: string;
  location: string;
  subject: string;
  action: string;
  priority: string;
  notes?: string;
}

const Dashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [currentReportType, setCurrentReportType] = useState('');
  const [currentReportData, setCurrentReportData] = useState<any>(null);
  const navigate = useNavigate();

  // Removed unused formData state to fix build errors

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    loadLogs();
  }, [navigate]);

  const loadLogs = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://verivault-production.up.railway.app';
      const response = await axios.get(`${apiUrl}/api/logs`);
      setLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed unused handleSubmit function to fix build errors

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Removed unused categoryOptions to fix build errors

  // Calculate statistics
  const todayLogs = logs.filter(log => {
    const today = new Date().toDateString();
    const logDate = new Date(log.timestamp).toDateString();
    return today === logDate;
  });

  const stats = {
    totalLogs: logs.length,
    todayLogs: todayLogs.length,
    highPriority: logs.filter(log => log.priority === 'high').length,
    incidents: logs.filter(log => log.category === 'incident').length
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'administrator' || user.username === 'admin';

  // PIN confirmation handlers
  const handleReportSubmit = (reportType: string, reportData: any) => {
    // TODO: FUTURE - Check if LLM review is required for this report type
    // if (LLM_REVIEW_CONFIG.REVIEW_REQUIREMENTS[reportType]) {
    //   setShowLLMReviewInfo(true);
    // }
    
    setCurrentReportType(reportType);
    setCurrentReportData(reportData);
    setPinModalOpen(true);
  };

  const handlePinConfirmed = async (verificationData: any) => {
    try {
      // TODO: FUTURE PHASE - Multi-LLM Review Pipeline Integration
      // ========================================================
      // PLANNED FRONTEND ENHANCEMENTS:
      // 1. Pre-submission LLM Analysis Progress Tracking:
      //    - Show loading states for each LLM analysis phase
      //    - Display real-time progress: "GPT-4o analyzing..." -> "Claude 3 analyzing..." -> "Command R+ consensus..."
      //    - Estimated time remaining based on report complexity
      //
      // 2. LLM Review Results Display:
      //    - Modal showing confidence scores from each LLM
      //    - Highlighted discrepancies or flagged concerns
      //    - Option to proceed with consensus or request human review
      //
      // 3. Enhanced User Experience:
      //    - Progressive disclosure of LLM findings
      //    - Interactive confidence meter
      //    - Options to refine report based on AI suggestions
      //    - Preview of consensus improvements before final submission
      //
      // EXAMPLE FUTURE IMPLEMENTATION:
      // const llmReviewModal = new LLMReviewProgressModal();
      // llmReviewModal.show(currentReportType, currentReportData);
      // 
      // const llmResults = await performLLMAnalysis({
      //   reportType: currentReportType,
      //   reportData: currentReportData,
      //   onProgress: (phase, progress) => llmReviewModal.updateProgress(phase, progress)
      // });
      //
      // if (llmResults.requiresUserReview) {
      //   const userChoice = await showLLMResultsModal(llmResults);
      //   if (userChoice === 'human-review') {
      //     await requestManualReview(currentReportData, llmResults.concerns);
      //     return;
      //   }
      // }
      // ========================================================

      // Generate PDF with watermark using the verification data
      const apiUrl = process.env.REACT_APP_API_URL || 'https://verivault-production.up.railway.app';
      const response = await axios.post(`${apiUrl}/api/reports/generate-with-watermark`, {
        reportType: currentReportType,
        reportData: currentReportData,
        verificationData: verificationData
      });

      if (response.data.success) {
        // Open the HTML report in a new window for printing/PDF generation
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(response.data.pdfContent);
          newWindow.document.close();
          
          // The HTML includes auto-print functionality
          // User can save as PDF from the print dialog
        }

        // Show success notification with submission details
        alert(`✅ ${currentReportType} report generated successfully!\n\n🔐 Security Features Applied:\n• PIN Authentication Verified\n• Invisible Watermark Applied\n• Submission ID: ${response.data.submissionId}\n\nReport opened in new window for printing/saving as PDF.`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('❌ Error generating report. Please try again.');
    }
  };

  const handlePinModalClose = () => {
    setPinModalOpen(false);
    setCurrentReportType('');
    setCurrentReportData(null);
  };

  // Define navigation tabs
  const navigationTabs = [
    { id: 'dashboard', label: '📊 Dashboard', active: activeTab === 'dashboard' },
    { id: 'report-generation', label: '📈 Report Generation', active: activeTab === 'report-generation' },
    { id: 'daily-log', label: '📝 Daily Log', active: activeTab === 'daily-log' },
    { id: 'report-review', label: '📋 Report Review', active: activeTab === 'report-review' },
    ...(isAdmin ? [{ id: 'user-management', label: '👥 User & Vendor Management', active: activeTab === 'user-management' }] : []),
    { id: 'settings', label: '⚙️ Settings', active: activeTab === 'settings' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(45deg, #06b6d4, #3b82f6)', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              V
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>VeriVault</h1>
              <p style={{ fontSize: '14px', color: '#06b6d4', margin: 0 }}>Security Intelligence</p>
            </div>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Welcome, {user.username || 'Admin'}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{user.role || 'Administrator'}</p>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ fontSize: '14px', padding: '8px 16px' }}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{ padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '32px', minWidth: 'max-content' }}>
            {navigationTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '20px 0',
                  color: tab.active ? '#06b6d4' : '#94a3b8',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderBottom: tab.active ? '2px solid #06b6d4' : '2px solid transparent',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Hero Section */}
          <section style={{ padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h1 style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                marginBottom: '24px',
                background: 'linear-gradient(45deg, #06b6d4, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Security Dashboard
              </h1>
              <p style={{ 
                fontSize: '20px', 
                color: '#94a3b8', 
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                Real-time security monitoring and intelligent activity management for professional operations.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('daily-log')} className="btn" style={{ textDecoration: 'none' }}>
                  📝 New Log Entry
                </button>
                <button onClick={() => setActiveTab('report-generation')} className="btn btn-secondary">
                  📊 Generate Report
                </button>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section style={{ padding: '80px 24px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
                  Live Security Metrics
                </h2>
                <p style={{ fontSize: '20px', color: '#94a3b8' }}>
                  Real-time insights into your security operations
                </p>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '24px',
                marginBottom: '64px'
              }}>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>📋</div>
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#06b6d4' }}>
                    {stats.totalLogs}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Total Security Logs</p>
                </div>
                
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>📅</div>
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#10b981' }}>
                    {stats.todayLogs}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Today's Entries</p>
                </div>
                
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>👥</div>
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#8b5cf6' }}>
                    12
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Active Visitors</p>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>📦</div>
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#f59e0b' }}>
                    7
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Pending Packages</p>
                </div>
                
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>🚨</div>
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#ef4444' }}>
                    {stats.incidents}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Incidents Today</p>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>👨‍💼</div>
                  <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#10b981' }}>
                    24
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Staff On-Site</p>
                </div>
              </div>
            </div>
          </section>

          {/* Overview Sections */}
          <section style={{ padding: '0 24px 80px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
                gap: '32px' 
              }}>
                
                {/* Recent Reports Overview */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 }}>📊 Recent Reports</h3>
                    <button 
                      onClick={() => setActiveTab('report-review')}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#06b6d4', 
                        fontSize: '14px', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      View All →
                    </button>
                  </div>
                  
                  <div>
                    <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ 
                          background: 'linear-gradient(45deg, #06b6d4, #3b82f6)',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          DAILY REPORT
                        </span>
                        <span style={{ color: '#10b981', fontSize: '10px' }}>✓ Generated</span>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Daily Security Report</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>January 18, 2024</p>
                      <p style={{ fontSize: '11px', color: '#64748b' }}>12 events recorded</p>
                    </div>

                    <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ 
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          INCIDENT
                        </span>
                        <span style={{ color: '#10b981', fontSize: '10px' }}>✓ Generated</span>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Security Incident Report</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Main Entrance - Unauthorized Access</p>
                      <p style={{ fontSize: '11px', color: '#64748b' }}>2 hours ago</p>
                    </div>

                    <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ 
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#f59e0b',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          TRENDS
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '10px' }}>⏳ Processing</span>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Weekly Trend Analysis</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Security Patterns - Week 3</p>
                      <p style={{ fontSize: '11px', color: '#64748b' }}>ETA: 5 minutes</p>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <button onClick={() => setActiveTab('report-generation')} className="btn" style={{ fontSize: '12px', padding: '8px 16px' }}>
                        📈 Generate New Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Security Activity Overview */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 }}>🔒 Recent Security Activity</h3>
                    <button 
                      onClick={() => setActiveTab('daily-log')}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#06b6d4', 
                        fontSize: '14px', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      View All →
                    </button>
                  </div>
                  
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '32px' }}>
                      <p style={{ color: '#94a3b8' }}>Loading activity...</p>
                    </div>
                  ) : (
                    <div>
                      {logs.slice(0, 4).map((log) => (
                        <div key={log.id} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ 
                              color: '#06b6d4', 
                              fontSize: '10px', 
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}>
                              {log.category}
                            </span>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: log.priority === 'high' ? '#ef4444' :
                                         log.priority === 'medium' ? '#f59e0b' : '#10b981'
                            }}></div>
                          </div>
                          <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{log.subject}</p>
                          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                            {log.action} • {log.location}
                          </p>
                          <p style={{ fontSize: '11px', color: '#64748b' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      
                      {logs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
                          <p style={{ color: '#94a3b8', marginBottom: '16px' }}>No recent activity</p>
                          <button onClick={() => setActiveTab('daily-log')} className="btn" style={{ fontSize: '12px', padding: '8px 16px' }}>
                            Add First Entry
                          </button>
                        </div>
                      )}

                      {logs.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                          <button onClick={() => setActiveTab('daily-log')} className="btn" style={{ fontSize: '12px', padding: '8px 16px' }}>
                            📝 Add New Entry
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* System Activity Overview */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', margin: 0 }}>⚙️ System Activity</h3>
                    <button 
                      onClick={() => setActiveTab('settings')}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#06b6d4', 
                        fontSize: '14px', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Settings →
                    </button>
                  </div>
                  
                  <div>
                    {/* System Status */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase' }}>
                        System Status
                      </h4>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '14px' }}>🌐 API Server</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                            <span style={{ fontSize: '12px', color: '#10b981' }}>Online</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '14px' }}>💾 Database</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                            <span style={{ fontSize: '12px', color: '#10b981' }}>Connected</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '14px' }}>🔐 Security Module</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                            <span style={{ fontSize: '12px', color: '#10b981' }}>Active</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent System Events */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase' }}>
                        Recent System Events
                      </h4>
                      <div>
                        <div style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                          <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>✅ Backup Completed</p>
                          <p style={{ fontSize: '10px', color: '#94a3b8' }}>Daily backup successful - 2 hours ago</p>
                        </div>
                        <div style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                          <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>🔄 System Update</p>
                          <p style={{ fontSize: '10px', color: '#94a3b8' }}>Security patches applied - 4 hours ago</p>
                        </div>
                        <div style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                          <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>👤 User Login</p>
                          <p style={{ fontSize: '10px', color: '#94a3b8' }}>Admin user authenticated - 8 minutes ago</p>
                        </div>
                        <div style={{ padding: '8px', marginBottom: '8px' }}>
                          <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>📊 Report Generated</p>
                          <p style={{ fontSize: '10px', color: '#94a3b8' }}>Daily security report created - 1 hour ago</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase' }}>
                        Quick Actions
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 12px', width: '100%' }}>
                          🔄 Run System Check
                        </button>
                        <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 12px', width: '100%' }}>
                          💾 Create Backup
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Report Generation Tab */}
      {activeTab === 'report-generation' && (
        <div>
          {/* Header Section */}
          <section style={{ padding: '80px 24px', textAlign: 'center' }}>
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
                Generate professional security reports with AI-powered insights, digital signatures, and comprehensive documentation.
              </p>
            </div>
          </section>

          {/* Report Types Section */}
          <section style={{ padding: '0 24px 80px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '24px',
                marginBottom: '48px'
              }}>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Daily Log Report</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
                    Comprehensive daily security activity summary with all events and observations.
                  </p>
                  <button 
                    onClick={() => setActiveTab('daily-log')}
                    className="btn" 
                    style={{ width: '100%', fontSize: '14px' }}
                  >
                    📝 Create Daily Log
                  </button>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚑</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Incident Report - Medical</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
                    Medical emergency documentation with injury details and response actions.
                  </p>
                  <button 
                    onClick={() => {
                      setCurrentReportType('medical');
                      setActiveTab('report-generation');
                    }}
                    className="btn" 
                    style={{ width: '100%', fontSize: '14px' }}
                  >
                    🏥 Create Medical Report
                  </button>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Incident Report - Non-Medical</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
                    Security incidents, breaches, and non-medical emergency documentation.
                  </p>
                  <button 
                    onClick={() => {
                      setCurrentReportType('non-medical');
                      setActiveTab('report-generation');
                    }}
                    className="btn" 
                    style={{ width: '100%', fontSize: '14px' }}
                  >
                    🚨 Create Incident Report
                  </button>
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Security Systems Audit</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
                    Comprehensive security system evaluation with discrepancy analysis.
                  </p>
                  <button 
                    onClick={() => {
                      setCurrentReportType('audit');
                      setActiveTab('report-generation');
                    }}
                    className="btn" 
                    style={{ width: '100%', fontSize: '14px' }}
                  >
                    🔐 Create Audit Report
                  </button>
                </div>
              </div>

              {/* Enhanced Daily Log Report Form */}
              <div className="card" style={{ marginBottom: '32px' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>📋 Daily Log Report Form</h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Complete daily security activity documentation with vendor, guest, package, and patrol tracking</p>
                </div>

                <form style={{ display: 'grid', gap: '24px' }}>
                  {/* Basic Information */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>📝 Basic Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Report Date</label>
                        <input type="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Shift Period</label>
                        <select className="form-input">
                          <option value="day">Day Shift (06:00 - 18:00)</option>
                          <option value="night">Night Shift (18:00 - 06:00)</option>
                          <option value="custom">Custom Hours</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Officer Name</label>
                        <input type="text" className="form-input" placeholder="Security Officer Name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Weather Conditions</label>
                        <select className="form-input">
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
                      
                      {/* Add Vendor Entry Button */}
                      <div style={{ marginBottom: '16px' }}>
                        <button type="button" className="btn btn-secondary" style={{ fontSize: '14px' }}>
                          ➕ Add Vendor Entry
                        </button>
                      </div>

                      {/* Vendor Entry Form */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Vendor Company</label>
                          <input type="text" className="form-input" placeholder="Company name" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Contact Person</label>
                          <input type="text" className="form-input" placeholder="Representative name" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Time In</label>
                          <input type="time" className="form-input" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Time Out</label>
                          <input type="time" className="form-input" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Purpose</label>
                          <select className="form-input" style={{ fontSize: '14px', padding: '8px' }}>
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
                          <input type="text" className="form-input" placeholder="Specific location" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '14px' }}>Additional Vendor Notes</label>
                      <textarea 
                        className="form-input" 
                          rows={3}
                          placeholder="Notes about vendor activities, special instructions, or observations..."
                          style={{ fontSize: '14px', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Guest/Visitor Activities */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#10b981' }}>👤 Guest & Visitor Activities</h4>
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '20px' }}>
                      
                      {/* Add Guest Entry Button */}
                      <div style={{ marginBottom: '16px' }}>
                        <button type="button" className="btn btn-secondary" style={{ fontSize: '14px' }}>
                          ➕ Add Guest Entry
                        </button>
                      </div>

                      {/* Guest Entry Form */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Guest Name</label>
                          <input type="text" className="form-input" placeholder="Full name" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Company/Organization</label>
                          <input type="text" className="form-input" placeholder="Visiting company" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Time In</label>
                          <input type="time" className="form-input" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Time Out</label>
                          <input type="time" className="form-input" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Visiting Department</label>
                          <input type="text" className="form-input" placeholder="Destination department" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Host Contact</label>
                          <input type="text" className="form-input" placeholder="Employee contacted" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '14px' }}>Guest Visit Notes</label>
                        <textarea 
                          className="form-input" 
                          rows={3}
                          placeholder="Purpose of visit, special instructions, escort requirements, or observations..."
                          style={{ fontSize: '14px', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Package/Delivery Activities */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>📦 Package & Delivery Activities</h4>
                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', padding: '20px' }}>
                      
                      {/* Add Package Entry Button */}
                      <div style={{ marginBottom: '16px' }}>
                        <button type="button" className="btn btn-secondary" style={{ fontSize: '14px' }}>
                          ➕ Add Package Entry
                        </button>
                      </div>

                      {/* Package Entry Form */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Carrier/Service</label>
                          <select className="form-input" style={{ fontSize: '14px', padding: '8px' }}>
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
                          <input type="text" className="form-input" placeholder="Package tracking #" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Recipient</label>
                          <input type="text" className="form-input" placeholder="Addressed to" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Department</label>
                          <input type="text" className="form-input" placeholder="Destination dept." style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Time Received</label>
                          <input type="time" className="form-input" style={{ fontSize: '14px', padding: '8px' }} />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '14px' }}>Status</label>
                          <select className="form-input" style={{ fontSize: '14px', padding: '8px' }}>
                            <option value="received">Received</option>
                            <option value="delivered">Delivered</option>
                            <option value="pending">Pending Pickup</option>
                            <option value="returned">Returned</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '14px' }}>Package Handling Notes</label>
                        <textarea 
                          className="form-input" 
                          rows={3}
                          placeholder="Special handling requirements, delivery issues, condition notes, or delivery confirmations..."
                          style={{ fontSize: '14px', resize: 'vertical' }}
                        />
                      </div>
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
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '14px' }}>Round 1 Time</label>
                            <input type="time" className="form-input" style={{ fontSize: '14px', padding: '8px' }} />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '14px' }}>Round 2 Time</label>
                            <input type="time" className="form-input" style={{ fontSize: '14px', padding: '8px' }} />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '14px' }}>Round 3 Time</label>
                            <input type="time" className="form-input" style={{ fontSize: '14px', padding: '8px' }} />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '14px' }}>Round 4 Time</label>
                            <input type="time" className="form-input" style={{ fontSize: '14px', padding: '8px' }} />
                          </div>
                        </div>
                      </div>

                      {/* Areas Patrolled */}
                      <div style={{ marginBottom: '20px' }}>
                        <label className="form-label" style={{ fontSize: '14px' }}>Areas Patrolled (Check all that apply)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
                          {[
                            'Main Entrance', 'Reception Area', 'Parking Lot', 'Loading Dock', 
                            'Perimeter Fence', 'Emergency Exits', 'Stairwells', 'Roof Access',
                            'Server Room', 'Storage Areas', 'Break Rooms', 'Restrooms'
                          ].map((area) => (
                            <label key={area} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                              <input type="checkbox" style={{ marginRight: '8px', accentColor: '#8b5cf6' }} />
                              {area}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Detailed Patrol Notes */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '14px' }}>Detailed Patrol Observations</label>
                        <textarea 
                          className="form-input" 
                          rows={4}
                          placeholder="Security observations, unusual activities, maintenance needs, safety concerns, incidents, or general notes during patrol rounds..."
                          style={{ fontSize: '14px', resize: 'vertical' }}
                        />
                      </div>

                      {/* Security Equipment Check */}
                      <div style={{ marginTop: '16px' }}>
                        <label className="form-label" style={{ fontSize: '14px' }}>Security Equipment Status</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
                          {[
                            'CCTV Cameras', 'Access Control', 'Alarm System', 'Emergency Lighting',
                            'Fire Safety Equipment', 'Communication Devices', 'Locks & Keys', 'Barriers/Gates'
                          ].map((equipment) => (
                            <div key={equipment} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                              <span style={{ marginRight: '8px', minWidth: '120px' }}>{equipment}:</span>
                              <select className="form-input" style={{ fontSize: '12px', padding: '4px' }}>
                                <option value="ok">✅ OK</option>
                                <option value="issue">⚠️ Issue</option>
                                <option value="not-checked">➖ Not Checked</option>
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
                        Upload photos, videos, documents, or CSV files related to this daily log
                      </p>
                      <input 
                        type="file" 
                        multiple 
                        accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.pdf,.doc,.docx,.csv,.txt"
                        style={{ display: 'none' }}
                        id="dailyLogAttachments"
                      />
                      <label htmlFor="dailyLogAttachments" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                        📤 Choose Files
                      </label>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                        Supported: JPG, PNG, MP4, PDF, DOC, CSV (Max 50MB per file)
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }}>
                      💾 Save Draft
                    </button>
                    <button type="button" className="btn" style={{ flex: 1 }}>
                      🤖 Review with AI
                    </button>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ flex: 1 }}
                      onClick={() => handleReportSubmit('Daily Log', {})}
                    >
                      🔐 Submit with PIN
                    </button>
                  </div>
                </form>
              </div>

              {/* Medical Incident Report Form */}
              <div className="card" style={{ marginBottom: '32px' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>🚑 Medical Incident Report Form</h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Comprehensive medical emergency and injury documentation with photo/video evidence</p>
                </div>

                <form style={{ display: 'grid', gap: '24px' }}>
                  {/* Time & Location */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>⏰ Time & Location Details</h4>
                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                          <label className="form-label">Incident Date</label>
                          <input type="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="form-group">
                          <label className="form-label">Incident Time</label>
                          <input type="time" className="form-input" />
                      </div>
                      <div className="form-group">
                          <label className="form-label">Discovered Time (if different)</label>
                          <input type="time" className="form-input" placeholder="When incident was found" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Specific Location</label>
                          <input type="text" className="form-input" placeholder="Exact location (room, area, floor)" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Building/Facility</label>
                          <input type="text" className="form-input" placeholder="Building name or facility section" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Weather Conditions</label>
                        <select className="form-input">
                            <option value="">Select conditions</option>
                            <option value="clear">Clear</option>
                            <option value="rain">Rain</option>
                            <option value="snow">Snow</option>
                            <option value="ice">Ice</option>
                            <option value="fog">Fog</option>
                            <option value="indoor">Indoor (N/A)</option>
                            <option value="other">Other</option>
                        </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Injured Person Information */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>👤 Injured Person Information</h4>
                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                          <label className="form-label">Full Name</label>
                          <input type="text" className="form-input" placeholder="First and last name" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Age</label>
                          <input type="number" className="form-input" placeholder="Age of injured person" min="1" max="120" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Gender</label>
                          <select className="form-input">
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Person Type</label>
                          <select className="form-input">
                            <option value="">Select person type</option>
                            <option value="employee">Employee</option>
                            <option value="contractor">Contractor</option>
                            <option value="visitor">Visitor</option>
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Employee ID / Badge Number</label>
                          <input type="text" className="form-input" placeholder="ID number (if applicable)" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Department / Company</label>
                          <input type="text" className="form-input" placeholder="Department or visiting company" />
                        </div>
                      </div>
                      
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                          <label className="form-label">Contact Phone Number</label>
                          <input type="tel" className="form-input" placeholder="Primary contact number" />
                      </div>
                      <div className="form-group">
                          <label className="form-label">Emergency Contact Name</label>
                          <input type="text" className="form-input" placeholder="Emergency contact person" />
                      </div>
                      <div className="form-group">
                          <label className="form-label">Emergency Contact Phone</label>
                          <input type="tel" className="form-input" placeholder="Emergency contact number" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Medical Conditions / Allergies</label>
                          <input type="text" className="form-input" placeholder="Known medical conditions (if disclosed)" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Incident Description */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>📝 Detailed Incident Description</h4>
                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                          <label className="form-label">Type of Injury</label>
                          <select className="form-input">
                            <option value="">Select injury type</option>
                            <option value="cut-laceration">Cut / Laceration</option>
                            <option value="bruise-contusion">Bruise / Contusion</option>
                            <option value="burn">Burn</option>
                            <option value="fracture">Fracture / Broken Bone</option>
                            <option value="sprain-strain">Sprain / Strain</option>
                            <option value="head-injury">Head Injury</option>
                            <option value="back-injury">Back Injury</option>
                            <option value="eye-injury">Eye Injury</option>
                            <option value="chemical-exposure">Chemical Exposure</option>
                            <option value="allergic-reaction">Allergic Reaction</option>
                            <option value="heart-related">Heart Related</option>
                            <option value="breathing-difficulty">Breathing Difficulty</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Body Part(s) Affected</label>
                          <input type="text" className="form-input" placeholder="Specific body parts injured" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Severity Level</label>
                          <select className="form-input">
                            <option value="minor">Minor - First Aid Only</option>
                            <option value="moderate">Moderate - Medical Attention Required</option>
                            <option value="serious">Serious - Hospital Treatment</option>
                            <option value="critical">Critical - Life Threatening</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Incident Cause</label>
                          <select className="form-input">
                            <option value="">Select cause</option>
                            <option value="slip-fall">Slip and Fall</option>
                            <option value="equipment-malfunction">Equipment Malfunction</option>
                            <option value="lifting-injury">Lifting / Manual Handling</option>
                            <option value="struck-by-object">Struck by Object</option>
                            <option value="repetitive-motion">Repetitive Motion</option>
                            <option value="chemical-exposure">Chemical Exposure</option>
                            <option value="electrical">Electrical</option>
                            <option value="vehicle-related">Vehicle Related</option>
                            <option value="violence">Violence / Assault</option>
                            <option value="medical-emergency">Medical Emergency</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">What Happened? (Detailed Description)</label>
                        <textarea 
                          className="form-input" 
                          rows={5}
                          placeholder="Describe exactly what happened, how the injury occurred, sequence of events, contributing factors, and any witnesses present..."
                          style={{ resize: 'vertical' }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Witness Information</label>
                        <textarea 
                          className="form-input" 
                          rows={3}
                          placeholder="Names, contact information, and statements from any witnesses..."
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Taken */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#10b981' }}>🚑 Actions Taken</h4>
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                          <label className="form-label">First Aid Provided By</label>
                          <input type="text" className="form-input" placeholder="Name of person who provided first aid" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">First Aid Certification</label>
                          <select className="form-input">
                            <option value="">Select certification</option>
                            <option value="certified">Certified First Aid</option>
                            <option value="cpr-certified">CPR Certified</option>
                            <option value="medical-professional">Medical Professional</option>
                            <option value="basic-training">Basic Training</option>
                            <option value="no-training">No Formal Training</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Emergency Services Called</label>
                          <select className="form-input">
                            <option value="no">No</option>
                            <option value="911">911 Called</option>
                            <option value="ambulance">Ambulance</option>
                            <option value="fire-department">Fire Department</option>
                            <option value="police">Police</option>
                            <option value="poison-control">Poison Control</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Time Emergency Services Called</label>
                          <input type="time" className="form-input" />
                        </div>
                      </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Detailed First Aid / Medical Treatment Provided</label>
                      <textarea 
                        className="form-input" 
                        rows={4}
                          placeholder="Describe specific first aid given, medical treatment provided, medications administered, equipment used..."
                          style={{ resize: 'vertical' }}
                      />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Transportation Details</label>
                        <textarea 
                          className="form-input" 
                          rows={3}
                          placeholder="How was the injured person transported? Ambulance, personal vehicle, walked to medical facility, etc..."
                          style={{ resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resolution & Follow-up */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#8b5cf6' }}>✅ Resolution & Follow-up</h4>
                    <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px', padding: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                          <label className="form-label">Current Status</label>
                          <select className="form-input">
                            <option value="">Select status</option>
                            <option value="treated-returned">Treated and Returned to Work</option>
                            <option value="sent-hospital">Sent to Hospital</option>
                            <option value="sent-home">Sent Home</option>
                            <option value="under-medical-care">Under Medical Care</option>
                            <option value="returned-duty">Returned to Light Duty</option>
                            <option value="off-work">Off Work</option>
                            <option value="unknown">Status Unknown</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Medical Facility</label>
                          <input type="text" className="form-input" placeholder="Hospital, clinic, or medical facility name" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Doctor / Medical Professional</label>
                          <input type="text" className="form-input" placeholder="Name of treating physician" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Expected Return Date</label>
                          <input type="date" className="form-input" />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Resolution Details</label>
                      <textarea 
                        className="form-input" 
                        rows={4}
                          placeholder="Final outcome, medical diagnosis (if known), treatment received, work restrictions, return to work status..."
                          style={{ resize: 'vertical' }}
                      />
                    </div>

                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Follow-up Actions Required</label>
                        <textarea 
                          className="form-input" 
                          rows={3}
                          placeholder="Safety improvements needed, training required, equipment changes, investigation needed, insurance claims..."
                          style={{ resize: 'vertical' }}
                        />
                  </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                          <input type="checkbox" style={{ marginRight: '8px', accentColor: '#8b5cf6' }} />
                          Workers' compensation claim filed
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                          <input type="checkbox" style={{ marginRight: '8px', accentColor: '#8b5cf6' }} />
                          Safety investigation required
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                          <input type="checkbox" style={{ marginRight: '8px', accentColor: '#8b5cf6' }} />
                          Equipment inspection needed
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                          <input type="checkbox" style={{ marginRight: '8px', accentColor: '#8b5cf6' }} />
                          Additional training required
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Photo/Video Evidence Upload */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>📸 Photo & Video Evidence</h4>
                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px', padding: '20px' }}>
                      <div style={{ border: '2px dashed rgba(245, 158, 11, 0.4)', borderRadius: '8px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📷</div>
                      <p style={{ marginBottom: '12px', color: '#94a3b8' }}>
                          Upload photos and videos of the incident scene, injuries, equipment, or evidence
                        </p>
                        <input 
                          type="file" 
                          multiple 
                          accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.webm"
                          style={{ display: 'none' }}
                          id="medicalIncidentMedia"
                        />
                        <label htmlFor="medicalIncidentMedia" className="btn" style={{ cursor: 'pointer', background: '#f59e0b', marginRight: '12px' }}>
                          📸 Upload Photos/Videos
                        </label>
                        <input 
                          type="file" 
                          multiple 
                          accept=".pdf,.doc,.docx,.txt,.csv"
                          style={{ display: 'none' }}
                          id="medicalIncidentDocs"
                        />
                        <label htmlFor="medicalIncidentDocs" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                          📄 Upload Documents
                        </label>
                      </div>
                      
                      <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                        <strong>Supported:</strong> Photos (JPG, PNG), Videos (MP4, MOV), Documents (PDF, DOC) • Max 50MB per file<br/>
                        <strong>Important:</strong> Photos and videos will be timestamped and watermarked when submitted with PIN
                      </div>
                    </div>
                  </div>

                  {/* Report Information */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>📋 Report Information</h4>
                    <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                          <label className="form-label">Report Prepared By</label>
                          <input type="text" className="form-input" placeholder="Name of person preparing this report" />
                      </div>
                      <div className="form-group">
                          <label className="form-label">Title / Position</label>
                          <input type="text" className="form-input" placeholder="Job title or position" />
                      </div>
                        <div className="form-group">
                          <label className="form-label">Contact Phone</label>
                          <input type="tel" className="form-input" placeholder="Phone number of report preparer" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Report Date</label>
                          <input type="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons with PIN Submission */}
                  <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }}>
                      💾 Save Medical Draft
                    </button>
                    <button type="button" className="btn" style={{ flex: 1 }}>
                      🤖 AI Medical Review
                    </button>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ flex: 1, background: '#ef4444' }}
                      onClick={() => handleReportSubmit('Medical Incident', {})}
                    >
                      🔐 Submit with PIN + Watermark
                    </button>
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
                    🔒 Upon PIN submission, this report will be timestamped, watermarked, and converted to a secure PDF with embedded metadata
                  </div>
                </form>
                             </div>

               {/* Non-Medical Incident Report Form */}
               <div className="card" style={{ marginBottom: '32px' }}>
                 <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                   <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>⚠️ Non-Medical Incident Report Form</h3>
                   <p style={{ color: '#94a3b8', fontSize: '16px' }}>Security incidents, breaches, and non-medical emergency documentation</p>
                 </div>

                 <form style={{ display: 'grid', gap: '24px' }}>
                   {/* Incident Details */}
                   <div>
                     <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>🚨 Incident Details</h4>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                       <div className="form-group">
                         <label className="form-label">Incident Date & Time</label>
                         <input type="datetime-local" className="form-input" />
                       </div>
                       <div className="form-group">
                         <label className="form-label">Location</label>
                         <input type="text" className="form-input" placeholder="Specific location of incident" />
                       </div>
                       <div className="form-group">
                         <label className="form-label">Incident Type</label>
                         <select className="form-input">
                           <option value="security-breach">Security Breach</option>
                           <option value="theft">Theft/Robbery</option>
                           <option value="vandalism">Vandalism</option>
                           <option value="trespassing">Trespassing</option>
                           <option value="violence">Violence/Assault</option>
                           <option value="emergency">Emergency Situation</option>
                           <option value="other">Other</option>
                         </select>
                       </div>
                       <div className="form-group">
                         <label className="form-label">Severity Level</label>
                         <select className="form-input">
                           <option value="low">Low - Minor Issue</option>
                           <option value="medium">Medium - Moderate Concern</option>
                           <option value="high">High - Serious Issue</option>
                           <option value="critical">Critical - Emergency</option>
                         </select>
                       </div>
                     </div>
                   </div>

                   {/* Incident Description */}
                   <div>
                     <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>📝 Incident Description</h4>
                     <div className="form-group" style={{ marginBottom: '16px' }}>
                       <label className="form-label">Detailed Incident Report</label>
                       <textarea 
                         className="form-input" 
                         rows={5}
                         placeholder="Provide a comprehensive description of what happened, including timeline, people involved, and circumstances..."
                       />
                     </div>
                     <div className="form-group">
                       <label className="form-label">Property Damage Assessment</label>
                       <textarea 
                         className="form-input" 
                         rows={3}
                         placeholder="Describe any property damage, estimated costs, and items affected..."
                       />
                     </div>
                   </div>

                   {/* People Involved */}
                   <div>
                     <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>👥 People Involved</h4>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                       <div className="form-group">
                         <label className="form-label">Suspects/Perpetrators</label>
                         <textarea 
                           className="form-input" 
                           rows={3}
                           placeholder="Names, descriptions, contact information of suspects (if known)..."
                         />
                       </div>
                       <div className="form-group">
                         <label className="form-label">Witnesses</label>
                         <textarea 
                           className="form-input" 
                           rows={3}
                           placeholder="Names and contact information of witnesses..."
                         />
                       </div>
                       <div className="form-group">
                         <label className="form-label">Victims/Affected Parties</label>
                         <textarea 
                           className="form-input" 
                           rows={3}
                           placeholder="Names and contact information of affected individuals..."
                         />
                       </div>
                     </div>
                   </div>

                   {/* Response Actions */}
                   <div>
                     <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>🚀 Response Actions Taken</h4>
                     <div className="form-group" style={{ marginBottom: '16px' }}>
                       <label className="form-label">Immediate Actions</label>
                       <textarea 
                         className="form-input" 
                         rows={4}
                         placeholder="Describe immediate response actions taken, emergency services contacted, security measures implemented..."
                       />
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                       <div className="form-group">
                         <label className="form-label">Law Enforcement Contacted</label>
                         <select className="form-input">
                           <option value="no">No</option>
                           <option value="yes">Yes</option>
                         </select>
                       </div>
                       <div className="form-group">
                         <label className="form-label">Case Number (if applicable)</label>
                         <input type="text" className="form-input" placeholder="Police report number" />
                       </div>
                       <div className="form-group">
                         <label className="form-label">Management Notified</label>
                         <select className="form-input">
                           <option value="yes">Yes</option>
                           <option value="no">No</option>
                           <option value="pending">Pending</option>
                         </select>
                       </div>
                     </div>
                   </div>

                   {/* Incident Attachments */}
                   <div>
                     <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>📎 Incident Documentation</h4>
                     <div style={{ border: '2px dashed rgba(255,255,255,0.3)', borderRadius: '8px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
                       <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚨</div>
                       <p style={{ marginBottom: '12px', color: '#94a3b8' }}>
                         Upload incident photos, security footage, witness statements, damage assessments
                       </p>
                       <button type="button" className="btn btn-secondary">
                         📤 Upload Incident Files
                       </button>
                     </div>
                   </div>

                   {/* Incident Report Review */}
                   <div>
                     <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>📋 Incident Report Review</h4>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                       <div className="form-group">
                         <label className="form-label">Supervisor Review Status</label>
                         <select className="form-input">
                           <option value="pending">Pending Review</option>
                           <option value="approved">Approved</option>
                           <option value="needs-revision">Needs Revision</option>
                         </select>
                       </div>
                       <div className="form-group">
                         <label className="form-label">Follow-up Required</label>
                         <select className="form-input">
                           <option value="no">No Follow-up Needed</option>
                           <option value="yes">Follow-up Required</option>
                           <option value="investigation">Investigation Ongoing</option>
                         </select>
                       </div>
                       <div className="form-group">
                         <label className="form-label">Incident Priority</label>
                         <select className="form-input">
                           <option value="low">🟢 Low Priority</option>
                           <option value="medium">🟡 Medium Priority</option>
                           <option value="high">🔴 High Priority</option>
                           <option value="critical">🚨 Critical</option>
                         </select>
                       </div>
                     </div>
                   </div>

                   <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                     <button type="button" className="btn btn-secondary" style={{ flex: 1 }}>
                       💾 Save Incident Draft
                     </button>
                     <button type="button" className="btn" style={{ flex: 1 }}>
                       🤖 AI Incident Review
                     </button>
                     <button 
                       type="button" 
                       className="btn" 
                       style={{ flex: 1 }}
                       onClick={() => handleReportSubmit('Non-Medical Incident', {})}
                     >
                       🔐 Submit with PIN
                     </button>
                   </div>
                 </form>
               </div>

               {/* Security Systems Audit Form */}
              <div className="card">
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>🔍 Security Systems Audit Form</h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Comprehensive security system evaluation and discrepancy analysis</p>
                </div>

                <form style={{ display: 'grid', gap: '24px' }}>
                  {/* Audit Information */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>📋 Audit Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Audit Date</label>
                        <input type="date" className="form-input" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Auditor Name</label>
                        <input type="text" className="form-input" placeholder="Security auditor name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Audit Type</label>
                        <select className="form-input">
                          <option value="routine">Routine Inspection</option>
                          <option value="incident">Post-Incident Audit</option>
                          <option value="compliance">Compliance Check</option>
                          <option value="comprehensive">Comprehensive Review</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* System Checks */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>🔐 Security System Status</h4>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {[
                        'Access Control Systems',
                        'CCTV Surveillance',
                        'Alarm Systems',
                        'Fire Safety Systems',
                        'Emergency Communication',
                        'Perimeter Security',
                        'Lighting Systems',
                        'Key Management'
                      ].map((system, index) => (
                        <div key={index} style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '200px 120px 120px 1fr', 
                          gap: '16px', 
                          alignItems: 'center',
                          padding: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}>
                          <label style={{ fontSize: '14px', fontWeight: '500' }}>{system}</label>
                          <select className="form-input" style={{ fontSize: '12px', padding: '8px' }}>
                            <option value="operational">✅ Operational</option>
                            <option value="minor-issues">⚠️ Minor Issues</option>
                            <option value="major-issues">🔴 Major Issues</option>
                            <option value="non-functional">❌ Non-Functional</option>
                          </select>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Priority"
                            style={{ fontSize: '12px', padding: '8px' }}
                          />
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Notes and observations..."
                            style={{ fontSize: '12px', padding: '8px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discrepancy Section */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>⚠️ Discrepancy Analysis</h4>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label">Identified Discrepancies</label>
                      <textarea 
                        className="form-input" 
                        rows={5}
                        placeholder="Detail any security system discrepancies, malfunctions, or compliance issues found during the audit..."
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label">Recommended Actions</label>
                      <textarea 
                        className="form-input" 
                        rows={4}
                        placeholder="Provide specific recommendations for addressing identified issues and improving security systems..."
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Priority Level</label>
                        <select className="form-input">
                          <option value="low">🟢 Low Priority</option>
                          <option value="medium">🟡 Medium Priority</option>
                          <option value="high">🔴 High Priority</option>
                          <option value="critical">🚨 Critical - Immediate Action</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Follow-up Required By</label>
                        <input type="date" className="form-input" />
                      </div>
                    </div>
                  </div>

                  {/* Audit Attachments */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>📎 Audit Documentation</h4>
                    <div style={{ border: '2px dashed rgba(255,255,255,0.3)', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                      <p style={{ marginBottom: '12px', color: '#94a3b8' }}>
                        Upload system screenshots, inspection photos, compliance documents
                      </p>
                      <button type="button" className="btn btn-secondary">
                        📤 Upload Audit Files
                      </button>
                    </div>
                  </div>

                  {/* Audit Review */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>📋 Audit Review & Approval</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Supervisor Review</label>
                        <select className="form-input">
                          <option value="pending">Pending Review</option>
                          <option value="approved">Approved</option>
                          <option value="needs-revision">Needs Revision</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Audit Completion Status</label>
                        <select className="form-input">
                          <option value="in-progress">🔄 In Progress</option>
                          <option value="completed">✅ Completed</option>
                          <option value="requires-followup">⚠️ Requires Follow-up</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }}>
                      💾 Save Audit Draft
                    </button>
                    <button type="button" className="btn" style={{ flex: 1 }}>
                      🤖 AI Audit Review
                    </button>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ flex: 1 }}
                      onClick={() => handleReportSubmit('Security Systems Audit', {})}
                    >
                      🔐 Submit with PIN
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Daily Log Tab */}
      {activeTab === 'daily-log' && (
        <EnhancedDailyLog />
      )}

      {/* Report Review Tab */}
      {activeTab === 'report-review' && (
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
                Real-time monitoring and logging of all daily security activities, visitor management, and facility access.
              </p>
            </div>
          </section>

          {/* Control Panel */}
          <section style={{ padding: '0 24px 40px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <button className="btn" style={{ flex: 1, minWidth: '200px' }}>
                  ➕ Add New Entry
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, minWidth: '200px' }}>
                  👥 Add New Person/Vendor
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, minWidth: '200px' }}>
                  📊 Generate Daily Report
                </button>
                <select className="form-input" style={{ minWidth: '150px' }}>
                  <option value="all">All Entries</option>
                  <option value="vendors">Vendors</option>
                  <option value="guests">Guests</option>
                  <option value="packages">Packages</option>
                  <option value="staff">Staff</option>
                  <option value="movement">Client Movement</option>
                  <option value="incidents">Incidents</option>
                </select>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="🔍 Search entries..." 
                  style={{ minWidth: '200px' }}
                />
              </div>

              {/* Real-time Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '16px',
                marginBottom: '32px'
              }}>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>47</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Today's Entries</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>12</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Active Visitors</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>8</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Pending Packages</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>2</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Incidents Today</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>23</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Staff On-Site</div>
                </div>
              </div>
            </div>
          </section>

          {/* Live Entry List */}
          <section style={{ padding: '0 24px 80px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="card">
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>📋 Live Daily Entry Log</h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Real-time tracking of all facility activity - Updated every 30 seconds</p>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginTop: '12px',
                    padding: '4px 12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: '#10b981'
                  }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
                    Live - Last updated {new Date().toLocaleTimeString()}
                  </div>
                </div>

                {/* Entry List Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>Time</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>Type</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>Person/Item</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>Company/Details</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>Location</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Sample Live Entries */}
                      {[
                        { time: '14:35', type: 'Vendor', person: 'Mike Johnson', company: 'ABC Maintenance Co.', location: 'Main Entrance', status: 'Checked In', priority: 'normal' },
                        { time: '14:28', type: 'Guest', person: 'Sarah Williams', company: 'Meeting with Legal Dept', location: 'Reception', status: 'Waiting', priority: 'normal' },
                        { time: '14:15', type: 'Package', person: 'FedEx Delivery', company: 'Medical Supplies', location: 'Loading Dock', status: 'Delivered', priority: 'normal' },
                        { time: '14:02', type: 'Staff', person: 'Dr. Emily Chen', company: 'Internal Medicine', location: 'East Wing', status: 'On-Site', priority: 'normal' },
                        { time: '13:45', type: 'Client Movement', person: 'Patient Transport', company: 'Room 302 → MRI', location: 'Medical Wing', status: 'In Progress', priority: 'high' },
                        { time: '13:30', type: 'Incident', person: 'Minor Slip & Fall', company: 'Lobby Area', location: 'Main Lobby', status: 'Resolved', priority: 'medium' },
                        { time: '13:18', type: 'Vendor', person: 'Lisa Rodriguez', company: 'Food Services Inc.', location: 'Service Entrance', status: 'Checked Out', priority: 'normal' },
                        { time: '13:05', type: 'Guest', person: 'Robert Taylor', company: 'IT Consultant', location: 'IT Department', status: 'Checked In', priority: 'normal' },
                        { time: '12:50', type: 'Package', person: 'UPS Delivery', company: 'Office Supplies', location: 'Reception', status: 'Pending Pickup', priority: 'normal' },
                        { time: '12:35', type: 'Staff', person: 'Security Patrol', company: 'Routine Check', location: 'All Areas', status: 'Completed', priority: 'normal' }
                      ].map((entry, index) => (
                        <tr key={index} style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <td style={{ padding: '12px', fontSize: '14px' }}>{entry.time}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '12px', 
                              fontSize: '12px',
                              background: entry.type === 'Vendor' ? 'rgba(59, 130, 246, 0.1)' :
                                        entry.type === 'Guest' ? 'rgba(16, 185, 129, 0.1)' :
                                        entry.type === 'Package' ? 'rgba(245, 158, 11, 0.1)' :
                                        entry.type === 'Staff' ? 'rgba(139, 92, 246, 0.1)' :
                                        entry.type === 'Client Movement' ? 'rgba(6, 182, 212, 0.1)' :
                                        'rgba(239, 68, 68, 0.1)',
                              color: entry.type === 'Vendor' ? '#3b82f6' :
                                    entry.type === 'Guest' ? '#10b981' :
                                    entry.type === 'Package' ? '#f59e0b' :
                                    entry.type === 'Staff' ? '#8b5cf6' :
                                    entry.type === 'Client Movement' ? '#06b6d4' :
                                    '#ef4444'
                            }}>
                              {entry.type}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>{entry.person}</td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#94a3b8' }}>{entry.company}</td>
                          <td style={{ padding: '12px', fontSize: '14px' }}>{entry.location}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '12px', 
                              fontSize: '12px',
                              background: entry.status.includes('In') || entry.status === 'On-Site' ? 'rgba(16, 185, 129, 0.1)' :
                                        entry.status === 'Waiting' || entry.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' :
                                        entry.status === 'Completed' || entry.status === 'Delivered' || entry.status === 'Resolved' ? 'rgba(59, 130, 246, 0.1)' :
                                        'rgba(100, 116, 139, 0.1)',
                              color: entry.status.includes('In') || entry.status === 'On-Site' ? '#10b981' :
                                    entry.status === 'Waiting' || entry.status === 'Pending' ? '#f59e0b' :
                                    entry.status === 'Completed' || entry.status === 'Delivered' || entry.status === 'Resolved' ? '#3b82f6' :
                                    '#64748b'
                            }}>
                              {entry.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'transparent',
                                color: '#06b6d4',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}>
                                View
                              </button>
                              <button style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'transparent',
                                color: '#94a3b8',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}>
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  paddingTop: '20px', 
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  marginTop: '20px'
                }}>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Showing 1-10 of 47 entries
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      ← Previous
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      Next →
                    </button>
                  </div>
                </div>
              </div>

              {/* Add New Entry Form */}
              <div className="card" style={{ marginTop: '32px' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>➕ Add New Daily Entry</h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Log new visitor, vendor, package, or activity entry</p>
                </div>

                <form style={{ display: 'grid', gap: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Entry Type</label>
                      <select className="form-input">
                        <option value="">Select Entry Type</option>
                        <option value="vendor">🏢 Vendor</option>
                        <option value="guest">👤 Guest/Visitor</option>
                        <option value="package">📦 Package/Delivery</option>
                        <option value="staff">👥 Staff Activity</option>
                        <option value="client-movement">🚶 Client Movement</option>
                        <option value="incident">⚠️ Incident</option>
                        <option value="maintenance">🔧 Maintenance</option>
                        <option value="emergency">🚨 Emergency</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date & Time</label>
                      <input 
                        type="datetime-local" 
                        className="form-input" 
                        defaultValue={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Person/Item Name</label>
                      <input type="text" className="form-input" placeholder="Full name or item description" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company/Department</label>
                      <input type="text" className="form-input" placeholder="Company name or department" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Contact Information</label>
                      <input type="text" className="form-input" placeholder="Phone number or email" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <select className="form-input">
                        <option value="">Select Location</option>
                        <option value="main-entrance">Main Entrance</option>
                        <option value="reception">Reception</option>
                        <option value="loading-dock">Loading Dock</option>
                        <option value="east-wing">East Wing</option>
                        <option value="west-wing">West Wing</option>
                        <option value="medical-wing">Medical Wing</option>
                        <option value="parking-lot">Parking Lot</option>
                        <option value="service-entrance">Service Entrance</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Current Status</label>
                      <select className="form-input">
                        <option value="checked-in">✅ Checked In</option>
                        <option value="waiting">⏳ Waiting</option>
                        <option value="in-progress">🔄 In Progress</option>
                        <option value="completed">✔️ Completed</option>
                        <option value="checked-out">🚪 Checked Out</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Priority Level</label>
                      <select className="form-input">
                        <option value="normal">🟢 Normal</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="high">🔴 High</option>
                        <option value="emergency">🚨 Emergency</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Additional Notes</label>
                    <textarea 
                      className="form-input" 
                      rows={4}
                      placeholder="Any additional details, observations, or special instructions..."
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button type="submit" className="btn" style={{ flex: 1 }}>
                      ➕ Add Entry
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }}>
                      💾 Save as Draft
                    </button>
                  </div>
                </form>
              </div>

              {/* Add New Person/Vendor Form */}
              <div className="card" style={{ marginTop: '32px' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>👥 Add New Person/Vendor to System</h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Register new vendors, staff, or frequent visitors for future quick access</p>
                </div>

                <form style={{ display: 'grid', gap: '24px' }}>
                  <div className="form-group">
                    <label className="form-label">Person Type</label>
                    <select className="form-input" style={{ marginBottom: '16px' }}>
                      <option value="">Select Person Type</option>
                      <option value="vendor">🏢 Vendor/Contractor</option>
                      <option value="staff">👥 Staff Member</option>
                      <option value="frequent-visitor">👤 Frequent Visitor</option>
                      <option value="emergency-contact">🚨 Emergency Contact</option>
                      <option value="service-provider">🔧 Service Provider</option>
                    </select>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>📝 Personal Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input type="text" className="form-input" placeholder="First and Last Name" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" placeholder="email@example.com" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input type="tel" className="form-input" placeholder="(555) 123-4567" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">ID/Badge Number</label>
                        <input type="text" className="form-input" placeholder="Employee or Vendor ID" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>🏢 Company/Organization Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Company/Department *</label>
                        <input type="text" className="form-input" placeholder="Company name or department" required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Job Title/Role</label>
                        <input type="text" className="form-input" placeholder="Position or service type" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Company Address</label>
                        <input type="text" className="form-input" placeholder="Business address" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Supervisor/Manager</label>
                        <input type="text" className="form-input" placeholder="Supervisor name and contact" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>🔐 Access & Security</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Access Level</label>
                        <select className="form-input">
                          <option value="visitor">👤 Visitor - Escorted Only</option>
                          <option value="basic">🟢 Basic - Common Areas</option>
                          <option value="restricted">🟡 Restricted - Specific Areas</option>
                          <option value="full">🔴 Full Access - All Areas</option>
                          <option value="emergency">🚨 Emergency Access</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Background Check Status</label>
                        <select className="form-input">
                          <option value="pending">⏳ Pending</option>
                          <option value="completed">✅ Completed</option>
                          <option value="expired">⚠️ Expired</option>
                          <option value="not-required">➖ Not Required</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Access Card/Key Number</label>
                        <input type="text" className="form-input" placeholder="Physical access card number" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Authorized Areas</label>
                        <input type="text" className="form-input" placeholder="Specific locations or 'All Areas'" />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Special Notes/Instructions</label>
                    <textarea 
                      className="form-input" 
                      rows={3}
                      placeholder="Any special access requirements, restrictions, or important notes about this person..."
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button type="submit" className="btn" style={{ flex: 1 }}>
                      👥 Add to System
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }}>
                      💾 Save as Draft
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }}>
                      📋 Create Entry for This Person
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Report Review Tab */}
      {activeTab === 'report-review' && (
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
                Report Review & Management
              </h1>
              <p style={{ 
                fontSize: '20px', 
                color: '#94a3b8', 
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                Search, filter, and manage your generated security reports with advanced analytics and follow-up tracking.
              </p>
            </div>
          </section>

          {/* Search & Filter Controls */}
          <section style={{ padding: '0 24px 40px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              {/* Search Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="🔍 Search reports by title, date, content, or keywords..." 
                    style={{ 
                      width: '100%', 
                      paddingLeft: '48px',
                      fontSize: '16px',
                      height: '48px'
                    }}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    fontSize: '20px'
                  }}>
                    🔍
                  </div>
                </div>
              </div>

              {/* Filter Controls */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '14px', marginBottom: '8px' }}>Report Type</label>
                  <select className="form-input">
                    <option value="">All Types</option>
                    <option value="daily">📋 Daily Log Reports</option>
                    <option value="medical">🚑 Medical Incidents</option>
                    <option value="incident">⚠️ Security Incidents</option>
                    <option value="audit">🔍 Security Audits</option>
                    <option value="compliance">📊 Compliance Reports</option>
                    <option value="custom">🎯 Custom Reports</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '14px', marginBottom: '8px' }}>Status</label>
                  <select className="form-input">
                    <option value="">All Status</option>
                    <option value="generated">✅ Generated</option>
                    <option value="processing">⏳ Processing</option>
                    <option value="draft">📝 Draft</option>
                    <option value="review">👁️ Under Review</option>
                    <option value="flagged">🚩 Flagged</option>
                    <option value="archived">📁 Archived</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '14px', marginBottom: '8px' }}>Priority</label>
                  <select className="form-input">
                    <option value="">All Priorities</option>
                    <option value="critical">🚨 Critical</option>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '14px', marginBottom: '8px' }}>Date Range</label>
                  <select className="form-input">
                    <option value="">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '14px', marginBottom: '8px' }}>Sort By</label>
                  <select className="form-input">
                    <option value="date-desc">📅 Newest First</option>
                    <option value="date-asc">📅 Oldest First</option>
                    <option value="title">📝 Title A-Z</option>
                    <option value="type">📋 Report Type</option>
                    <option value="priority">🚨 Priority</option>
                    <option value="status">✅ Status</option>
                  </select>
                </div>
                {user?.role === 'admin' && (
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '14px', marginBottom: '8px' }}>Admin Actions</label>
                    <select className="form-input">
                      <option value="">Quick Actions</option>
                      <option value="flag-all">🚩 Flag Selected</option>
                      <option value="unflag-all">✅ Unflag Selected</option>
                      <option value="archive">📁 Archive Selected</option>
                      <option value="export">📤 Export Selected</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '16px',
                marginBottom: '32px'
              }}>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>156</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Reports</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>142</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Generated</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>8</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Processing</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>6</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Flagged</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>12</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>This Week</div>
                </div>
              </div>
            </div>
          </section>

          {/* Reports List */}
          <section style={{ padding: '0 24px 80px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="card">
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>📊 Security Reports Archive</h3>
                      <p style={{ color: '#94a3b8', fontSize: '16px' }}>Showing 1-12 of 156 reports</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {user?.role === 'admin' && (
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '14px',
                          color: '#94a3b8'
                        }}>
                          <input type="checkbox" style={{ accentColor: '#06b6d4' }} />
                          Select All
                        </label>
                      )}
                      <button className="btn btn-secondary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                        📤 Export Results
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reports Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
                  gap: '24px' 
                }}>
                  {/* Sample Reports with Enhanced Features */}
                  {[
                    { 
                      id: 'RPT-001', 
                      type: 'Daily Log', 
                      title: 'Daily Security Report - January 18, 2024', 
                      date: '2024-01-18', 
                      time: '18:30',
                      status: 'Generated', 
                      priority: 'Medium',
                      flagged: false,
                      officer: 'John Smith',
                      incidents: 3,
                      size: '2.4 MB'
                    },
                    { 
                      id: 'RPT-002', 
                      type: 'Medical Incident', 
                      title: 'Medical Emergency - Lobby Incident', 
                      date: '2024-01-18', 
                      time: '14:22',
                      status: 'Generated', 
                      priority: 'High',
                      flagged: true,
                      officer: 'Sarah Johnson',
                      incidents: 1,
                      size: '1.8 MB'
                    },
                    { 
                      id: 'RPT-003', 
                      type: 'Security Audit', 
                      title: 'Monthly Security Systems Audit', 
                      date: '2024-01-17', 
                      time: '16:45',
                      status: 'Processing', 
                      priority: 'Medium',
                      flagged: false,
                      officer: 'Mike Chen',
                      incidents: 0,
                      size: '3.2 MB'
                    },
                    { 
                      id: 'RPT-004', 
                      type: 'Incident Report', 
                      title: 'Security Breach - East Wing', 
                      date: '2024-01-17', 
                      time: '09:15',
                      status: 'Generated', 
                      priority: 'Critical',
                      flagged: true,
                      officer: 'Lisa Rodriguez',
                      incidents: 1,
                      size: '4.1 MB'
                    },
                    { 
                      id: 'RPT-005', 
                      type: 'Daily Log', 
                      title: 'Daily Security Report - January 17, 2024', 
                      date: '2024-01-17', 
                      time: '18:30',
                      status: 'Generated', 
                      priority: 'Low',
                      flagged: false,
                      officer: 'John Smith',
                      incidents: 0,
                      size: '1.9 MB'
                    },
                    { 
                      id: 'RPT-006', 
                      type: 'Compliance', 
                      title: 'Weekly Compliance Review', 
                      date: '2024-01-16', 
                      time: '17:00',
                      status: 'Under Review', 
                      priority: 'Medium',
                      flagged: false,
                      officer: 'Admin System',
                      incidents: 2,
                      size: '2.7 MB'
                    }
                  ].map((report, index) => (
                    <div key={index} className="card" style={{ 
                      border: report.flagged ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                      position: 'relative',
                      background: report.flagged ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.05)'
                    }}>
                      {/* Admin Checkbox */}
                      {user?.role === 'admin' && (
                        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                          <input type="checkbox" style={{ accentColor: '#06b6d4' }} />
                        </div>
                      )}

                      {/* Flag Indicator */}
                      {report.flagged && (
                        <div style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          right: '12px',
                          background: '#ef4444',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          🚩 FLAGGED
                        </div>
                      )}

                      <div style={{ marginTop: user?.role === 'admin' ? '32px' : '16px' }}>
                        {/* Report Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <span style={{ 
                            background: report.type === 'Daily Log' ? 'linear-gradient(45deg, #06b6d4, #3b82f6)' :
                                      report.type === 'Medical Incident' ? 'rgba(239, 68, 68, 0.2)' :
                                      report.type === 'Security Audit' ? 'rgba(245, 158, 11, 0.2)' :
                                      report.type === 'Incident Report' ? 'rgba(239, 68, 68, 0.2)' :
                                      report.type === 'Compliance' ? 'rgba(139, 92, 246, 0.2)' :
                                      'rgba(100, 116, 139, 0.2)',
                            color: report.type === 'Daily Log' ? 'white' :
                                  report.type === 'Medical Incident' ? '#ef4444' :
                                  report.type === 'Security Audit' ? '#f59e0b' :
                                  report.type === 'Incident Report' ? '#ef4444' :
                                  report.type === 'Compliance' ? '#8b5cf6' :
                                  '#64748b',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {report.type.toUpperCase()}
                          </span>
                          <span style={{ 
                            color: report.status === 'Generated' ? '#10b981' :
                                  report.status === 'Processing' ? '#f59e0b' :
                                  report.status === 'Under Review' ? '#06b6d4' :
                                  '#64748b',
                            fontSize: '12px', 
                            fontWeight: '600' 
                          }}>
                            {report.status === 'Generated' ? '✓' : 
                             report.status === 'Processing' ? '⏳' :
                             report.status === 'Under Review' ? '👁️' : '📝'} {report.status}
                          </span>
                        </div>

                        {/* Report Title & Details */}
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', lineHeight: '1.3' }}>
                          {report.title}
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '13px', color: '#94a3b8' }}>
                          <div>📅 {report.date}</div>
                          <div>🕐 {report.time}</div>
                          <div>👤 {report.officer}</div>
                          <div>📊 {report.incidents} incidents</div>
                          <div>💾 {report.size}</div>
                          <div style={{ 
                            color: report.priority === 'Critical' ? '#ef4444' :
                                  report.priority === 'High' ? '#f59e0b' :
                                  report.priority === 'Medium' ? '#06b6d4' :
                                  '#10b981'
                          }}>
                            {report.priority === 'Critical' ? '🚨' :
                             report.priority === 'High' ? '🔴' :
                             report.priority === 'Medium' ? '🟡' : '🟢'} {report.priority}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                          <button className="btn" style={{ fontSize: '14px', padding: '8px' }}>
                            📄 View Report
                          </button>
                          <button className="btn btn-secondary" style={{ fontSize: '14px', padding: '8px' }}>
                            📧 Share
                          </button>
                        </div>

                        {/* Admin Actions */}
                        {user?.role === 'admin' && (
                          <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <button 
                              style={{ 
                                flex: 1,
                                padding: '6px 12px', 
                                borderRadius: '4px', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: report.flagged ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: report.flagged ? '#10b981' : '#ef4444',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              {report.flagged ? '✅ Unflag' : '🚩 Flag for Follow-up'}
                            </button>
                            <button style={{ 
                              padding: '6px 12px', 
                              borderRadius: '4px', 
                              border: '1px solid rgba(255,255,255,0.2)',
                              background: 'transparent',
                              color: '#94a3b8',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}>
                              📁 Archive
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  paddingTop: '32px', 
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  marginTop: '32px'
                }}>
                  <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                    Showing 1-12 of 156 reports
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      ← Previous
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      1
                    </button>
                    <button className="btn" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      2
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      3
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      Next →
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Follow-up Dashboard */}
              {user?.role === 'admin' && (
                <div className="card" style={{ marginTop: '32px' }}>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>🚩 Admin Follow-up Dashboard</h3>
                    <p style={{ color: '#94a3b8', fontSize: '16px' }}>Manage flagged reports and follow-up actions</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <div style={{ 
                      padding: '20px',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.05)'
                    }}>
                      <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#ef4444' }}>
                        🚨 Critical Follow-ups (2)
                      </h4>
                      <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
                        • Security Breach - East Wing<br/>
                        • Medical Emergency - Requires Documentation
                      </div>
                      <button className="btn" style={{ fontSize: '14px', width: '100%' }}>
                        Review Critical Items
                      </button>
                    </div>

                    <div style={{ 
                      padding: '20px',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      background: 'rgba(245, 158, 11, 0.05)'
                    }}>
                      <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#f59e0b' }}>
                        ⏰ Pending Reviews (4)
                      </h4>
                      <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>
                        • 2 Incident Reports awaiting approval<br/>
                        • 2 Audit reports need supervisor review
                      </div>
                      <button className="btn btn-secondary" style={{ fontSize: '14px', width: '100%' }}>
                        View Pending Queue
                      </button>
                    </div>

                    <div style={{ 
                      padding: '20px',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.05)'
                    }}>
                      <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#10b981' }}>
                        📊 Quick Actions
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button className="btn btn-secondary" style={{ fontSize: '14px', textAlign: 'left' }}>
                          📤 Bulk Export Flagged Reports
                        </button>
                        <button className="btn btn-secondary" style={{ fontSize: '14px', textAlign: 'left' }}>
                          📧 Send Follow-up Reminders
                        </button>
                        <button className="btn btn-secondary" style={{ fontSize: '14px', textAlign: 'left' }}>
                          📋 Generate Follow-up Summary
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* User and Vendor Management Tab (Admin Only) */}
      {activeTab === 'user-management' && isAdmin && (
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
                User & Vendor Management
              </h1>
              <p style={{ 
                fontSize: '20px', 
                color: '#94a3b8', 
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                Comprehensive management of user accounts, vendor access, security permissions, and activity monitoring.
              </p>
            </div>
          </section>

          {/* Quick Stats Dashboard */}
          <section style={{ padding: '0 24px 40px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '16px',
                marginBottom: '32px'
              }}>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#06b6d4' }}>24</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Active Users</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>15</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Staff Members</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>8</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Registered Vendors</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>3</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Pending Approvals</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>12</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Active Sessions</div>
                </div>
              </div>
            </div>
          </section>

          {/* User Management Section */}
          <section style={{ padding: '0 24px 40px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="card" style={{ marginBottom: '32px' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>👥 User Account Management</h3>
                      <p style={{ color: '#94a3b8', fontSize: '16px' }}>Manage user accounts, roles, and access permissions</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="btn btn-secondary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                        📤 Export Users
                      </button>
                      <button className="btn" style={{ fontSize: '14px', padding: '8px 16px' }}>
                        ➕ Add New User
                      </button>
                    </div>
                  </div>
                </div>

                {/* User List Table */}
                <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>User</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>Role</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>Department</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>Last Active</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold', color: '#06b6d4' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'John Smith', email: 'j.smith@verivault.com', role: 'Admin', department: 'Security', lastActive: '2 mins ago', status: 'Online', accessLevel: 'Full' },
                        { name: 'Sarah Johnson', email: 's.johnson@verivault.com', role: 'Security Officer', department: 'Security', lastActive: '5 mins ago', status: 'Online', accessLevel: 'High' },
                        { name: 'Mike Chen', email: 'm.chen@verivault.com', role: 'Supervisor', department: 'Operations', lastActive: '1 hour ago', status: 'Away', accessLevel: 'Medium' },
                        { name: 'Lisa Rodriguez', email: 'l.rodriguez@verivault.com', role: 'Security Officer', department: 'Security', lastActive: '3 hours ago', status: 'Offline', accessLevel: 'High' },
                        { name: 'David Wilson', email: 'd.wilson@verivault.com', role: 'Manager', department: 'Administration', lastActive: '30 mins ago', status: 'Online', accessLevel: 'High' },
                        { name: 'Emily Davis', email: 'e.davis@verivault.com', role: 'Security Officer', department: 'Security', lastActive: '2 hours ago', status: 'Away', accessLevel: 'Medium' }
                      ].map((user, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '500' }}>{user.name}</div>
                              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{user.email}</div>
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '12px', 
                              fontSize: '12px',
                              background: user.role === 'Admin' ? 'rgba(239, 68, 68, 0.1)' :
                                        user.role === 'Manager' ? 'rgba(245, 158, 11, 0.1)' :
                                        user.role === 'Supervisor' ? 'rgba(59, 130, 246, 0.1)' :
                                        'rgba(16, 185, 129, 0.1)',
                              color: user.role === 'Admin' ? '#ef4444' :
                                    user.role === 'Manager' ? '#f59e0b' :
                                    user.role === 'Supervisor' ? '#3b82f6' :
                                    '#10b981'
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px' }}>{user.department}</td>
                          <td style={{ padding: '12px', fontSize: '14px', color: '#94a3b8' }}>{user.lastActive}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '12px', 
                              fontSize: '12px',
                              background: user.status === 'Online' ? 'rgba(16, 185, 129, 0.1)' :
                                        user.status === 'Away' ? 'rgba(245, 158, 11, 0.1)' :
                                        'rgba(100, 116, 139, 0.1)',
                              color: user.status === 'Online' ? '#10b981' :
                                    user.status === 'Away' ? '#f59e0b' :
                                    '#64748b'
                            }}>
                              {user.status === 'Online' ? '🟢' : user.status === 'Away' ? '🟡' : '⚫'} {user.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'transparent',
                                color: '#06b6d4',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}>
                                ✏️ Edit
                              </button>
                              <button style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'transparent',
                                color: '#10b981',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}>
                                ⬆️ Promote
                              </button>
                              <button style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'transparent',
                                color: '#f59e0b',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}>
                                ⬇️ Demote
                              </button>
                              <button style={{ 
                                padding: '4px 8px', 
                                borderRadius: '4px', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'transparent',
                                color: '#ef4444',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}>
                                🗑️ Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add/Edit User Form */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>➕ Add New User</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input type="text" className="form-input" placeholder="Enter full name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input type="email" className="form-input" placeholder="user@verivault.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">User Role *</label>
                      <select className="form-input">
                        <option value="">Select Role</option>
                        <option value="admin">🔴 Admin - Full Access</option>
                        <option value="manager">🟡 Manager - High Access</option>
                        <option value="supervisor">🔵 Supervisor - Medium Access</option>
                        <option value="officer">🟢 Security Officer - Standard Access</option>
                        <option value="viewer">⚪ Viewer - Read Only</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select className="form-input">
                        <option value="">Select Department</option>
                        <option value="security">🛡️ Security</option>
                        <option value="operations">⚙️ Operations</option>
                        <option value="administration">📋 Administration</option>
                        <option value="management">👔 Management</option>
                        <option value="it">💻 IT Support</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn" style={{ flex: 1, fontSize: '14px' }}>
                      ➕ Create User Account
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1, fontSize: '14px' }}>
                      📧 Send Welcome Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Vendor/Staff Management Section */}
          <section style={{ padding: '0 24px 40px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="card" style={{ marginBottom: '32px' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>🏢 Vendor & Staff Registry</h3>
                      <p style={{ color: '#94a3b8', fontSize: '16px' }}>Manage external vendors, contractors, and staff access</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <select className="form-input" style={{ minWidth: '150px' }}>
                        <option value="">All Categories</option>
                        <option value="vendor">🏢 Vendors</option>
                        <option value="contractor">🔧 Contractors</option>
                        <option value="staff">👥 Staff</option>
                        <option value="visitor">👤 Frequent Visitors</option>
                      </select>
                      <button className="btn" style={{ fontSize: '14px', padding: '8px 16px' }}>
                        ➕ Add Vendor/Staff
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vendor/Staff Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                  gap: '20px',
                  marginBottom: '24px'
                }}>
                  {[
                    { name: 'ABC Maintenance Co.', contact: 'Mike Johnson', type: 'Vendor', status: 'Active', access: 'Restricted', lastVisit: '2024-01-18', phone: '(555) 123-4567' },
                    { name: 'Food Services Inc.', contact: 'Lisa Rodriguez', type: 'Vendor', status: 'Active', access: 'Service Areas', lastVisit: '2024-01-17', phone: '(555) 234-5678' },
                    { name: 'IT Consulting Group', contact: 'Robert Taylor', type: 'Contractor', status: 'Pending', access: 'IT Department', lastVisit: '2024-01-15', phone: '(555) 345-6789' },
                    { name: 'Security Systems Ltd.', contact: 'Jennifer Brown', type: 'Contractor', status: 'Active', access: 'All Areas', lastVisit: '2024-01-16', phone: '(555) 456-7890' },
                    { name: 'Legal Advisors LLC', contact: 'James Wilson', type: 'Visitor', status: 'Active', access: 'Legal Department', lastVisit: '2024-01-14', phone: '(555) 567-8901' },
                    { name: 'Cleaning Services Pro', contact: 'Maria Garcia', type: 'Vendor', status: 'Active', access: 'Common Areas', lastVisit: '2024-01-18', phone: '(555) 678-9012' }
                  ].map((entity, index) => (
                    <div key={index} className="card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <span style={{ 
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: entity.type === 'Vendor' ? 'rgba(59, 130, 246, 0.1)' :
                                    entity.type === 'Contractor' ? 'rgba(245, 158, 11, 0.1)' :
                                    entity.type === 'Visitor' ? 'rgba(16, 185, 129, 0.1)' :
                                    'rgba(139, 92, 246, 0.1)',
                          color: entity.type === 'Vendor' ? '#3b82f6' :
                                entity.type === 'Contractor' ? '#f59e0b' :
                                entity.type === 'Visitor' ? '#10b981' :
                                '#8b5cf6'
                        }}>
                          {entity.type.toUpperCase()}
                        </span>
                        <span style={{ 
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          background: entity.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' :
                                    entity.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' :
                                    'rgba(239, 68, 68, 0.1)',
                          color: entity.status === 'Active' ? '#10b981' :
                                entity.status === 'Pending' ? '#f59e0b' :
                                '#ef4444'
                        }}>
                          {entity.status === 'Active' ? '✅' : entity.status === 'Pending' ? '⏳' : '❌'} {entity.status}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{entity.name}</h4>
                      
                      <div style={{ display: 'grid', gap: '4px', marginBottom: '16px', fontSize: '13px', color: '#94a3b8' }}>
                        <div>👤 Contact: {entity.contact}</div>
                        <div>📞 Phone: {entity.phone}</div>
                        <div>🔐 Access: {entity.access}</div>
                        <div>📅 Last Visit: {entity.lastVisit}</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button style={{ 
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          background: 'transparent',
                          color: '#06b6d4',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}>
                          ✏️ Edit Details
                        </button>
                        <button style={{ 
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          background: 'transparent',
                          color: '#10b981',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}>
                          🔐 Manage Access
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Access Control Panel */}
          <section style={{ padding: '0 24px 40px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="card" style={{ marginBottom: '32px' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>🔐 Access Control Center</h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Manage security permissions and access levels across the facility</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  {/* Access Level Management */}
                  <div style={{ 
                    padding: '20px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.05)'
                  }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#3b82f6' }}>
                      🎯 Access Level Definitions
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
                        <span>🔴 Full Access</span>
                        <span style={{ color: '#94a3b8' }}>2 users</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '4px' }}>
                        <span>🟡 High Access</span>
                        <span style={{ color: '#94a3b8' }}>5 users</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '4px' }}>
                        <span>🔵 Medium Access</span>
                        <span style={{ color: '#94a3b8' }}>8 users</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px' }}>
                        <span>🟢 Basic Access</span>
                        <span style={{ color: '#94a3b8' }}>12 users</span>
                      </div>
                    </div>
                    <button className="btn btn-secondary" style={{ fontSize: '14px', width: '100%', marginTop: '16px' }}>
                      🔧 Configure Access Levels
                    </button>
                  </div>

                  {/* Area Access Control */}
                  <div style={{ 
                    padding: '20px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.05)'
                  }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#10b981' }}>
                      🏢 Area Access Control
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Main Entrance</span>
                        <span style={{ color: '#10b981' }}>✅ Open</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Service Areas</span>
                        <span style={{ color: '#f59e0b' }}>🔒 Restricted</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Medical Wing</span>
                        <span style={{ color: '#ef4444' }}>🚫 Secure</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>IT Department</span>
                        <span style={{ color: '#f59e0b' }}>🔒 Restricted</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Parking Areas</span>
                        <span style={{ color: '#10b981' }}>✅ Open</span>
                      </div>
                    </div>
                    <button className="btn btn-secondary" style={{ fontSize: '14px', width: '100%', marginTop: '16px' }}>
                      🗺️ Manage Area Access
                    </button>
                  </div>

                  {/* Emergency Access */}
                  <div style={{ 
                    padding: '20px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.05)'
                  }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>
                      🚨 Emergency Controls
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button style={{ 
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}>
                        🔒 Emergency Lockdown
                      </button>
                      <button style={{ 
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(245, 158, 11, 0.5)',
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: '#f59e0b',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}>
                        🚪 Unlock All Exits
                      </button>
                      <button style={{ 
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(139, 92, 246, 0.5)',
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: '#8b5cf6',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}>
                        📢 Emergency Broadcast
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Activity Monitoring */}
          <section style={{ padding: '0 24px 80px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <div className="card">
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>📊 Activity Monitoring Dashboard</h3>
                  <p style={{ color: '#94a3b8', fontSize: '16px' }}>Real-time monitoring of user and vendor activity across the facility</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  {/* Recent Access Events */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>🔐 Recent Access Events</h4>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {[
                        { user: 'Sarah Johnson', action: 'Badge Scan', location: 'Main Entrance', time: '2 mins ago', status: 'success' },
                        { user: 'Mike Chen', action: 'Door Access', location: 'Operations Wing', time: '5 mins ago', status: 'success' },
                        { user: 'Unknown User', action: 'Failed Access', location: 'Secure Area', time: '8 mins ago', status: 'failed' },
                        { user: 'Lisa Rodriguez', action: 'Badge Scan', location: 'Service Entrance', time: '12 mins ago', status: 'success' },
                        { user: 'David Wilson', action: 'Keypad Entry', location: 'IT Department', time: '15 mins ago', status: 'success' },
                        { user: 'Emily Davis', action: 'Badge Scan', location: 'Reception', time: '18 mins ago', status: 'success' }
                      ].map((event, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          background: event.status === 'failed' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)'
                        }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{event.user}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{event.action} - {event.location}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                              fontSize: '12px', 
                              color: event.status === 'success' ? '#10b981' : '#ef4444',
                              marginBottom: '2px'
                            }}>
                              {event.status === 'success' ? '✅' : '❌'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{event.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>👥 Active User Sessions</h4>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {[
                        { user: 'John Smith', role: 'Admin', location: 'Security Office', duration: '2h 45m', device: 'Desktop' },
                        { user: 'Sarah Johnson', role: 'Officer', location: 'Main Lobby', duration: '1h 30m', device: 'Mobile' },
                        { user: 'Mike Chen', role: 'Supervisor', location: 'Operations', duration: '45m', device: 'Tablet' },
                        { user: 'David Wilson', role: 'Manager', location: 'Administration', duration: '3h 15m', device: 'Desktop' },
                        { user: 'Emily Davis', role: 'Officer', location: 'East Wing', duration: '20m', device: 'Mobile' }
                      ].map((session, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          background: 'rgba(255,255,255,0.02)'
                        }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{session.user}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{session.role} - {session.location}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '2px' }}>
                              🟢 {session.duration}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{session.device}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Alerts */}
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#06b6d4' }}>⚠️ Security Alerts</h4>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {[
                        { alert: 'Multiple Failed Access Attempts', location: 'Secure Area', time: '8 mins ago', severity: 'high' },
                        { alert: 'Unusual Access Pattern Detected', location: 'IT Department', time: '25 mins ago', severity: 'medium' },
                        { alert: 'Badge Not Returned After Hours', location: 'Main Building', time: '1 hour ago', severity: 'low' },
                        { alert: 'Emergency Exit Door Ajar', location: 'East Wing', time: '2 hours ago', severity: 'medium' }
                      ].map((alert, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          marginBottom: '8px',
                          background: alert.severity === 'high' ? 'rgba(239, 68, 68, 0.05)' :
                                    alert.severity === 'medium' ? 'rgba(245, 158, 11, 0.05)' :
                                    'rgba(16, 185, 129, 0.05)'
                        }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{alert.alert}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{alert.location}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                              fontSize: '12px', 
                              color: alert.severity === 'high' ? '#ef4444' :
                                    alert.severity === 'medium' ? '#f59e0b' :
                                    '#10b981',
                              marginBottom: '2px'
                            }}>
                              {alert.severity === 'high' ? '🚨' : alert.severity === 'medium' ? '⚠️' : '✅'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{alert.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '16px',
                  paddingTop: '24px',
                  borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <button className="btn" style={{ fontSize: '14px' }}>
                    📊 Generate Activity Report
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '14px' }}>
                    📧 Send Security Summary
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '14px' }}>
                    🔄 Refresh All Data
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: '14px' }}>
                    ⚙️ Configure Alerts
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          {/* Header Section */}
          <section style={{ padding: '80px 24px', textAlign: 'center' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h1 style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                marginBottom: '24px',
                background: 'linear-gradient(45deg, #06b6d4, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Settings
              </h1>
              <p style={{ 
                fontSize: '20px', 
                color: '#94a3b8', 
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                Configure system preferences, security settings, and personalize your VeriVault experience.
              </p>
            </div>
          </section>

          {/* Settings Categories */}
          <section style={{ padding: '0 24px 80px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                gap: '32px' 
              }}>
                <div className="card">
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>👤</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Profile Settings</h3>
                  <div style={{ textAlign: 'left', color: '#94a3b8', marginBottom: '24px' }}>
                    <p style={{ marginBottom: '8px' }}>• Update personal information</p>
                    <p style={{ marginBottom: '8px' }}>• Change password</p>
                    <p style={{ marginBottom: '8px' }}>• Profile picture</p>
                    <p style={{ marginBottom: '8px' }}>• Contact preferences</p>
                    <p style={{ marginBottom: '8px' }}>• Font size preferences</p>
                  </div>
                  <button className="btn" style={{ width: '100%' }}>
                    Edit Profile
                  </button>
                </div>

                <div className="card">
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔔</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Notifications</h3>
                  <div style={{ textAlign: 'left', color: '#94a3b8', marginBottom: '24px' }}>
                    <p style={{ marginBottom: '8px' }}>• Email notifications</p>
                    <p style={{ marginBottom: '8px' }}>• Security alerts</p>
                    <p style={{ marginBottom: '8px' }}>• Report reminders</p>
                    <p style={{ marginBottom: '8px' }}>• System updates</p>
                  </div>
                  <button className="btn" style={{ width: '100%' }}>
                    Configure Alerts
                  </button>
                </div>

                <div className="card">
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔐</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Security</h3>
                  <div style={{ textAlign: 'left', color: '#94a3b8', marginBottom: '24px' }}>
                    <p style={{ marginBottom: '8px' }}>• Two-factor authentication</p>
                    <p style={{ marginBottom: '8px' }}>• Session management</p>
                    <p style={{ marginBottom: '8px' }}>• Login history</p>
                    <p style={{ marginBottom: '8px' }}>• API keys</p>
                  </div>
                  <button className="btn" style={{ width: '100%' }}>
                    Security Settings
                  </button>
                </div>

                <div className="card">
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>💾</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Data & Backup</h3>
                  <div style={{ textAlign: 'left', color: '#94a3b8', marginBottom: '24px' }}>
                    <p style={{ marginBottom: '8px' }}>• Export data</p>
                    <p style={{ marginBottom: '8px' }}>• Backup settings</p>
                    <p style={{ marginBottom: '8px' }}>• Data retention</p>
                    <p style={{ marginBottom: '8px' }}>• Archive management</p>
                  </div>
                  <button className="btn" style={{ width: '100%' }}>
                    Manage Data
                  </button>
                </div>

                <div className="card">
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔧</div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>System</h3>
                  <div style={{ textAlign: 'left', color: '#94a3b8', marginBottom: '24px' }}>
                    <p style={{ marginBottom: '8px' }}>• System information</p>
                    <p style={{ marginBottom: '8px' }}>• Version details</p>
                    <p style={{ marginBottom: '8px' }}>• Support & help</p>
                    <p style={{ marginBottom: '8px' }}>• License information</p>
                  </div>
                  <button className="btn" style={{ width: '100%' }}>
                    System Info
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* PIN Confirmation Modal */}
      <PinConfirmationModal
        isOpen={pinModalOpen}
        onClose={handlePinModalClose}
        onConfirm={handlePinConfirmed}
        reportType={currentReportType}
        reportData={currentReportData}
      />
    </div>
  );
};

export default Dashboard; 