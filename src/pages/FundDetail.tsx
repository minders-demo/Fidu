import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackEvent } from '../lib/amplitude';
import { useExperiment } from '../lib/useExperiment';
import { MOCK_FUNDS } from '../types';
import { ArrowLeft, Target, ShieldCheck, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function FundDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fund = MOCK_FUNDS.find(f => f.id === id);
  
  // Example Experiment Flag usage
  const ctaVariant = useExperiment('mi_retiro_cta_variant', 'control');
  const ctaText = ctaVariant === 'treatment' ? 'Invierte desde USD 25 hoy' : 'Empieza tu plan de retiro';

  const hasTracked = React.useRef(false);
  useEffect(() => {
    if (fund && !hasTracked.current) {
      hasTracked.current = true;
      trackEvent('Fund Details Viewed', {
        fund_id: fund.id,
        fund_name: fund.name,
        fund_category: fund.category,
        minimum_contribution: fund.minimumInitial
      });
    }
  }, [fund]);

  if (!fund) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Fondo no encontrado</h2>
        <button onClick={() => navigate('/funds')} className="text-[#EF942F] hover:underline">
          Volver al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      {/* Banner */}
      <div className={`pt-16 pb-24 ${fund.id === 'mi-retiro' ? 'bg-[#201D1A] text-white' : 'bg-[#F9F9F8] text-[#201D1A]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/funds" className={`inline-flex items-center text-sm mb-8 font-bold hover:underline ${fund.id === 'mi-retiro' ? 'text-[#FCC710]' : 'text-[#EF942F]'}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Catálogo de Fondos
          </Link>
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-2xl ${fund.color} shadow-lg`} />
              <h1 className="text-5xl font-extrabold tracking-tight">{fund.name}</h1>
            </div>
            <p className={`text-2xl leading-relaxed ${fund.id === 'mi-retiro' ? 'text-gray-300' : 'text-gray-600'}`}>
              {fund.objective}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Details */}
          <div className="lg:col-span-2 space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-[#201D1A] mb-8">Características del Fondo</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-[#FCC710]/20 flex items-center justify-center flex-shrink-0 text-[#201D1A]">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Aporte Mínimo Inicial</p>
                    <p className="text-xl font-bold text-[#201D1A]">USD {fund.minimumInitial}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-[#FCC710]/20 flex items-center justify-center flex-shrink-0 text-[#201D1A]">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Rendimiento Proyectado</p>
                    <p className="text-xl font-bold text-[#1D9E84]">{fund.projectedReturn}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-[#FCC710]/20 flex items-center justify-center flex-shrink-0 text-[#201D1A]">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Permanencia Sugerida</p>
                    <p className="text-xl font-bold text-[#201D1A]">{fund.minimumPermanence}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-[#FCC710]/20 flex items-center justify-center flex-shrink-0 text-[#201D1A]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Incrementos</p>
                    <p className="text-xl font-bold text-[#201D1A]">Desde USD {fund.minimumIncrement}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {fund.id === 'mi-retiro' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-[#201D1A]">¿Para quién es este fondo?</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Diseñado para personas que piensan en el largo plazo y desean construir un patrimonio sólido para su jubilación. Al invertir regularmente, aprovechas el poder del interés compuesto, permitiendo que tu dinero trabaje para ti a lo largo de los años.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <p className="text-yellow-800 text-sm leading-relaxed">
                    Recuerda que las inversiones a largo plazo requieren disciplina. Recomendamos activar el aporte recurrente para maximizar el crecimiento de tu capital.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col">
              <h3 className="text-xl font-bold text-[#201D1A] mb-6">Toma el control de tu futuro</h3>
              
              <Link
                to={`/simulator?fund=${fund.id}`}
                className="w-full py-4 px-4 rounded-xl text-center font-bold text-[#201D1A] bg-white hover:bg-gray-50 transition-colors mb-4 border border-[#201D1A]/20"
              >
                Simular Inversión
              </Link>
              
              <Link
                to={`/invest/apply?fund=${fund.id}`}
                className="w-full py-4 px-4 rounded-xl text-center font-bold text-[#201D1A] bg-[#FCC710] hover:bg-[#EAB900] transition-all shadow-md hover:shadow-lg"
              >
                {ctaText}
              </Link>
              
              <p className="text-xs text-center text-gray-400 mt-6">
                Sujeto a los términos del reglamento del fondo. La rentabilidad no es garantizada.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
