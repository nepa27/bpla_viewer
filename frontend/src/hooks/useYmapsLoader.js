import { useEffect, useState } from 'react';

import { loadYmapsScript } from '../utils/loadYmaps';

export const useYmapsLoader = () => {
  const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
  const [ymapsLoading, setYmapsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setYmapsLoading(true);
    loadYmapsScript()
      .then(() => {
        if (isMounted) {
          setErrorLoadYmaps(false);
        }
      })
      .catch((error) => {
        console.error('Ошибка загрузки Yandex Maps API:', error);
        if (isMounted) {
          setErrorLoadYmaps(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setYmapsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    errorLoadYmaps,
    ymapsLoading,
    setErrorLoadYmaps,
  };
};
