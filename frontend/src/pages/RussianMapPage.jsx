import { Skeleton, Space } from 'antd';

import { useCallback, useEffect, useState } from 'react';

import DateRangePicker from '../components/DatePicker/DatePicker';
import FlightStatistics from '../components/FlightStatistics';
import { useFlightData } from '../hooks/useFlightData';
import { useGzipFlightData } from '../hooks/useGzipFlightData';
import { useRegions } from '../hooks/useRegions';
import { useYmapsLoader } from '../hooks/useYmapsLoader';
import MapComponent from '../modules/MapComponent';
import { initialDateRange } from '../utils/constant';
import { timeToDateConverter } from '../utils/functions';
import { FlightStatsSkeleton, MapSkeleton } from '../utils/skeletons';

const RussianMapPage = () => {
  const [dateRange, setDateRange] = useState(null);
  const [dateQuery, setDateQuery] = useState(initialDateRange);

  const from = timeToDateConverter(dateQuery[0].toDate());
  const to = timeToDateConverter(dateQuery[1].toDate());

  const {
    data: flightData,
    loading: flightLoading,
    error: flightError,
  } = useGzipFlightData(from, to);

  const { data: regionsPolygons, loading: regionsLoading, error: regionsError } = useRegions();

  const { filteredFlights, dailyFlights, flightsByRegion, flightsDurationByRegion } = useFlightData(
    flightData,
    dateRange,
  );

  const { errorLoadYmaps, ymapsLoading } = useYmapsLoader();

  const loading = ymapsLoading || flightLoading || regionsLoading;
  const error = flightError || regionsError;

  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range);
  }, []);

  // Проверяем, нужно ли показывать скелетоны
  const shouldShowSkeletons = loading && (!flightData || !regionsPolygons);

  if (shouldShowSkeletons) {
    return (
      <div className="main">
        <h1>Карта России</h1>
        <MapSkeleton />
        <FlightStatsSkeleton />
      </div>
    );
  }

  if (error) {
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
          Ошибка: {error.message || error}
        </div>
      </div>
    );
  }

  // Основная логика отображения
  if (!flightData || !regionsPolygons) {
    // Проверяем, действительно ли данные загружаются
    if (loading) {
      return (
        <div className="main">
          <h1>Карта России</h1>
          <MapSkeleton />
          <FlightStatsSkeleton />
        </div>
      );
    }

    // Если данные не загрузились, но не в процессе загрузки
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

  // Проверяем, что все данные для отображения есть
  if (!filteredFlights || !dailyFlights || !flightsByRegion || !flightsDurationByRegion) {
    // Если данные загружаются, показываем скелетоны
    if (loading) {
      return (
        <div className="main">
          <h1>Карта России</h1>
          <MapSkeleton />
          <FlightStatsSkeleton />
        </div>
      );
    }

    // Если данные уже загружены, но не все поля заполнены
    return (
      <div className="main">
        <h1>Карта России</h1>
        <MapComponent
          regionsData={regionsPolygons}
          points={filteredFlights || []}
          errorLoadYmaps={errorLoadYmaps}
          isRussiaView={true}
        />
        <DateRangePicker dateRange={dateQuery} setDateRange={setDateQuery} />
        <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка статистики...</div>
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
        onDateRangeChange={handleDateRangeChange}
      />
    </div>
  );
};

export default RussianMapPage;

// import { useCallback, useEffect, useState } from 'react';
// import { Skeleton, Space } from 'antd';

// import DateRangePicker from '../components/DatePicker/DatePicker';
// import FlightStatistics from '../components/FlightStatistics';
// import { useFlightData } from '../hooks/useFlightData';
// import { useGzipFlightData } from '../hooks/useGzipFlightData';
// import { useRegions } from '../hooks/useRegions';
// import MapComponent from '../modules/MapComponent';
// import { initialDateRange } from '../utils/constant';
// import { timeToDateConverter } from '../utils/functions';
// import { loadYmapsScript } from '../utils/loadYmaps';

// const RussianMapPage = () => {
//   const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
//   const [ymapsLoading, setYmapsLoading] = useState(true);
//   const [dateRange, setDateRange] = useState(null);
//   const [dateQuery, setDateQuery] = useState(initialDateRange);

//   const from = timeToDateConverter(dateQuery[0].toDate());
//   const to = timeToDateConverter(dateQuery[1].toDate());

//   const {
//     data: flightData,
//     loading: flightLoading,
//     error: flightError,
//   } = useGzipFlightData(from, to);

//   const { data: regionsPolygons, loading: regionsLoading, error: regionsError } = useRegions();

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

//   const loading = ymapsLoading || flightLoading || regionsLoading;
//   const error = flightError || regionsError;

//   const handleDateRangeChange = useCallback((range) => {
//     setDateRange(range);
//   }, []);

//   // Скелетон для MapComponent
//   const MapSkeleton = () => (
//     <div className="map-container">
//       <Skeleton active paragraph={{ rows: 0 }} style={{ height: '600px' }} />
//     </div>
//   );

//   // Скелетон для FlightStatistics
//   const FlightStatsSkeleton = () => (
//     <div className="chart-container">
//       <Space direction="vertical" size="large" style={{ width: '100%' }}>
//         {[...Array(3)].map((_, i) => (
//           <Skeleton key={i} active paragraph={{ rows: 4 }} />
//         ))}
//       </Space>
//     </div>
//   );

//   // Проверяем, нужно ли показывать скелетоны
//   const shouldShowSkeletons = loading && (!flightData || !regionsPolygons);

//   if (shouldShowSkeletons) {
//     return (
//       <div className="main">
//         <h1>Карта России</h1>
//         <MapSkeleton />
//         <FlightStatsSkeleton />
//       </div>
//     );
//   }

//   if (error) {
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
//           Ошибка: {error.message || error}
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
//       <DateRangePicker dateRange={dateQuery} setDateRange={setDateQuery} />
//       <FlightStatistics
//         dailyFlights={dailyFlights}
//         flightsByRegion={flightsByRegion}
//         flightsDurationByRegion={flightsDurationByRegion}
//         onDateRangeChange={handleDateRangeChange}
//       />
//     </div>
//   );
// };

// export default RussianMapPage;

// import { useCallback, useEffect, useState } from 'react';

// import DateRangePicker from '../components/DatePicker/DatePicker';
// import FlightStatistics from '../components/FlightStatistics';
// import { useFlightData } from '../hooks/useFlightData';
// import { useGzipFlightData } from '../hooks/useGzipFlightData';
// import { useRegions } from '../hooks/useRegions';
// import MapComponent from '../modules/MapComponent';
// import { initialDateRange } from '../utils/constant';
// import { timeToDateConverter } from '../utils/functions';
// import { loadYmapsScript } from '../utils/loadYmaps';

// const RussianMapPage = () => {
//   const [errorLoadYmaps, setErrorLoadYmaps] = useState(false);
//   const [ymapsLoading, setYmapsLoading] = useState(true);
//   const [dateRange, setDateRange] = useState(null);
//   const [dateQuery, setDateQuery] = useState(initialDateRange);

//   const from = timeToDateConverter(dateQuery[0].toDate());
//   const to = timeToDateConverter(dateQuery[1].toDate());

//   const {
//     data: flightData,
//     loading: flightLoading,
//     error: flightError,
//   } = useGzipFlightData(from, to);

//   const { data: regionsPolygons, loading: regionsLoading, error: regionsError } = useRegions();

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

//   const loading = ymapsLoading || flightLoading || regionsLoading;
//   const error = flightError || regionsError;

//   const handleDateRangeChange = useCallback((range) => {
//     setDateRange(range);
//   }, []);

//   if (loading) {
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
//       <DateRangePicker dateRange={dateQuery} setDateRange={setDateQuery} />
//       <FlightStatistics
//         dailyFlights={dailyFlights}
//         flightsByRegion={flightsByRegion}
//         flightsDurationByRegion={flightsDurationByRegion}
//         onDateRangeChange={handleDateRangeChange}
//       />
//     </div>
//   );
// };

// export default RussianMapPage;
