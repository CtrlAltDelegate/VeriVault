import React from 'react';
import { Link } from 'react-router-dom';

const SimpleLandingPage: React.FC = () => {
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
            <Link 
              to="/login" 
              style={{ 
                color: '#94a3b8', 
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Sign In
            </Link>
            <Link 
              to="/login" 
              className="btn"
              style={{ textDecoration: 'none' }}
            >
              Start Free Trial
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            marginBottom: '24px',
            background: 'linear-gradient(45deg, #06b6d4, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Intelligent Security<br />Operations Platform
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#94a3b8', 
            marginBottom: '32px',
            lineHeight: '1.6'
          }}>
            Streamline your security operations with AI-powered daily logging, 
            professional reporting, and real-time analytics designed for security professionals.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn" style={{ textDecoration: 'none' }}>
              🚀 Start Free 14-Day Trial
            </Link>
            <button className="btn btn-secondary">
              📺 Watch Demo
            </button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
              Powerful Security Management Features
            </h2>
            <p style={{ fontSize: '20px', color: '#94a3b8' }}>
              Everything you need to run professional security operations
            </p>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px' 
          }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>📝</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                Daily Log System
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                Real-time activity logging with smart categorization, priority levels, and instant search capabilities.
              </p>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                AI Report Generation
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                Professional PDF reports generated automatically with AI analysis of your security data.
              </p>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>📈</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                Analytics Dashboard
              </h3>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                Real-time metrics, trends analysis, and performance insights for data-driven decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
            Ready to Streamline Your Security Operations?
          </h2>
          <p style={{ fontSize: '20px', color: '#94a3b8', marginBottom: '32px' }}>
            Join hundreds of security professionals already using VeriVault
          </p>
          <Link to="/login" className="btn" style={{ textDecoration: 'none' }}>
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: 'rgba(15, 23, 42, 0.8)', 
        padding: '32px 24px', 
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          &copy; 2024 VeriVault. All rights reserved. | AI-Powered Security Intelligence Platform
        </p>
      </footer>
    </div>
  );
};

export default SimpleLandingPage; 