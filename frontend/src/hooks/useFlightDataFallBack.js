import { useMemo } from 'react';

export const useFlightDataFallBack = (flightsData) => {
  return useMemo(() => {
    if (!flightsData?.length) {
      return new Map();
    }

    const regionCounts = new Map();
    for (const flight of flightsData) {
      const region = flight.region || 'Не определен';
      regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
    }

    return regionCounts;
  }, [flightsData]);
};
