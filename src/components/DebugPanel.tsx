import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../lib/useUser';

export default function DebugPanel() {
  const { user, saveUser, clearUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('demo') === '1') {
      setIsDemo(true);
      // Auto-set "Base madura sin inversión" if no user exists
      if (!user) {
        saveUser({
          status: 'registered_no_investment',
          customerTenureDays: 45,
          firstName: 'Demo',
          lastName: 'User'
        });
      }
    }
  }, [location.search, user, saveUser]);

  if (!isDemo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black text-white px-4 py-2 rounded-full text-xs font-mono shadow-lg opacity-80 hover:opacity-100"
      >
        {isOpen ? 'Close Debug' : 'Debug Amplitude'}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 shadow-xl rounded-xl p-4 w-64 text-sm font-mono z-50">
          <h3 className="font-bold border-b pb-2 mb-2">User State</h3>
          <p>ID: {user?.userId || 'None'}</p>
          <p>Status: {user?.status || 'None'}</p>
          <p>Invested: ${user?.totalInvested || 0}</p>

          <h3 className="font-bold border-b pb-2 mt-4 mb-2">Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => {
                clearUser();
                navigate('/');
              }}
              className="w-full bg-red-100 text-red-700 px-2 py-1 rounded"
            >
              Clear User & Logout
            </button>
            <button 
              onClick={() => {
                saveUser({
                  status: 'registered_no_investment',
                  customerTenureDays: 45,
                  totalInvested: 0,
                  activeFunds: []
                });
              }}
              className="w-full bg-blue-100 text-blue-700 px-2 py-1 rounded"
            >
              Set Base Madura
            </button>
            <button 
              onClick={() => {
                saveUser({
                  status: 'active_investor',
                  customerTenureDays: 120,
                  totalInvested: 5000,
                  activeFunds: ['mi-retiro', 'oportunidad'],
                  hasEverInvested: true
                });
              }}
              className="w-full bg-green-100 text-green-700 px-2 py-1 rounded"
            >
              Set Active Investor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
