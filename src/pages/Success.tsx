import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackEvent } from '../lib/amplitude';
import { useUser } from '../lib/useUser';
import { Check, ArrowRight, RefreshCw } from 'lucide-react';

export default function Success() {
  const { user } = useUser();
  const receiptId = useMemo(
    () => `INV-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
    []
  );

  useEffect(() => {
  }, []);

  return (
    <div className="flex-1 bg-[#F9FAFB] py-12 flex items-center justify-center min-h-[80vh]">
      <div className="max-w-md w-full mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 text-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FCC710]/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#EF942F]/20 rounded-full blur-3xl opacity-50" />
          
          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, delay: 0.2 }}
              className="w-24 h-24 bg-[#1D9E84]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#1D9E84]/30"
            >
              <Check className="w-12 h-12 text-[#1D9E84]" />
            </motion.div>
            
            <h1 className="text-3xl font-extrabold text-[#201D1A] mb-2">¡Inversión Exitosa!</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Hemos recibido tu orden de inversión. Tu dinero ya está trabajando para ti.
            </p>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">Monto Invertido</span>
                <span className="font-semibold text-[#201D1A]">Referencial</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">Estado</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1D9E84]/20 text-[#1D9E84]">
                  Procesando
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Comprobante</span>
                <span className="font-mono text-xs text-gray-400">#{receiptId}</span>
              </div>
            </div>
            
            {!user?.recurringContributionEnabled && (
              <div className="mb-6">
                <Link
                  to="/recurring"
                  className="w-full py-4 px-6 rounded-xl font-medium text-[#201D1A] bg-[#FCC710]/20 border border-[#FCC710]/20 hover:bg-[#FCC710]/30 transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2 text-[#EF942F]" />
                  Programar Aporte Recurrente
                </Link>
                <p className="text-xs text-gray-400 mt-2">Alcanza tus metas más rápido automatizando tus aportes.</p>
              </div>
            )}
            
            <Link
              to="/dashboard"
              className="w-full py-4 px-6 rounded-xl font-bold text-[#201D1A] bg-[#FCC710] hover:bg-[#EAB900] transition-all shadow-md flex items-center justify-center"
            >
              Ir a mi Panel
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
