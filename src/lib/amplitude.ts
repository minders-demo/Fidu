import * as amplitude from '@amplitude/analytics-browser';
import { sessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';
import { Experiment } from '@amplitude/experiment-js-client';

const API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY || '9a725e9bee6250c7744b779984753f46';
const SERVER_ZONE = import.meta.env.VITE_AMPLITUDE_SERVER_ZONE || 'US';
const EXPERIMENT_DEPLOYMENT_KEY = import.meta.env.VITE_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY;

let experimentClient: ReturnType<typeof Experiment.initializeWithAmplitudeAnalytics> | null = null;

const getUrlParam = (param: string): string | null => {
  if (typeof window === 'undefined') return null;

  const searchParams = new URLSearchParams(window.location.search);
  const searchValue = searchParams.get(param);
  if (searchValue) return searchValue;

  const hash = window.location.hash;
  const hashQueryIndex = hash.indexOf('?');
  if (hashQueryIndex >= 0) {
    const hashParams = new URLSearchParams(hash.substring(hashQueryIndex + 1));
    const hashValue = hashParams.get(param);
    if (hashValue) return hashValue;
  }

  return null;
};

export const initAmplitude = async () => {
  if (typeof window === 'undefined') return;

  const sessionReplay = sessionReplayPlugin({
    sampleRate: 1.0,
    privacyConfig: {
      blockSelector: [
        '.sensitive-data',
        'input[type="password"]',
        'input[name="idDocument"]',
        'input[name="accountNumber"]',
        'input[name="email"]',
        'input[type="email"]'
      ],
      maskSelector: [
        '.sensitive-data',
        'input[type="password"]',
        'input[name="idDocument"]',
        'input[name="accountNumber"]',
        'input[name="email"]',
        'input[type="email"]'
      ],
    }
  });

  amplitude.add(sessionReplay);

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

  if (EXPERIMENT_DEPLOYMENT_KEY) {
    experimentClient = Experiment.initializeWithAmplitudeAnalytics(EXPERIMENT_DEPLOYMENT_KEY, {
      debug: true,
    });

    try {
      await experimentClient.fetch();
    } catch (error) {
      console.error('Amplitude Experiment fetch failed', error);
    }
  }
};

export const trackEvent = async (
  eventName: string,
  eventProperties?: Record<string, any>
) => {
  if (typeof window === 'undefined') return;

  console.log(`[Amplitude Track] ${eventName}`, eventProperties);

  try {
    return await amplitude.track(eventName, eventProperties).promise;
  } catch (error) {
    console.error(`Amplitude track failed: ${eventName}`, error);
  }
};

export const identifyUser = async (
  userId: string | null,
  userProperties?: Record<string, any>
) => {
  if (typeof window === 'undefined') return;

  if (userId) {
    amplitude.setUserId(userId);
  }

  if (userProperties) {
    const identify = new amplitude.Identify();
    let hasOperations = false;

    Object.entries(userProperties).forEach(([key, value]) => {
      if (value === undefined) return;

      if (value === null) {
        identify.unset(key);
      } else {
        identify.set(key, value as any);
      }

      hasOperations = true;
    });

    if (hasOperations) {
      try {
        await amplitude.identify(identify).promise;
      } catch (error) {
        console.error('Amplitude identify failed', error);
      }
    }
  }

  if (experimentClient) {
    try {
      await experimentClient.fetch();
    } catch (error) {
      console.error('Amplitude Experiment fetch failed after identify', error);
    }
  }
};

export const resetAmplitude = () => {
  if (typeof window === 'undefined') return;

  if (experimentClient) {
    experimentClient.clear();
  }

  amplitude.reset();

  if (experimentClient) {
    experimentClient.fetch().catch(console.error);
  }
};

export const getExperimentVariant = (
  flagKey: string,
  fallback: string = 'control'
): string => {
  if (!experimentClient) return fallback;
  const variant = experimentClient.variant(flagKey);
  return variant.value || fallback;
};

/**
 * Captura únicamente las UTMs definidas en el tracking plan de Fiducia.
 * Persiste los últimos valores conocidos para conservar la atribución durante
 * el journey interno de la SPA.
 */
export const captureUTMs = () => {
  if (typeof window === 'undefined') {
    return {
      utm_source: 'direct',
      utm_medium: 'none',
      utm_campaign: 'none',
    };
  }

  const defaults: Record<string, string> = {
    utm_source: 'direct',
    utm_medium: 'none',
    utm_campaign: 'none',
  };

  const utms: Record<string, string> = {};

  ['utm_source', 'utm_medium', 'utm_campaign'].forEach((param) => {
    const value = getUrlParam(param);

    if (value) {
      utms[param] = value;
      localStorage.setItem(`fiducia_${param}`, value);
      return;
    }

    const stored = localStorage.getItem(`fiducia_${param}`);
    utms[param] = stored || defaults[param];
  });

  return utms;
};
