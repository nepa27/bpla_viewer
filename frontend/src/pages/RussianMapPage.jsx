import React, { useState, useEffect, useCallback } from 'react';
import MapComponent from '../modules/MapComponent';
import { loadYmapsScript } from '../utils/loadYmaps'; 
import { useData } from '../hooks/useData'; 
import { useRegions } from '../hooks/useRegions';
import { useFlightData } from '../hooks/useFlightData';
import FlightStatistics from '../components/FlightStatistics';

const RussianMapPage = () => {
  const flightData = useData();
  const regionsPolygons = useRegions();
  const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
  const [ymapsLoading, setYmapsLoading] = useState(true);
  const { filteredFlights, dailyFlights, setDateRange } = useFlightData(flightData);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const handleRegionSelect = useCallback((region) => {
    setSelectedRegion(region);
  }, []);

  const handleResetRegion = useCallback(() => {
    setSelectedRegion(null);
  }, []);

  useEffect(() => {
    setYmapsLoading(true);
    loadYmapsScript()
      .then(() => {
        console.log('Yandex Maps API успешно загружен');
        setErrorLoadYmaps(false);
      })
      .catch(error => {
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
      <div className='main'>
        <h1>Карта России</h1>
        <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Загрузка данных...
        </div>
      </div>
    );
  }

  return (
    <div className='main'>
      <h1>Карта России</h1>
      <MapComponent 
        regionsData={regionsPolygons}  
        points={filteredFlights} 
        errorLoadYmaps={errorLoadYmaps}
      />
      <FlightStatistics
        dailyFlights={dailyFlights}
        onDateRangeChange={setDateRange}
      />
    </div>
  );
};

export default RussianMapPage;


// import React, { useState, useEffect } from 'react';
// import MapComponent from '../modules/MapComponent';
// import ChartComponent from '../components/ChartComponent';
// import { loadYmapsScript } from '../utils/loadYmaps'; 
// import { useData } from '../hooks/useData'; 
// import { useRegions } from '../hooks/useRegions';
// import { useFlightData } from '../hooks/useFlightData';

// const RussianMapPage = () => {
//   const flightData = useData()
//   const regionsPoligons = useRegions()
//   const [filteredPoints, setFilteredPoints] = useState(flightData);
  
//   const { filteredFlights, dailyFlights, setDateRange } = useFlightData(flightData);

//   const handleRegionSelect = useCallback((region) => {
//     setSelectedRegion(region);
//   }, []);

//   const handleResetRegion = useCallback(() => {
//     setSelectedRegion(null);
//   }, []);

//   useEffect(() => {
//     loadYmapsScript().catch(error => {
//       console.error('Ошибка загрузки Yandex Maps API:', error);
//     });
//   }, []);

//   const handleBrush = (start, end) => {
//     if (start && end && flightData) {
//       const filtered = flightData.filter(d => {
//         const date = new Date(d.date);
//         return date >= start && date <= end;
//       });
//       setFilteredPoints(filtered);
//     } else {
//       // Если выделение сброшено, показываем все точки
//       setFilteredPoints(flightData || []);
//     }
//   };

//   // Дожидаемся загрузки всех данных
//   if (!flightData || !regionsPoligons) {
//     return <div className='main'>Загрузка данных...</div>;
//   }

//   return (
//     <div className='main'>
//       <h1>Карта России</h1>
//       <MapComponent 
//         regionsData={regionsPoligons}  
//         points={filteredPoints} 
//       />
//       <ChartComponent data={flightData} onBrush={handleBrush} />
//     </div>
//   );
// };

// export default RussianMapPage;