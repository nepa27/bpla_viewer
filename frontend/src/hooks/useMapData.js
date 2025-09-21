// hooks/useMapData.js
import { useEffect, useState } from 'react';

export const useMapData = (geoData) => {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (geoData) {
      setMapData(geoData);
      setLoading(false);
    }
  }, [geoData]);

  return { mapData, loading };
};
