import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { trackEvent } from '../lib/amplitude';
import { ArrowRight, TrendingUp, ShieldCheck, Clock, PiggyBank, Smartphone } from 'lucide-react';
import { MOCK_FUNDS } from '../types';

export default function Home() {
  useEffect(() => {
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FCC710]/10 to-[#F9F9F8] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-extrabold text-[#201D1A] tracking-tight leading-tight mb-6"
            >
              Tu futuro,<br />
              <span className="text-[#EF942F]">lo más importante</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              La app para cumplir tus metas financieras. Invierte en los mejores fondos mutuos del Ecuador de forma simple, segura y 100% digital.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-[#FCC710] text-[#201D1A] rounded-full font-bold text-lg hover:bg-[#EAB900] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center group"
              >
                Abrir mi cuenta
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/funds/mi-retiro" 
                className="w-full sm:w-auto px-8 py-4 bg-white text-[#201D1A] border border-[#201D1A]/20 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center"
              >
                Conocer Mi Retiro
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#201D1A] mb-4">¿Por qué invertir con nosotros?</h2>
            <p className="text-lg text-gray-600">Diseñamos una experiencia de inversión pensando en ti.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: PiggyBank, title: "Desde USD 25", desc: "No necesitas grandes capitales para empezar a construir tu futuro." },
              { icon: TrendingUp, title: "Aportes recurrentes", desc: "Automatiza tu inversión y alcanza tus metas financieras sin pensarlo." },
              { icon: ShieldCheck, title: "Seguridad y respaldo", desc: "Tu dinero administrado por expertos con más de 25 años en el mercado." },
              { icon: Smartphone, title: "100% Digital", desc: "Abre tu cuenta, invierte y consulta tus saldos desde tu celular." },
              { icon: Clock, title: "Libertad de retiros", desc: "Fondos con diferentes plazos de permanencia para cada necesidad." },
              { icon: ArrowRight, title: "Definición de metas", desc: "Proyecta y visualiza el crecimiento de tu patrimonio a través del tiempo." }
            ].map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-start p-6 rounded-2xl bg-white border border-[#201D1A]/10 hover:border-[#FCC710] transition-colors"
              >
                <div className="w-12 h-12 rounded bg-[#FCC710]/20 flex items-center justify-center text-[#201D1A] mb-6">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#201D1A] mb-2">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Banner Premium Section */}
      <section className="py-24 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#201D1A] mb-4">Dos formas de empezar a construir tu futuro</h2>
            <p className="text-lg text-gray-600">Elige el camino que mejor se adapte a lo que quieres hacer hoy.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Journey 1 Banner */}
            <Link to="/register" className="group block relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#201D1A] to-[#3a3530] text-white p-10 lg:p-14 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:translate-x-4 group-hover:-translate-y-4">
                <ShieldCheck className="w-64 h-64 text-[#FCC710]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <span className="inline-block text-xs font-bold tracking-widest text-[#FCC710] uppercase mb-4">Empieza aquí</span>
                  <h3 className="text-3xl sm:text-4xl font-semibold mb-6 pr-8">Abre tu cuenta y empieza a invertir</h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-12 max-w-md">
                    Crea tu perfil, verifica tu identidad y deja lista tu cuenta para comenzar a construir tus metas financieras.
                  </p>
                </div>
                <div className="inline-flex items-center text-[#FCC710] font-medium text-lg">
                  Abrir mi cuenta 
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                </div>
              </div>
            </Link>

            {/* Journey 2 Banner */}
            <Link to="/funds/mi-retiro" className="group block relative overflow-hidden rounded-[32px] bg-white text-[#201D1A] p-10 lg:p-14 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[#201D1A]/10">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-500 group-hover:translate-x-4 group-hover:-translate-y-4">
                <div className="w-64 h-64 rounded border-[16px] border-[#EF942F] absolute -top-8 -right-8" />
                <div className="w-48 h-48 rounded border-[12px] border-[#FCC710] absolute top-0 right-0" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <span className="inline-block text-xs font-bold tracking-widest text-[#EF942F] uppercase mb-4">Planifica tu futuro</span>
                  <h3 className="text-3xl sm:text-4xl font-semibold mb-6 pr-8">Descubre cuánto puedes construir con Mi Retiro</h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-12 max-w-md">
                    Conoce el fondo, simula tus aportes y descubre cómo tu inversión puede evolucionar a través del tiempo.
                  </p>
                </div>
                <div className="inline-flex items-center text-[#EF942F] font-bold text-lg">
                  Explorar Mi Retiro 
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Fund */}
      <section className="py-24 bg-[#201D1A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#FCC710]/20 text-[#FCC710] font-bold text-sm mb-6 border border-[#FCC710]/30">
                Fondo Destacado
              </div>
              <h2 className="text-4xl font-bold mb-6">Fondo Mi Retiro</h2>
              <p className="text-xl text-gray-300 mb-8 max-w-lg leading-relaxed">
                Planifica tu futuro y el de tu familia. Invierte a largo plazo con nuestro fondo diseñado específicamente para la jubilación.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Aporte inicial desde USD 25",
                  "Rendimiento anual proyectado: 5.50% - 6.50%",
                  "Permanencia mínima de 2 años"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-200">
                    <div className="w-6 h-6 rounded bg-[#FCC710]/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#FCC710]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link 
                to="/funds/mi-retiro"
                className="inline-flex items-center px-6 py-3 bg-[#FCC710] text-[#201D1A] rounded-full font-bold hover:bg-[#EAB900] transition-colors"
              >
                Conocer más sobre Mi Retiro
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            
            <div className="flex-1 w-full relative">
              {/* Visual abstraction of growth */}
              <div className="aspect-square max-w-md mx-auto rounded border border-gray-800 relative p-8">
                <div className="absolute inset-0 rounded border border-gray-700/50 m-12" />
                <div className="absolute inset-0 rounded border border-gray-600/30 m-24" />
                <div className="w-full h-full rounded bg-gradient-to-tr from-[#FCC710] to-[#EF942F] opacity-20 blur-3xl animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-5xl font-light text-white mb-2">6.50%</span>
                  <span className="text-[#FCC710] uppercase tracking-widest text-xs font-bold">Tasa Proyectada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Funds */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-[#201D1A] mb-3">Nuestros fondos</h2>
              <p className="text-gray-600">Opciones para cada perfil y horizonte de inversión.</p>
            </div>
            <Link to="/funds" className="hidden sm:flex text-[#EF942F] font-bold hover:text-[#d78225] items-center">
              Ver todos <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_FUNDS.slice(1, 4).map((fund) => (
              <motion.div
                key={fund.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${fund.color}`} />
                    <h3 className="font-bold text-xl text-[#201D1A]">{fund.name}</h3>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{fund.category}</span>
                </div>
                
                <p className="text-gray-600 mb-8 flex-1">{fund.objective}</p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Aporte inicial</span>
                    <span className="font-semibold text-[#201D1A]">USD {fund.minimumInitial}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Proyección</span>
                    <span className="font-semibold text-[#201D1A]">{fund.projectedReturn}</span>
                  </div>
                </div>
                
                <Link
                  to={`/funds/${fund.id}`}
                  className="w-full py-3 px-4 rounded-xl text-center text-sm font-bold text-[#201D1A] bg-[#FCC710]/10 hover:bg-[#FCC710]/20 transition-colors"
                >
                  Ver detalle
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 sm:hidden text-center">
            <Link to="/funds" className="inline-flex text-[#EF942F] font-bold hover:text-[#d78225] items-center">
              Ver todos <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
