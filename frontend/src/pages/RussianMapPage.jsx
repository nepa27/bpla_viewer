// src/pages/RussianMapPage.jsx
import { useEffect, useState } from 'react';

import DateRangePicker from '../components/DatePicker/DatePicker';
import FlightStatistics from '../components/FlightStatistics';
import { useFlightData } from '../hooks/useFlightData';
import { useGzipFlightData } from '../hooks/useGzipFlightData';
import { useRegions } from '../hooks/useRegions';
// Обновленный хук
import MapComponent from '../modules/MapComponent';
import { initialDateRange } from '../utils/constant';
import { getDateNow, getDateStartYear, timeToDateConverter } from '../utils/functions';
import { loadYmapsScript } from '../utils/loadYmaps';

const RussianMapPage = () => {
  const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
  const [ymapsLoading, setYmapsLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [dateQuery, setDateQuery] = useState(initialDateRange);

  const from = timeToDateConverter(dateQuery[0].toDate());
  const to = timeToDateConverter(dateQuery[1].toDate());

  // Используем новый хук для получения данных полетов
  const {
    data: flightData,
    loading: flightLoading,
    error: flightError,
  } = useGzipFlightData(from, to);

  // Используем обновленный хук для получения данных регионов
  const { data: regionsPolygons, loading: regionsLoading, error: regionsError } = useRegions();

  const { filteredFlights, dailyFlights, flightsByRegion, flightsDurationByRegion } = useFlightData(
    flightData,
    dateRange,
  );

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

  const loading = ymapsLoading || flightLoading || regionsLoading;
  const error = flightError || regionsError;

  if (loading) {
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
          {error ? `Ошибка: ${error}` : 'Загрузка данных...'}
        </div>
      </div>
    );
  }

  if (!flightData || !regionsPolygons) {
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
          Нет данных для отображения
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
        isRussiaView={true}
      />
      <DateRangePicker dateRange={dateQuery} setDateRange={setDateQuery} />
      <FlightStatistics
        dailyFlights={dailyFlights}
        flightsByRegion={flightsByRegion}
        flightsDurationByRegion={flightsDurationByRegion}
        onDateRangeChange={setDateRange}
      />
    </div>
  );
};

export default RussianMapPage;

// // src/pages/RussianMapPage.jsx
// import dayjs from 'dayjs';

// import { useEffect, useState } from 'react';

// import FlightStatistics from '../components/FlightStatistics';
// import { useFlightData } from '../hooks/useFlightData';
// import { useGzipFlightData } from '../hooks/useGzipFlightData';
// // Новый хук
// import { useRegions } from '../hooks/useRegions';
// import MapComponent from '../modules/MapComponent';
// import { getDateNow, getDateStartYear, timeToDateConverter } from '../utils/functions';
// import { loadYmapsScript } from '../utils/loadYmaps';
// import DateRangePickerFree from './DatePicker/DatePicker';

// const RussianMapPage = () => {
//   const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
//   const [ymapsLoading, setYmapsLoading] = useState(true);
//   const [dateRange, setDateRange] = useState(null);
//   const [dateQuery, setDateQuery] = useState([dayjs().subtract(1, 'month'), dayjs()]);

//   const from = timeToDateConverter(dateQuery[0].toDate());
//   const to = timeToDateConverter(dateQuery[1].toDate());

//   // Используем новый хук для получения данных
//   const { data: flightData, loading, error, refetch } = useGzipFlightData(from, to);

//   const regionsPolygons = useRegions();

//   const { filteredFlights, dailyFlights, flightsByRegion, flightsDurationByRegion } = useFlightData(
//     flightData,
//     dateRange,
//   );

//   useEffect(() => {
//     let isMounted = true;

//     setYmapsLoading(true);
//     loadYmapsScript()
//       .then(() => {
//         if (isMounted) {
//           setErrorLoadYmaps(false);
//         }
//       })
//       .catch((error) => {
//         console.error('Ошибка загрузки Yandex Maps API:', error);
//         if (isMounted) {
//           setErrorLoadYmaps(true);
//         }
//       })
//       .finally(() => {
//         if (isMounted) {
//           setYmapsLoading(false);
//         }
//       });

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   if (ymapsLoading || loading) {
//     return (
//       <div className="main">
//         <h1>Карта России</h1>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           {error ? `Ошибка: ${error}` : 'Загрузка данных...'}
//         </div>
//       </div>
//     );
//   }

//   if (!flightData || !regionsPolygons) {
//     return (
//       <div className="main">
//         <h1>Карта России</h1>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           Нет данных для отображения
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="main">
//       <h1>Карта России</h1>
//       <MapComponent
//         regionsData={regionsPolygons}
//         points={filteredFlights}
//         errorLoadYmaps={errorLoadYmaps}
//         isRussiaView={true}
//       />
//       <DateRangePickerFree dateRange={dateQuery} setDateRange={setDateQuery} />
//       <FlightStatistics
//         dailyFlights={dailyFlights}
//         flightsByRegion={flightsByRegion}
//         flightsDurationByRegion={flightsDurationByRegion}
//         onDateRangeChange={setDateRange}
//         dateRange={dateRange}
//       />
//     </div>
//   );
// };

// export default RussianMapPage;

// // src/pages/RussianMapPage.jsx
// import dayjs from 'dayjs';

// import { useEffect, useState } from 'react';

// import FlightStatistics from '../components/FlightStatistics';
// import { useData } from '../hooks/useData';
// import { useFlightData } from '../hooks/useFlightData';
// import { useRegions } from '../hooks/useRegions';
// import MapComponent from '../modules/MapComponent';
// import { getDateNow, getDateStartYear, timeToDateConverter } from '../utils/functions';
// import { loadYmapsScript } from '../utils/loadYmaps';
// import { useRegionsData } from '../utils/queries';
// import DateRangePickerFree from './DatePicker/DatePicker';

// const RussianMapPage = () => {
//   const { data: flightData, loading, error } = useData();
//   const regionsPolygons = useRegions();
//   // const { polygons: regionsPolygons } = usePolygonsData(); // @TODO
//   const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
//   const [ymapsLoading, setYmapsLoading] = useState(true);
//   const [dateRange, setDateRange] = useState(null);

//   // useState([getDateStartYear(),getDateNow()])
//   // const [dateQuery, setDateQuery] = useState([getDateStartYear(), getDateNow()]); // @TODO [dayjs().subtract(1, 'year'), dayjs()]
//   const [dateQuery, setDateQuery] = useState([dayjs().subtract(1, 'month'), dayjs()]); // @TODO [dayjs().subtract(1, 'year'), dayjs()]
//   const from = timeToDateConverter(dateQuery[0].toDate());
//   const to = timeToDateConverter(dateQuery[1].toDate());
//   console.log(dayjs())

//   // const {
//   //   data: region, // flightData @TODO
//   //   isLoading: isRegionLoading,
//   //   error: regionError,
//   // } = useRegionsData(from, to);

//   // console.log('test region >', regionsPolygons);
//   // console.log('test regionId data >', region);

//   const { filteredFlights, dailyFlights, flightsByRegion, flightsDurationByRegion } = useFlightData(
//     flightData,
//     dateRange,
//   );

//   useEffect(() => {
//     let isMounted = true;

//     setYmapsLoading(true);
//     loadYmapsScript()
//       .then(() => {
//         if (isMounted) {
//           setErrorLoadYmaps(false);
//         }
//       })
//       .catch((error) => {
//         console.error('Ошибка загрузки Yandex Maps API:', error);
//         if (isMounted) {
//           setErrorLoadYmaps(true);
//         }
//       })
//       .finally(() => {
//         if (isMounted) {
//           setYmapsLoading(false);
//         }
//       });

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   if (ymapsLoading || loading) {
//     return (
//       <div className="main">
//         <h1>Карта России</h1>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           {error ? `Ошибка: ${error}` : 'Загрузка данных...'}
//         </div>
//       </div>
//     );
//   }

//   if (!flightData || !regionsPolygons) {
//     return (
//       <div className="main">
//         <h1>Карта России</h1>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           Нет данных для отображения
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="main">
//       <h1>Карта России</h1>
//       <MapComponent
//         regionsData={regionsPolygons}
//         points={filteredFlights}
//         errorLoadYmaps={errorLoadYmaps}
//         isRussiaView={true}
//       />
//       <DateRangePickerFree dateRange={dateQuery} setDateRange={setDateQuery} />
//       <FlightStatistics
//         dailyFlights={dailyFlights}
//         flightsByRegion={flightsByRegion}
//         flightsDurationByRegion={flightsDurationByRegion}
//         onDateRangeChange={setDateRange}
//         dateRange={dateRange}
//       />
//     </div>
//   );
// };

// export default RussianMapPage;

// // pages/RussianMapPage.jsx
// import { useEffect, useState } from 'react';

// import FlightStatistics from '../components/FlightStatistics';
// import { useData } from '../hooks/useData';
// import { useFlightData } from '../hooks/useFlightData';
// import { useRegions } from '../hooks/useRegions';
// import MapComponent from '../modules/MapComponent';
// import { loadYmapsScript } from '../utils/loadYmaps';

// // Улучшенная версия с оптимизацией рендеринга
// const RussianMapPage = () => {
//   const { data: flightData, loading, error } = useData();
//   const regionsPolygons = useRegions();
//   const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
//   const [ymapsLoading, setYmapsLoading] = useState(true);

//   const { filteredFlights, dailyFlights, flightsByRegion, flightsDurationByRegion, setDateRange } =
//     useFlightData(flightData);

//   useEffect(() => {
//     let isMounted = true;

//     setYmapsLoading(true);
//     loadYmapsScript()
//       .then(() => {
//         if (isMounted) {
//           setErrorLoadYmaps(false);
//         }
//       })
//       .catch((error) => {
//         console.error('Ошибка загрузки Yandex Maps API:', error);
//         if (isMounted) {
//           setErrorLoadYmaps(true);
//         }
//       })
//       .finally(() => {
//         if (isMounted) {
//           setYmapsLoading(false);
//         }
//       });

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   // Оптимизированное условие загрузки
//   if (ymapsLoading || loading) {
//     return (
//       <div className="main">
//         <h1>Карта России</h1>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           {error ? `Ошибка: ${error}` : 'Загрузка данных...'}
//         </div>
//       </div>
//     );
//   }

//   // Проверка наличия необходимых данных
//   if (!flightData || !regionsPolygons) {
//     return (
//       <div className="main">
//         <h1>Карта России</h1>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           Нет данных для отображения
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="main">
//       <h1>Карта России</h1>
//       <MapComponent
//         regionsData={regionsPolygons}
//         points={filteredFlights}
//         errorLoadYmaps={errorLoadYmaps}
//       />
//       <FlightStatistics
//         dailyFlights={dailyFlights}
//         flightsByRegion={flightsByRegion}
//         flightsDurationByRegion={flightsDurationByRegion}
//         onDateRangeChange={setDateRange}
//       />
//     </div>
//   );
// };

// export default RussianMapPage;

// const RussianMapPage = () => {
//   const { data: flightData, loading, error } = useData();
//   const regionsPolygons = useRegions();
//   const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
//   const [ymapsLoading, setYmapsLoading] = useState(true);
//   // === ИЗМЕНЕНИЕ: Получаем flightsDurationByRegion ===
//   const { filteredFlights, dailyFlights, flightsByRegion, flightsDurationByRegion, setDateRange } =
//     useFlightData(flightData);

//   useEffect(() => {
//     setYmapsLoading(true);
//     loadYmapsScript()
//       .then(() => {
//         setErrorLoadYmaps(false);
//       })
//       .catch((error) => {
//         console.error('Ошибка загрузки Yandex Maps API:', error);
//         setErrorLoadYmaps(true);
//       })
//       .finally(() => {
//         setYmapsLoading(false);
//       });
//   }, []);

//   // Показываем загрузку пока данные или Yandex Maps загружаются
//   if (ymapsLoading || loading || !flightData || !regionsPolygons) {
//     return (
//       <div className="main">
//         <h1>Карта России</h1>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           {error ? `Ошибка: ${error}` : 'Загрузка данных...'}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="main">
//       <h1>Карта России</h1>
//       <MapComponent
//         regionsData={regionsPolygons}
//         points={filteredFlights}
//         errorLoadYmaps={errorLoadYmaps}
//       />
//       {/* === ИЗМЕНЕНИЕ: Передаем flightsDurationByRegion === */}
//       <FlightStatistics
//         dailyFlights={dailyFlights}
//         flightsByRegion={flightsByRegion}
//         flightsDurationByRegion={flightsDurationByRegion} // НОВОЕ
//         onDateRangeChange={setDateRange}
//       />
//     </div>
//   );
// };

// export default RussianMapPage;

// // pages/RussianMapPage.jsx
// import { useEffect, useState } from 'react';
// import FlightStatistics from '../components/FlightStatistics';
// import { useData } from '../hooks/useData';
// import { useFlightData } from '../hooks/useFlightData';
// import { useRegions } from '../hooks/useRegions';
// import MapComponent from '../modules/MapComponent';
// import { loadYmapsScript } from '../utils/loadYmaps';

// const RussianMapPage = () => {
//   const { data: flightData, loading, error } = useData();
//   const regionsPolygons = useRegions();
//   const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
//   const [ymapsLoading, setYmapsLoading] = useState(true);
//   const { filteredFlights, dailyFlights, setDateRange } = useFlightData(flightData);

//   useEffect(() => {
//     setYmapsLoading(true);
//     loadYmapsScript()
//       .then(() => {
//         setErrorLoadYmaps(false);
//       })
//       .catch((error) => {
//         console.error('Ошибка загрузки Yandex Maps API:', error);
//         setErrorLoadYmaps(true);
//       })
//       .finally(() => {
//         setYmapsLoading(false);
//       });
//   }, []);

//   // Показываем загрузку пока данные или Yandex Maps загружаются
//   if (ymapsLoading || loading || !flightData || !regionsPolygons) {
//     return (
//       <div className="main">
//         <h1>Карта России</h1>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           {error ? `Ошибка: ${error}` : 'Загрузка данных...'}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="main">
//       <h1>Карта России</h1>
//       <MapComponent
//         regionsData={regionsPolygons}
//         points={filteredFlights}
//         errorLoadYmaps={errorLoadYmaps}
//       />
//       <FlightStatistics dailyFlights={dailyFlights} onDateRangeChange={setDateRange} />
//     </div>
//   );
// };

// export default RussianMapPage;

// /* eslint-disable no-unused-vars */
// import { useEffect, useState } from 'react';

// import FlightStatistics from '../components/FlightStatistics';
// import { useData } from '../hooks/useData';
// import { useFlightData } from '../hooks/useFlightData';
// import { useRegions } from '../hooks/useRegions';
// import MapComponent from '../modules/MapComponent';
// import { loadYmapsScript } from '../utils/loadYmaps';

// const RussianMapPage = () => {
//   const flightData = useData();
//   const regionsPolygons = useRegions();
//   const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
//   const [ymapsLoading, setYmapsLoading] = useState(true);
//   const { filteredFlights, dailyFlights, setDateRange } = useFlightData(flightData);
//   // const [selectedRegion, setSelectedRegion] = useState(null);

//   // const handleRegionSelect = useCallback((region) => {
//   //   setSelectedRegion(region);
//   // }, []);

//   // const handleResetRegion = useCallback(() => {
//   //   setSelectedRegion(null);
//   // }, []);

//   useEffect(() => {
//     setYmapsLoading(true);
//     loadYmapsScript()
//       .then(() => {
//         // console.log('Yandex Maps API успешно загружен');
//         setErrorLoadYmaps(false);
//       })
//       .catch((error) => {
//         console.error('Ошибка загрузки Yandex Maps API:', error);
//         setErrorLoadYmaps(true);
//       })
//       .finally(() => {
//         setYmapsLoading(false);
//       });
//   }, []);

//   // Показываем загрузку пока данные или Yandex Maps загружаются
//   if (ymapsLoading || !flightData || !regionsPolygons) {
//     return (
//       <div className="main">
//         <h1>Карта России</h1>
//         <div
//           style={{
//             height: '600px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}
//         >
//           Загрузка данных...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="main">
//       <h1>Карта России</h1>
//       <MapComponent
//         regionsData={regionsPolygons}
//         points={filteredFlights}
//         errorLoadYmaps={errorLoadYmaps}
//       />
//       <FlightStatistics dailyFlights={dailyFlights} onDateRangeChange={setDateRange} />
//     </div>
//   );
// };

// export default RussianMapPage;
