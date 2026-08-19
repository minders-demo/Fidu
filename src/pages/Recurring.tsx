import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../lib/amplitude';
import { useUser } from '../lib/useUser';
import { MOCK_FUNDS } from '../types';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Recurring() {
  const navigate = useNavigate();
  const { user, saveUser } = useUser();
  const [fundId, setFundId] = useState('mi-retiro');
  const [amount, setAmount] = useState(100);
  const [day, setDay] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  }, []);

  const handleSave = async () => {
    setLoading(true);
    
    await saveUser({
      recurringContributionEnabled: true,
      recurringAmount: amount
    });

    await trackEvent('Recurring Contribution Created', {
      fund_id: fundId,
      recurring_amount: amount,
      frequency: 'monthly',
      debit_day: day
    });
    
    setLoading(false);
    navigate('/dashboard');
  };

  if (!user || user.status === 'prospect') return null;

  return (
    <div className="flex-1 bg-[#F9FAFB] py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#FCC710]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#201D1A]">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#201D1A] mb-2">Aporte Recurrente</h1>
          <p className="text-gray-600">Automatiza tu inversión y alcanza tus metas sin pensarlo.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 mb-8">
          
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fondo de destino</label>
              <select 
                value={fundId}
                onChange={(e) => setFundId(e.target.value)}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FCC710] focus:ring-[#FCC710] py-3 px-4 bg-gray-50 border"
              >
                {MOCK_FUNDS.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                <span>Monto Mensual</span>
                <span className="text-[#201D1A] font-semibold">USD {amount}</span>
              </label>
              <input 
                type="range" 
                min={25} 
                max="2000" 
                step="25"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-[#FCC710] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                <span>Día de débito mensual</span>
                <span className="text-[#201D1A] font-semibold">Día {day}</span>
              </label>
              <input 
                type="range" 
                min={1} 
                max={28} 
                step={1}
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full accent-[#FCC710] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">
                Se debitará automáticamente de tu cuenta bancaria vinculada los días {day} de cada mes.
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl text-center font-bold text-[#201D1A] bg-[#FCC710] hover:bg-[#EAB900] disabled:opacity-50 transition-all shadow-md flex items-center justify-center"
          >
            {loading ? 'Guardando...' : <>Activar Aporte Recurrente <CheckCircle2 className="ml-2 w-5 h-5" /></>}
          </button>
          
        </div>
      </div>
    </div>
  );
}
