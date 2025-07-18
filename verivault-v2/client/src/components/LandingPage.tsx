import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">VeriVault</h1>
              <p className="text-sm text-cyan-400">Security Intelligence</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="text-slate-300 hover:text-white transition-colors">About</a>
            <a href="#contact" className="text-slate-300 hover:text-white transition-colors">Contact</a>
            <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Sign In</Link>
            <Link 
              to="/login" 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all"
            >
              Start Free Trial
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">Intelligent Security</span><br />
            <span className="text-white">Operations Platform</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Streamline your security operations with AI-powered daily logging, 
            professional reporting, and real-time analytics designed for security professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg transform hover:scale-105"
            >
              🚀 Start Free 14-Day Trial
            </Link>
            <button className="border border-slate-600 text-white px-8 py-4 rounded-lg font-semibold hover:border-slate-400 transition-all">
              📺 Watch Demo
            </button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Security Management Features</h2>
            <p className="text-xl text-slate-400">Everything you need to run professional security operations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-white mb-4">Daily Log System</h3>
              <p className="text-slate-400">Real-time activity logging with smart categorization, priority levels, and instant search capabilities.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-4">AI Report Generation</h3>
              <p className="text-slate-400">Professional PDF reports generated automatically with AI analysis of your security data.</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-white mb-4">Analytics Dashboard</h3>
              <p className="text-slate-400">Real-time metrics, trends analysis, and performance insights for data-driven decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-cyan-400 mb-2">500+</div>
              <div className="text-slate-400">Security Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-400 mb-2">50K+</div>
              <div className="text-slate-400">Daily Log Entries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
              <div className="text-slate-400">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Streamline Your Security Operations?</h2>
          <p className="text-xl text-slate-400 mb-8">Join hundreds of security professionals already using VeriVault</p>
          <Link 
            to="/login" 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg transform hover:scale-105 inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/50 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>&copy; 2024 VeriVault. All rights reserved. | AI-Powered Security Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 