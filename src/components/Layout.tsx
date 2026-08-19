import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../lib/useUser';
import { cn } from '../lib/utils';
import { Menu, X } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, clearUser } = useUser();
  const location = useLocation();

  const navLinks = [
    { name: 'Mi Retiro', path: '/funds/mi-retiro' },
    { name: 'Nuestros Fondos', path: '/funds' },
    { name: 'Simulador', path: '/simulator?fund=mi-retiro' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] font-sans text-gray-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#FCC710] flex items-center justify-center">
                  <span className="text-[#201D1A] font-bold text-xl leading-none tracking-tighter">F</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-[#201D1A]">
                  FIDUCIA <span className="font-light text-gray-400">|</span> MI FONDO
                </span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8 items-center">
              {(!user || user.status === 'prospect') && (
                <Link
                  to="/register"
                  className="text-sm font-medium transition-colors text-gray-600 hover:text-[#FCC710]"
                >
                  Abrir mi cuenta
                </Link>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-[#FCC710]",
                    location.pathname === link.path.split('?')[0] ? "text-[#FCC710]" : "text-gray-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              
              {user && user.status !== 'prospect' ? (
                <Link
                  to="/dashboard"
                  className="text-sm font-bold text-[#201D1A] bg-[#FCC710] px-5 py-2.5 rounded-full hover:bg-[#EAB900] transition-colors"
                >
                  Mi Panel
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#201D1A] border border-[#201D1A] px-5 py-2 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Ingresar
                </Link>
              )}
            </nav>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-gray-100"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-[#FCC710] hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {(!user || user.status === 'prospect') && (
                <Link
                  to="/register"
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-[#FCC710] hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Abrir mi cuenta
                </Link>
              )}
              
              <div className="pt-4 pb-2 border-t border-gray-100 space-y-3">
                {user && user.status !== 'prospect' ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="block w-full text-center px-4 py-3 rounded-md text-base font-bold text-[#201D1A] bg-[#FCC710]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mi Panel
                    </Link>
                    <button
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await clearUser();
                      }}
                      className="block w-full text-center px-4 py-3 rounded-md text-base font-medium text-gray-600 border border-gray-300"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-3 rounded-md text-base font-medium text-[#201D1A] border border-[#201D1A]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Ingresar
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </header>

      <main className="flex-1 flex flex-col relative z-0">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-[#FCC710] flex items-center justify-center">
                  <span className="text-[#201D1A] font-bold text-xs leading-none tracking-tighter">F</span>
                </div>
                <span className="font-bold text-lg tracking-tight text-[#201D1A]">
                  FIDUCIA
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Administradora de Fondos y Fideicomisos. Transformando el futuro financiero del Ecuador.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Productos</h3>
              <ul className="space-y-3">
                <li><Link to="/funds/mi-retiro" className="text-sm text-gray-600 hover:text-[#FCC710]">Fondo Mi Retiro</Link></li>
                <li><Link to="/funds" className="text-sm text-gray-600 hover:text-[#FCC710]">Catálogo de Fondos</Link></li>
                <li><Link to="/simulator" className="text-sm text-gray-600 hover:text-[#FCC710]">Simulador de Inversión</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-gray-600 hover:text-[#FCC710]">Términos y Condiciones</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-[#FCC710]">Políticas de Privacidad</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-[#FCC710]">Tarifario</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Demo Amplitude</h3>
              <p className="text-xs text-gray-500 mb-2">
                Esta es una aplicación de demostración. No realiza transacciones reales.
              </p>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FCC710]/20 text-[#201D1A]">
                Tracking Activo
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2026 Fiducia S.A. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
