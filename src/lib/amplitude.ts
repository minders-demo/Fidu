import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';
import { Experiment } from '@amplitude/experiment-js-client';

const API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY || '9a725e9bee6250c7744b779984753f46';
const SERVER_ZONE = import.meta.env.VITE_AMPLITUDE_SERVER_ZONE || 'US';
const EXPERIMENT_DEPLOYMENT_KEY = import.meta.env.VITE_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY;

let experimentClient: ReturnType<typeof Experiment.initializeWithAmplitudeAnalytics> | null = null;
let experimentReady = false;

export const initAmplitude = async () => {
  if (typeof window === 'undefined') return;

  // Session Replay Setup
  const sessionReplay = sessionReplayPlugin({
    sampleRate: 1.0,
    privacyConfig: {
      blockSelector: ['.sensitive-data', 'input[type="password"]', 'input[name="idDocument"]', 'input[name="accountNumber"]', 'input[name="email"]', 'input[type="email"]'],
      maskSelector: ['.sensitive-data', 'input[type="password"]', 'input[name="idDocument"]', 'input[name="accountNumber"]', 'input[name="email"]', 'input[type="email"]'],
    }
  });
  amplitude.add(sessionReplay);

  // Initialize Analytics with Autocapture
  amplitude.init(API_KEY, undefined, {
    serverZone: SERVER_ZONE as any,
    autocapture: {
      attribution: true,
      pageViews: true,
      sessions: true,
      formInteractions: true,
      fileDownloads: true,
      elementInteractions: true,
      pageUrlEnrichment: true,
      webVitals: true,
    },
  });

  // Initialize Experiment if key exists using the official integration
  if (EXPERIMENT_DEPLOYMENT_KEY) {
    experimentClient = Experiment.initializeWithAmplitudeAnalytics(EXPERIMENT_DEPLOYMENT_KEY, {
      debug: true,
    });
    // Attempt to fetch variations for the current user
    try {
      await experimentClient.fetch();
      experimentReady = true;
    } catch (e) {
      console.error('Amplitude Experiment fetch failed', e);
    }
  }
};

export const trackEvent = (eventName: string, eventProperties?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  console.log(`[Amplitude Track] ${eventName}`, eventProperties);
  amplitude.track(eventName, eventProperties);
};

export const identifyUser = async (userId: string | null, userProperties?: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  if (userId) {
    amplitude.setUserId(userId);
  }
  
  if (userProperties) {
    const identify = new amplitude.Identify();
    Object.entries(userProperties).forEach(([key, value]) => {
      identify.set(key, value as any);
    });
    amplitude.identify(identify);
  }

  if (experimentClient) {
    try {
      await experimentClient.fetch();
    } catch (e) {
      console.error('Amplitude Experiment fetch failed after identify', e);
    }
  }
};

export const resetAmplitude = () => {
  if (typeof window === 'undefined') return;
  
  if (experimentClient) {
    // 1. Limpiar variantes cacheadas de Experiment
    experimentClient.clear();
  }
  
  // 2. Limpiar identidad de Analytics (Genera nuevo device_id/estado anónimo)
  amplitude.reset();
  
  // 3. (Opcional) Reevaluar variantes anónimas para el nuevo usuario anónimo
  if (experimentClient) {
    experimentClient.fetch().catch(console.error);
  }
};

export const getExperimentVariant = (flagKey: string, fallback: string = 'control'): string => {
  if (!experimentClient) return fallback;
  const variant = experimentClient.variant(flagKey);
  return variant.value || fallback;
};

// URL UTM tracking helper
export const captureUTMs = () => {
  if (typeof window === 'undefined') return;
  const urlParams = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((param) => {
    const value = urlParams.get(param);
    if (value) {
      utms[param] = value;
      localStorage.setItem(`fiducia_${param}`, value);
    } else {
      const stored = localStorage.getItem(`fiducia_${param}`);
      if (stored) utms[param] = stored;
    }
  });
  
  return utms;
};
