/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react';

import ChartExportSelector from '../components/ChartExportSelector/ChartExportSelector';
import DateRangePicker from '../components/DatePicker/DatePicker';
import ErrorDisplay from '../components/ErrorDisplay/ErrorDisplay';
import { useFlightCoreData } from '../hooks/useFlightCoreData';
import { useGzipFlightData } from '../hooks/useGzipFlightData';
import { useGzipPolygonsData } from '../hooks/useGzipPolygonsData';
import { useYmapsLoader } from '../hooks/useYmapsLoader';
import FlightStatistics from '../modules/FlightStatistics/FlightStatistics';
import MapComponent from '../modules/MapComponent/MapComponent';
import { initialDateRange } from '../utils/constant';
import { timeToDateConverter } from '../utils/functions';
import ROUTES from '../utils/routes';
import { FlightStatsSkeleton, MapSkeleton } from '../utils/skeletons';

const RussianMapPage = () => {
  const [dateRange, setDateRange] = useState(null);
  const [dateQuery, setDateQuery] = useState(initialDateRange);

  const [from, to] = useMemo(() => {
    if (!dateQuery) return ['', ''];
    return [
      timeToDateConverter(dateQuery[0]?.toDate()),
      timeToDateConverter(dateQuery[1]?.toDate()),
    ];
  }, [dateQuery]);

  const {
    data: flightData,
    loading: flightLoading,
    error: flightError,
  } = useGzipFlightData(from, to);

  const {
    data: regionsPolygons,
    loading: regionsLoading,
    error: regionsError,
  } = useGzipPolygonsData();

  const { filteredFlights, dailyFlights, flightsByRegion, flightsDurationByRegion } =
    useFlightCoreData(flightData, dateRange);

  const { errorLoadYmaps, ymapsLoading } = useYmapsLoader();

  const loading = ymapsLoading || flightLoading || regionsLoading;
  const error = flightError || regionsError;

  if (error) {
    return (
      <>
        <div className="main">
          <h1>Карта России</h1>
        </div>

        <ErrorDisplay
          errorCode="500"
          errorMessage="Ошибка сервера"
          errorSubmessage={error}
          buttonText="перезагрузить страницу"
          linkTo={ROUTES.HOME}
        />
      </>
    );
  }

  if (!flightData || !regionsPolygons) {
    if (loading) {
      return (
        <div className="main">
          <h1>Карта России</h1>
          <MapSkeleton />
          <FlightStatsSkeleton />
        </div>
      );
    }

    // return (
    //   <>
    //     <div className="main">
    //       <h1>Карта России</h1>
    //     </div>
    //     <MessageDisplay
    //       title="Выберите диапазон дат"
    //       submessage="Выберите период для отображения данных"
    //       buttonText="Перезагрузить "
    //       icon="📅"
    //     />
    //   </>
    // );
  }

  if (!filteredFlights || !dailyFlights || !flightsByRegion || !flightsDurationByRegion) {
    if (loading) {
      return (
        <div className="main">
          <h1>Карта России</h1>
          <MapSkeleton />
          <FlightStatsSkeleton />
        </div>
      );
    }

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

      <ChartExportSelector
        dateRange={dateQuery}
        chartsData={{ dailyFlights, flightsByRegion, flightsDurationByRegion }}
      />

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

// import { useCallback, useMemo, useState } from 'react';

// import ChartExportSelector from '../components/ChartExportSelector/ChartExportSelector';
// import DateRangePicker from '../components/DatePicker/DatePicker';
// import ErrorDisplay from '../components/ErrorDisplay/ErrorDisplay';
// import { useFlightCoreData } from '../hooks/useFlightCoreData';
// import { useGzipFlightData } from '../hooks/useGzipFlightData';
// import { useGzipPolygonsData } from '../hooks/useGzipPolygonsData';
// import { useYmapsLoader } from '../hooks/useYmapsLoader';
// import FlightStatistics from '../modules/FlightStatistics/FlightStatistics';
// import MapComponent from '../modules/MapComponent/MapComponent';
// import { initialDateRange } from '../utils/constant';
// import { timeToDateConverter } from '../utils/functions';
// import ROUTES from '../utils/routes';
// import { FlightStatsSkeleton, MapSkeleton } from '../utils/skeletons';

// const RussianMapPage = () => {
//   const [dateRange, setDateRange] = useState(null);
//   const [dateQuery, setDateQuery] = useState(initialDateRange);

//   const [from, to] = useMemo(() => {
//     if (!dateQuery) return ['', ''];
//     return [
//       timeToDateConverter(dateQuery[0]?.toDate()),
//       timeToDateConverter(dateQuery[1]?.toDate()),
//     ];
//   }, [dateQuery]);

//   const {
//     data: flightData,
//     loading: flightLoading,
//     error: flightError,
//   } = useGzipFlightData(from, to);

//   const {
//     data: regionsPolygons,
//     loading: regionsLoading,
//     error: regionsError,
//   } = useGzipPolygonsData();

//   const { filteredFlights, dailyFlights, flightsByRegion, flightsDurationByRegion } =
//     useFlightCoreData(flightData, dateRange);

//   const { errorLoadYmaps, ymapsLoading } = useYmapsLoader();

//   const loading = ymapsLoading || flightLoading || regionsLoading;
//   const error = flightError || regionsError;

//   // Мемоизированные компоненты для предотвращения лишних рендеров
//   const renderError = useCallback(
//     () => (
//       <>
//         <div className="main">
//           <h1>Карта России</h1>
//         </div>
//         <ErrorDisplay
//           errorCode="500"
//           errorMessage="Ошибка сервера"
//           errorSubmessage={error}
//           buttonText="перезагрузить страницу"
//           linkTo={ROUTES.HOME}
//         />
//       </>
//     ),
//     [error, ROUTES.HOME],
//   );

//   const renderLoading = useCallback(
//     () => (
//       <div className="main">
//         <h1>Карта России</h1>
//         <MapSkeleton />
//         <FlightStatsSkeleton />
//       </div>
//     ),
//     [],
//   );

//   const renderContent = useCallback(
//     () => (
//       <div className="main">
//         <h1>Карта России</h1>

//         <ChartExportSelector
//           dateRange={dateQuery}
//           chartsData={{ dailyFlights, flightsByRegion, flightsDurationByRegion }}
//         />

//         <MapComponent
//           regionsData={regionsPolygons}
//           points={filteredFlights}
//           errorLoadYmaps={errorLoadYmaps}
//           isRussiaView={true}
//         />

//         <DateRangePicker dateRange={dateQuery} setDateRange={setDateQuery} />

//         <FlightStatistics
//           dailyFlights={dailyFlights}
//           flightsByRegion={flightsByRegion}
//           flightsDurationByRegion={flightsDurationByRegion}
//           onDateRangeChange={setDateRange}
//         />
//       </div>
//     ),
//     [
//       dateQuery,
//       regionsPolygons,
//       filteredFlights,
//       errorLoadYmaps,
//       dailyFlights,
//       flightsByRegion,
//       flightsDurationByRegion,
//       setDateQuery,
//       setDateRange,
//     ],
//   );

//   const renderFallback = useCallback(
//     () => (
//       <div className="main">
//         <h1>Карта России</h1>
//         <MapSkeleton />
//         <FlightStatsSkeleton />
//       </div>
//     ),
//     [],
//   );

//   if (error) {
//     return renderError();
//   }

//   if (!flightData || !regionsPolygons) {
//     if (loading) {
//       return renderLoading();
//     }
//     return renderFallback();
//   }

//   if (!filteredFlights || !dailyFlights || !flightsByRegion || !flightsDurationByRegion) {
//     if (loading) {
//       return renderLoading();
//     }

//     return (
//       <div className="main">
//         <h1>Карта России</h1>
//         <MapComponent
//           regionsData={regionsPolygons}
//           points={filteredFlights || []}
//           errorLoadYmaps={errorLoadYmaps}
//           isRussiaView={true}
//         />
//         <DateRangePicker dateRange={dateQuery} setDateRange={setDateQuery} />
//         <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка статистики...</div>
//       </div>
//     );
//   }

//   return renderContent();
// };

// export default RussianMapPage;
