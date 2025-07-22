import React, { useState } from 'react';
import axios from 'axios';

interface PinConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (verificationData: any) => void;
  reportType: string;
  reportData: any;
}

const PinConfirmationModal: React.FC<PinConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reportType,
  reportData
}) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://verivault-production.up.railway.app';
      
      const response = await axios.post(`${apiUrl}/api/auth/verify-pin`, {
        userId: user.id,
        pin: pin
      });

      if (response.data.success) {
        // PIN verified successfully, proceed with report generation
        onConfirm(response.data.verificationData);
        handleClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'PIN verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 4) {
      setPin(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-white/20 p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">PIN Confirmation Required</h2>
          <p className="text-slate-400 text-sm">
            Enter your 4-digit PIN to digitally sign and submit this {reportType} report
          </p>
        </div>

        {/* Report Summary */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">📄 Report Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Type:</span>
              <span className="text-white font-medium">{reportType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date:</span>
              <span className="text-white">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Time:</span>
              <span className="text-white">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm text-center">❌ {error}</p>
          </div>
        )}

        <form onSubmit={handlePinSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3 text-center">
              Enter Your 4-Digit PIN
            </label>
            <div className="flex justify-center">
              <input
                type="password"
                value={pin}
                onChange={handlePinChange}
                maxLength={4}
                className="w-32 h-12 text-center text-2xl font-mono bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all tracking-widest"
                placeholder="••••"
                autoFocus
                required
              />
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              This PIN acts as your digital signature
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pin.length !== 4 || loading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Verifying...' : '✅ Confirm & Submit'}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300 text-center">
            <span className="inline-block mr-1">🛡️</span>
            Your PIN confirmation will create an invisible watermark on the generated PDF for security and authenticity verification.
          </p>
          {/* TODO: Future - Add LLM Review Notice */}
          {/* <p className="text-xs text-purple-300 text-center mt-2">
            <span className="inline-block mr-1">🤖</span>
            This report will be analyzed by multiple AI models (GPT-4o, Claude 3, Command R+) to ensure accuracy and completeness before final submission.
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default PinConfirmationModal; 