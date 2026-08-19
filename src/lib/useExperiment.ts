import { useState, useEffect } from 'react';
import { getExperimentVariant } from './amplitude';
import { Experiment } from '@amplitude/experiment-js-client';

// Since the default SDK doesn't easily expose an event emitter that React can hook into without the provider,
// we'll simulate reactivity by just reading it once amplitude is initialized, and providing a small helper.

export const useExperiment = (flagKey: string, fallback: string = 'control') => {
  const [variant, setVariant] = useState(getExperimentVariant(flagKey, fallback));

  useEffect(() => {
    // Attempt to get it periodically or just rely on the first fetch that happened during init/identify
    const interval = setInterval(() => {
      const v = getExperimentVariant(flagKey, fallback);
      if (v !== variant) {
        setVariant(v);
      }
    }, 1000); // Check every second for changes if the flag is updated late

    return () => clearInterval(interval);
  }, [flagKey, fallback, variant]);

  return variant;
};
