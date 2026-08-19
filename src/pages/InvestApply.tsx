import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { trackEvent } from '../lib/amplitude';
import { useUser } from '../lib/useUser';
import { MOCK_FUNDS } from '../types';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function InvestApply() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, saveUser } = useUser();
  const queryParams = new URLSearchParams(location.search);
  
  const fundId = queryParams.get('fund') || 'mi-retiro';
  const initialAmount = Number(queryParams.get('initial')) || 25;
  const monthlyAmount = Number(queryParams.get('monthly')) || 0;
  const goal = queryParams.get('goal') || '';
  const isSimulated = queryParams.get('simulated') === 'true';
  
  const fund = MOCK_FUNDS.find(f => f.id === fundId) || MOCK_FUNDS[0];

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasTracked = React.useRef(false);
  useEffect(() => {
    // If user is not logged in, wait. Do not auto-redirect yet.
    if (!user || user.status === 'prospect') return;

    if (!hasTracked.current) {
      hasTracked.current = true;
      trackEvent('Investment Application Started', {
        fund_id: fundId,
        investment_amount: initialAmount,
        contribution_frequency: monthlyAmount > 0 ? 'monthly' : 'none',
        simulation_used: isSimulated
      });
    }
  }, [user, fundId, initialAmount, monthlyAmount, isSimulated]);

  const handleInvest = async () => {
    setLoading(true);
    
    // Determine is first investment before state change
    const isFirstInvestment = user?.totalInvested === 0 || !user?.hasEverInvested;

    const newActiveFunds = [...(user?.activeFunds || [])];
    if (!newActiveFunds.includes(fundId)) {
      newActiveFunds.push(fundId);
    }
    
    await saveUser({
      status: 'active_investor',
      totalInvested: (user?.totalInvested || 0) + initialAmount,
      activeFunds: newActiveFunds,
      lastInvestmentDate: new Date().toISOString(),
      ...(goal && { financialGoal: goal })
    });

    // Las user properties ya quedaron actualizadas por saveUser().
    // Investment Completed se registra después para que el evento capture
    // el estado actualizado del usuario en Amplitude.
    await trackEvent('Investment Completed', {
      fund_id: fundId,
      investment_amount: initialAmount,
      contribution_frequency: monthlyAmount > 0 ? 'monthly' : 'none',
      is_first_investment: isFirstInvestment
    });

    // IMPORTANTE: monthlyAmount viene del simulador y representa intención.
    // No crea por sí solo un aporte recurrente. Ese evento se dispara
    // exclusivamente desde /recurring cuando el usuario lo confirma.

    setLoading(false);
    navigate('/success');
  };

  if (!user || user.status === 'prospect') {
    const returnPath = encodeURIComponent(`invest/apply${location.search}`);
    return (
      <div className="flex-1 bg-[#F9FAFB] py-12 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-[#FCC710]/20 text-[#201D1A] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#201D1A] mb-4">Casi listo para invertir</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Para continuar con tu inversión en <strong>{fund.name}</strong> y guardar tu progreso, necesitas acceder a tu cuenta.
          </p>
          <div className="space-y-4">
            <Link 
              to={`/login?redirect=${returnPath}`}
              className="block w-full py-3 px-4 bg-[#FCC710] text-[#201D1A] font-medium rounded-xl hover:bg-[#EAB900] font-bold transition-colors"
            >
              Ingresar
            </Link>
            <Link 
              to={`/register?redirect=${returnPath}`}
              className="block w-full py-3 px-4 bg-white text-[#201D1A] font-medium rounded-xl border border-[#201D1A] font-bold hover:bg-gray-50 transition-colors"
            >
              Abrir mi cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F9FAFB] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to={`/funds/${fundId}`} className="inline-flex items-center text-sm mb-8 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al detalle
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#201D1A] mb-2 tracking-tight">Confirma tu Inversión</h1>
          <p className="text-gray-600">Revisa los detalles de tu orden antes de confirmar.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 mb-8">
          
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100 mb-6">
            <div className={`w-12 h-12 rounded-xl ${fund.color} shadow-sm`} />
            <div>
              <h2 className="text-xl font-bold text-[#201D1A]">{fund.name}</h2>
              <p className="text-sm text-gray-500">{fund.category}</p>
            </div>
          </div>
          
          <div className="space-y-6 mb-8">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Monto a Invertir</span>
              <span className="text-2xl font-bold text-[#201D1A]">USD {initialAmount.toLocaleString()}</span>
            </div>
            
            {monthlyAmount > 0 && (
              <div className="flex justify-between items-center p-4 bg-[#FCC710]/10 border border-[#FCC710]/20 rounded-2xl">
                <div>
                  <span className="block text-gray-600 font-medium">Aporte Recurrente Configurado</span>
                  <span className="text-xs text-[#201D1A]">Débito automático mensual</span>
                </div>
                <span className="text-lg font-bold text-[#201D1A]">USD {monthlyAmount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center p-4">
              <span className="text-gray-600 font-medium">Cuenta de Origen</span>
              <div className="text-right">
                <span className="block font-medium text-gray-900">Banco Pichincha</span>
                <span className="text-sm text-gray-500">**** **** 1234</span>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3 mb-8">
            <ShieldAlert className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 leading-relaxed">
              Al confirmar esta transacción, autorizas el débito de tu cuenta bancaria. Esta operación puede tardar hasta 48 horas laborables en reflejarse en tu estado de cuenta.
            </p>
          </div>
          
          <label className="flex items-start gap-3 cursor-pointer mb-8">
            <input 
              type="checkbox" 
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-5 h-5 text-[#201D1A] rounded border-gray-300 focus:ring-[#FCC710]"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              He leído y acepto el Reglamento del Fondo, el Contrato de Incorporación y las condiciones de la inversión. Entiendo que los rendimientos pasados no garantizan rendimientos futuros.
            </span>
          </label>
          
          <button 
            onClick={handleInvest}
            disabled={!acceptedTerms || loading}
            className="w-full py-4 px-6 rounded-xl text-center font-bold text-[#201D1A] bg-[#FCC710] hover:bg-[#EAB900] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center"><span className="animate-pulse mr-2">Procesando</span>...</span>
            ) : (
              <>Confirmar Inversión <CheckCircle2 className="ml-2 w-5 h-5" /></>
            )}
          </button>
          
        </div>
      </div>
    </div>
  );
}
