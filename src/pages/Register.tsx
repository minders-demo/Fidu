import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent, captureUTMs } from '../lib/amplitude';
import { useUser } from '../lib/useUser';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { checkEmailExists, createIdentity } from '../lib/identity';
import { Check, ChevronRight, User, Shield, CreditCard, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Datos Personales', icon: User },
  { id: 2, title: 'Verificación de Identidad', icon: Shield },
  { id: 3, title: 'Cuenta Bancaria', icon: CreditCard }
];

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveUser } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    idNumber: '',
    bank: '',
    accountNumber: ''
  });

  const hasTracked = React.useRef(false);
  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      const utms = captureUTMs();
      trackEvent('Account Registration Started', {
        entry_point: location.search.includes('simulated') ? 'simulator' : 'direct',
        ...utms
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      setLoading(true);

      let emailExists = false;
      try {
        emailExists = await checkEmailExists(formData.email);
      } catch (error) {
        // En una SPA pública, Firestore puede bloquear la consulta previa
        // según sus reglas. No detenemos el onboarding: Firebase Auth hará
        // una segunda validación definitiva al crear la cuenta.
        console.warn('No fue posible hacer la validación previa del correo', error);
      } finally {
        setLoading(false);
      }
      
      if (emailExists) {
        await trackEvent('Onboarding Error Encountered', {
          step_name: "Datos Personales",
          error_type: "existing_account",
          error_code: "ERR_EMAIL_ALREADY_REGISTERED",
          is_recoverable: true
        });
        alert('Ya tienes una cuenta con este correo. Ingresa para continuar.');
        navigate(`/login${location.search}`, {
          state: { email: formData.email.trim().toLowerCase() }
        });
        return;
      }

      await trackEvent('Personal Information Submitted', {
        step_number: 1,
        completion_time_seconds: Math.floor((Date.now() - startTime) / 1000),
        validation_status: 'success'
      });
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setLoading(true);
      setTimeout(() => {
        trackEvent('Identity Verification Completed', {
          verification_method: 'automated_mock',
          attempt_count: 1,
          verification_status: 'success'
        });
        setLoading(false);
        setCurrentStep(3);
      }, 1500);
    } else if (currentStep === 3) {
      setLoading(true);
      
      if (formData.email.includes('error')) {
        setLoading(false);
        trackEvent('Onboarding Error Encountered', {
          error_type: 'validation_error',
          error_code: 'ERR_INVALID_EMAIL',
          step_name: 'Cuenta Bancaria',
          is_recoverable: true
        });
        alert('Error de validación. Por favor intenta nuevamente.');
        return;
      }

      try {
        let assignedUserId: string;

        if (auth) {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.email.trim().toLowerCase(),
            formData.password
          );
          assignedUserId = await createIdentity(
            formData.email,
            userCredential.user.uid
          );
        } else {
          // Fallback local únicamente para demo sin Firebase.
          assignedUserId = await createIdentity(
            formData.email,
            `local_uid_${Date.now()}`
          );
        }

        await trackEvent('Bank Account Connected', {
          connection_method: 'manual',
          connection_status: 'success'
        });

        // Guardar + identificar ANTES de Account Registration Completed.
        // Así ese evento ya viaja con el FID estable y con las user properties
        // de registro completado.
        await saveUser({
          userId: assignedUserId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          status: 'registered_no_investment',
          accountCreatedAt: new Date().toISOString(),
          investorProfile: 'unknown',
          totalInvested: 0,
          activeFunds: [],
          recurringContributionEnabled: false,
          recurringAmount: null,
          lastInvestmentDate: null,
          customerTenureDays: 0,
          hasEverInvested: false,
          daysSinceLastInvestment: null
        });

        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');

        let targetUrl = '/dashboard';
        let entryPoint = 'direct';

        if (redirect) {
          targetUrl = `/${redirect}`;

          if (redirect.includes('fund=')) entryPoint = 'fund_detail';
          if (redirect.includes('simulated=true')) entryPoint = 'simulator';
        }

        await trackEvent('Account Registration Completed', {
          onboarding_duration_seconds: Math.floor((Date.now() - startTime) / 1000),
          entry_point: entryPoint,
          acquisition_source: localStorage.getItem('fiducia_utm_source') || 'direct'
        });

        setLoading(false);
        navigate(targetUrl);
      } catch (error: any) {
        setLoading(false);
        console.error(error);

        if (error?.code === 'auth/email-already-in-use') {
          await trackEvent('Onboarding Error Encountered', {
            step_name: 'Datos Personales',
            error_type: 'existing_account',
            error_code: 'ERR_EMAIL_ALREADY_REGISTERED',
            is_recoverable: true
          });

          alert('Ya tienes una cuenta con este correo. Ingresa para continuar.');
          navigate(`/login${location.search}`, {
            state: { email: formData.email.trim().toLowerCase() }
          });
          return;
        }

        await trackEvent('Onboarding Error Encountered', {
          step_name: 'Cuenta Bancaria',
          error_type: 'account_creation_error',
          error_code: error?.code || 'ERR_ACCOUNT_CREATION',
          is_recoverable: true
        });

        alert('Error al crear cuenta: ' + error.message);
      }
    }
  };

  return (
    <div className="flex-1 bg-[#F9FAFB] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#FCC710] rounded-full z-0 transition-all duration-500 ease-in-out" 
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
            
            {STEPS.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${
                    isCompleted 
                      ? 'bg-[#FCC710] border-white text-[#201D1A] shadow-md' 
                      : isCurrent 
                        ? 'bg-white border-[#FCC710] text-[#FCC710] shadow-md' 
                        : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <span className={`mt-3 text-xs font-semibold uppercase tracking-wider ${
                    isCurrent || isCompleted ? 'text-[#201D1A]' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 min-h-[400px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#201D1A] mb-2">Cuéntanos sobre ti</h2>
                  <p className="text-gray-600">Necesitamos algunos datos básicos para crear tu cuenta.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FCC710] focus:ring-[#FCC710] py-3 px-4 bg-gray-50 border"
                      placeholder="Ej. Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FCC710] focus:ring-[#FCC710] py-3 px-4 bg-gray-50 border"
                      placeholder="Ej. Pérez"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FCC710] focus:ring-[#FCC710] py-3 px-4 bg-gray-50 border"
                      placeholder="juan.perez@ejemplo.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FCC710] focus:ring-[#FCC710] py-3 px-4 bg-gray-50 border"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>
                
                <div className="pt-6">
                  <button 
                    onClick={handleNext}
                    disabled={!formData.firstName || !formData.lastName || !formData.email || formData.password.length < 6 || loading}
                    className="w-full py-4 px-6 rounded-xl text-center font-bold text-[#201D1A] bg-[#FCC710] hover:bg-[#EAB900] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continuar <ChevronRight className="ml-2 w-5 h-5" /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#201D1A] mb-2">Verifica tu identidad</h2>
                  <p className="text-gray-600">Por ley, requerimos validar tu identidad para invertir.</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cédula de Identidad</label>
                    <input 
                      type="text" 
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FCC710] focus:ring-[#FCC710] py-3 px-4 bg-gray-50 border"
                      placeholder="1700000000"
                    />
                  </div>
                  
                  <div className="bg-[#FCC710]/10 border border-[#FCC710]/20 rounded-2xl p-6 flex items-start gap-4">
                    <Shield className="w-6 h-6 text-[#EF942F] flex-shrink-0 mt-1" />
                    <p className="text-sm text-[#201D1A] leading-relaxed">
                      En un ambiente real, aquí solicitaríamos fotos de tu documento de identidad y una prueba biométrica (selfie) utilizando un proveedor seguro.
                    </p>
                  </div>
                </div>
                
                <div className="pt-6">
                  <button 
                    onClick={handleNext}
                    disabled={!formData.idNumber || loading}
                    className="w-full py-4 px-6 rounded-xl text-center font-bold text-[#201D1A] bg-[#FCC710] hover:bg-[#EAB900] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Validar Identidad <ChevronRight className="ml-2 w-5 h-5" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-[#201D1A] mb-2">Cuenta para retiros</h2>
                  <p className="text-gray-600">Vincula la cuenta bancaria donde recibiremos tus aportes y enviaremos tus retiros.</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Banco</label>
                    <select 
                      name="bank"
                      value={formData.bank}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FCC710] focus:ring-[#FCC710] py-3 px-4 bg-gray-50 border"
                    >
                      <option value="">Selecciona un banco</option>
                      <option value="pichincha">Banco Pichincha</option>
                      <option value="pacifico">Banco del Pacífico</option>
                      <option value="guayaquil">Banco Guayaquil</option>
                      <option value="produbanco">Produbanco</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de Cuenta</label>
                    <input 
                      type="text" 
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#FCC710] focus:ring-[#FCC710] py-3 px-4 bg-gray-50 border"
                      placeholder="Ingresa tu número de cuenta"
                    />
                  </div>
                </div>
                
                <div className="pt-6">
                  <button 
                    onClick={handleNext}
                    disabled={!formData.bank || !formData.accountNumber || loading}
                    className="w-full py-4 px-6 rounded-xl text-center font-bold text-[#201D1A] bg-[#FCC710] hover:bg-[#EAB900] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Finalizar Registro e Iniciar Sesión <Check className="ml-2 w-5 h-5" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
