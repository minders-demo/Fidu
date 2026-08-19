import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackEvent } from '../lib/amplitude';
import { MOCK_FUNDS } from '../types';
import { ArrowRight } from 'lucide-react';

export default function Funds() {
  useEffect(() => {
  }, []);

  return (
    <div className="flex-1 bg-[#F9FAFB] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-[#201D1A] mb-4 tracking-tight">Catálogo de Fondos</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Encuentra el fondo ideal para tus metas financieras. Opciones de inversión desde corto hasta largo plazo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {MOCK_FUNDS.map((fund, i) => (
            <motion.div
              key={fund.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              {fund.id === 'mi-retiro' && (
                <div className="absolute top-0 right-0 bg-[#FCC710] text-[#201D1A] text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Destacado
                </div>
              )}
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${fund.color}`} />
                  <h3 className="font-bold text-2xl text-[#201D1A]">{fund.name}</h3>
                </div>
              </div>
              
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-600 mb-4">
                  {fund.category}
                </span>
                <p className="text-gray-600 h-12">{fund.objective}</p>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Aporte Inicial</span>
                  <span className="font-semibold text-[#201D1A]">USD {fund.minimumInitial}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Permanencia Sugerida</span>
                  <span className="font-semibold text-[#201D1A]">{fund.minimumPermanence}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-500">Rendimiento Proyectado</span>
                  <span className="font-bold text-[#1D9E84]">{fund.projectedReturn}</span>
                </div>
              </div>
              
              <Link
                to={`/funds/${fund.id}`}
                className={`w-full py-3 px-4 rounded-xl text-center font-bold transition-colors flex items-center justify-center border ${
                  fund.id === 'mi-retiro' 
                    ? 'bg-[#FCC710] text-[#201D1A] hover:bg-[#EAB900] border-transparent' 
                    : 'bg-white text-[#201D1A] hover:bg-gray-50 border-[#201D1A]/20'
                }`}
              >
                Ver detalle
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
