import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackEvent } from '../lib/amplitude';
import { MOCK_FUNDS } from '../types';
import { Calculator, ArrowRight, TrendingUp } from 'lucide-react';

export default function Simulator() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialFundId = queryParams.get('fund') || 'mi-retiro';

  const [fundId, setFundId] = useState(initialFundId);
  const [initialAmount, setInitialAmount] = useState<number>(1000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(100);
  const [timeHorizon, setTimeHorizon] = useState<number>(120); // in months
  const [goal, setGoal] = useState<string>('retirement');

  useEffect(() => {
  }, []);

  const fund = MOCK_FUNDS.find(f => f.id === fundId) || MOCK_FUNDS[0];

  // Simple compound interest calculation
  const { projectedValue, totalContributed } = useMemo(() => {
    const rateStr = fund.projectedReturn.split('%')[0];
    const annualRate = parseFloat(rateStr) / 100;
    const monthlyRate = annualRate / 12;
    const months = timeHorizon;
    
    let current = initialAmount;
    let contributed = initialAmount;
    
    for (let i = 0; i < months; i++) {
      current = (current + monthlyContribution) * (1 + monthlyRate);
      contributed += monthlyContribution;
    }
    
    return {
      projectedValue: current,
      totalContributed: contributed
    };
  }, [fundId, initialAmount, monthlyContribution, timeHorizon, fund.projectedReturn]);

  const handleSimulate = () => {
    trackEvent('Investment Simulation Completed', {
      fund_id: fundId,
      goal_type: goal,
      initial_amount: initialAmount,
      monthly_contribution: monthlyContribution,
      time_horizon_months: timeHorizon,
      projected_value: Math.round(projectedValue)
    });
    
    navigate(`/invest/apply?fund=${fundId}&initial=${initialAmount}&monthly=${monthlyContribution}&goal=${goal}&simulated=true`);
  };

  return (
    <div className="flex-1 bg-[#F9FAFB] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#FCC710]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#201D1A]">
            <Calculator className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#201D1A] mb-4 tracking-tight">Simulador de Inversión</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Proyecta el crecimiento de tu dinero y descubre cómo alcanzar tus metas financieras.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#201D1A] mb-6">Configura tu plan</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fondo</label>
                  <select 
                    value={fundId}
                    onChange={(e) => setFundId(e.target.value)}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FCC710] focus:ring-[#FCC710] py-3 px-4 bg-gray-50"
                  >
                    {MOCK_FUNDS.map(f => (
                      <option key={f.id} value={f.id}>{f.name} (Tasa ref: {f.projectedReturn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta principal</label>
                  <select 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FCC710] focus:ring-[#FCC710] py-3 px-4 bg-gray-50"
                  >
                    <option value="retirement">Jubilación / Retiro</option>
                    <option value="home">Comprar casa</option>
                    <option value="education">Estudios / Universidad</option>
                    <option value="travel">Viaje soñado</option>
                    <option value="wealth">Construir patrimonio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                    <span>Monto Inicial</span>
                    <span className="text-[#201D1A] font-semibold">USD {initialAmount}</span>
                  </label>
                  <input 
                    type="range" 
                    min={fund.minimumInitial} 
                    max="50000" 
                    step="50"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(Number(e.target.value))}
                    className="w-full accent-[#FCC710] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Min: {fund.minimumInitial}</span>
                    <span>Max: 50,000+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                    <span>Aporte Mensual</span>
                    <span className="text-[#201D1A] font-semibold">USD {monthlyContribution}</span>
                  </label>
                  <input 
                    type="range" 
                    min={0} 
                    max="5000" 
                    step="25"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full accent-[#FCC710] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
                    <span>Plazo de Inversión</span>
                    <span className="text-[#201D1A] font-semibold">{Math.floor(timeHorizon / 12)} años</span>
                  </label>
                  <input 
                    type="range" 
                    min="12" 
                    max="480" 
                    step="12"
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(Number(e.target.value))}
                    className="w-full accent-[#FCC710] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7">
            <div className="bg-[#201D1A] rounded-3xl p-8 sm:p-12 shadow-xl text-white h-full flex flex-col justify-between">
              
              <div>
                <h3 className="text-lg text-gray-400 font-medium mb-2">Proyección Estimada</h3>
                <div className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-8">
                  <span className="text-[#FCC710] text-3xl mr-2 font-normal">USD</span>
                  {Math.round(projectedValue).toLocaleString()}
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-12">
                  <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Total Aportado</p>
                    <p className="text-2xl font-bold">USD {totalContributed.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Interés Generado</p>
                    <p className="text-2xl font-bold text-[#1D9E84]">+ USD {Math.round(projectedValue - totalContributed).toLocaleString()}</p>
                  </div>
                </div>

                {/* Visual Bar */}
                <div className="mb-12">
                  <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-gray-400" 
                      style={{ width: `${(totalContributed / projectedValue) * 100}%` }}
                    />
                    <div 
                      className="h-full bg-[#1D9E84]" 
                      style={{ width: `${((projectedValue - totalContributed) / projectedValue) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-3 text-xs font-medium">
                    <div className="flex items-center text-gray-400">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" /> Tus aportes
                    </div>
                    <div className="flex items-center text-[#1D9E84]">
                      <div className="w-2 h-2 rounded-full bg-[#1D9E84] mr-2" /> Rendimiento
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-800">
                <button 
                  onClick={handleSimulate}
                  className="w-full py-5 px-6 rounded-2xl text-center font-bold text-lg text-[#201D1A] bg-[#FCC710] hover:bg-[#EAB900] transition-all shadow-lg flex items-center justify-center"
                >
                  Continuar con inversión
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
