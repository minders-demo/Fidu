import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackEvent } from '../lib/amplitude';
import { useUser } from '../lib/useUser';
import { MOCK_FUNDS } from '../types';
import { Wallet, TrendingUp, RefreshCw, Plus, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user, clearUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
  }, []);

  if (!user || user.status === 'prospect') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No has iniciado sesión</h2>
        <Link to="/register" className="text-[#EF942F] font-medium hover:underline">Crear cuenta o ingresar</Link>
      </div>
    );
  }

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  const activeFundsList = user.activeFunds.map(id => MOCK_FUNDS.find(f => f.id === id)).filter(Boolean) as typeof MOCK_FUNDS;

  return (
    <div className="flex-1 bg-[#F9FAFB] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#201D1A]">Hola, {user.firstName || 'Inversor'}</h1>
            <p className="text-gray-600">Resumen de tu portafolio de inversiones.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/funds"
              className="px-4 py-2 bg-white border border-[#201D1A]/20 rounded-lg text-sm font-bold text-[#201D1A] hover:bg-gray-50 flex items-center shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Invertir Más
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cerrar sesión (Demo)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main Balance */}
          <div className="col-span-1 md:col-span-2 bg-[#201D1A] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className="absolute -right-24 -top-24 w-64 h-64 bg-[#FCC710] rounded-full blur-3xl opacity-20" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-gray-400 font-medium mb-1">Saldo Total</p>
                <div className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                  <span className="text-gray-400 text-2xl md:text-3xl mr-2 font-normal">USD</span>
                  {user.totalInvested.toLocaleString()}
                </div>
                <div className="flex items-center text-green-400 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  + 0.00% este mes
                </div>
              </div>
              
              <div className="mt-8 flex gap-4">
                <div className="bg-[#FCC710]/10 rounded-xl p-4 border border-[#FCC710]/20 flex-1">
                  <p className="text-xs text-[#FCC710] mb-1">Fondos Activos</p>
                  <p className="font-semibold text-lg text-white">{user.activeFunds.length}</p>
                </div>
                <div className="bg-[#FCC710]/10 rounded-xl p-4 border border-[#FCC710]/20 flex-1">
                  <p className="text-xs text-[#FCC710] mb-1">Estado</p>
                  <p className="font-semibold text-lg text-white capitalize">{user.status.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recurring / Goals */}
          <div className="col-span-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded bg-[#FCC710]/20 flex items-center justify-center text-[#EF942F] mr-4">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#201D1A] text-lg">Aporte Recurrente</h3>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              {user.recurringContributionEnabled ? (
                <>
                  <div className="text-3xl font-bold text-[#201D1A] mb-2">
                    <span className="text-lg text-gray-400 font-normal mr-1">USD</span>
                    {user.recurringAmount}
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Se debitará automáticamente cada mes.</p>
                  <Link to="/recurring" className="text-[#EF942F] text-sm font-bold hover:text-[#d78225] text-center">Editar configuración</Link>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-6">No tienes aportes recurrentes configurados. Alcanza tus metas más rápido.</p>
                  <Link 
                    to="/recurring" 
                    className="w-full inline-block py-2.5 px-4 rounded-xl font-bold text-[#201D1A] bg-[#FCC710] hover:bg-[#EAB900] transition-colors"
                  >
                    Activar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Funds List */}
        <h3 className="text-xl font-bold text-[#201D1A] mb-4">Tus Inversiones</h3>
        
        {activeFundsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeFundsList.map((fund, i) => (
              <motion.div 
                key={fund.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${fund.color} shadow-sm`} />
                  <div>
                    <h4 className="font-bold text-[#201D1A]">{fund.name}</h4>
                    <p className="text-xs text-gray-500">{fund.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Invertido</p>
                  {/* For demo, we just assign the total to the first fund, or split if needed. We'll just show total for simplicity */}
                  <p className="font-bold text-[#201D1A] text-lg">
                    USD {i === 0 ? user.totalInvested.toLocaleString() : '0'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aún no tienes fondos activos.</p>
            <Link to="/funds" className="text-[#EF942F] font-bold hover:text-[#d78225]">Explorar fondos</Link>
          </div>
        )}

      </div>
    </div>
  );
}
