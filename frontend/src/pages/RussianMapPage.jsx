/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';

import FlightStatistics from '../components/FlightStatistics';
import { useData } from '../hooks/useData';
import { useFlightData } from '../hooks/useFlightData';
import { useRegions } from '../hooks/useRegions';
import MapComponent from '../modules/MapComponent';
import { loadYmapsScript } from '../utils/loadYmaps';

const RussianMapPage = () => {
  const flightData = useData();
  const regionsPolygons = useRegions();
  const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
  const [ymapsLoading, setYmapsLoading] = useState(true);
  const { filteredFlights, dailyFlights, setDateRange } = useFlightData(flightData);
  // const [selectedRegion, setSelectedRegion] = useState(null);

  // const handleRegionSelect = useCallback((region) => {
  //   setSelectedRegion(region);
  // }, []);

  // const handleResetRegion = useCallback(() => {
  //   setSelectedRegion(null);
  // }, []);

  useEffect(() => {
    setYmapsLoading(true);
    loadYmapsScript()
      .then(() => {
        // console.log('Yandex Maps API успешно загружен');
        setErrorLoadYmaps(false);
      })
      .catch((error) => {
        console.error('Ошибка загрузки Yandex Maps API:', error);
        setErrorLoadYmaps(true);
      })
      .finally(() => {
        setYmapsLoading(false);
      });
  }, []);

  // Показываем загрузку пока данные или Yandex Maps загружаются
  if (ymapsLoading || !flightData || !regionsPolygons) {
    return (
      <div className="main">
        <h1>Карта России</h1>
        <div
          style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Загрузка данных...
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <h1>Карта России</h1>
      <MapComponent
        regionsData={regionsPolygons}
        points={filteredFlights}
        errorLoadYmaps={errorLoadYmaps}
      />
      <FlightStatistics dailyFlights={dailyFlights} onDateRangeChange={setDateRange} />
    </div>
  );
};

export default RussianMapPage;
