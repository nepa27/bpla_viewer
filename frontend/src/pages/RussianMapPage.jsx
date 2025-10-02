/* eslint-disable no-unused-vars */
import { useCallback, useState } from 'react';

import ChartExportSelector from '../components/ChartExportSelector/ChartExportSelector';
import DateRangePicker from '../components/DatePicker/DatePicker';
import { useFlightData } from '../hooks/useFlightData';
import { useGzipFlightData } from '../hooks/useGzipFlightData';
import { useGzipPolygonsData } from '../hooks/useGzipPolygonsData';
import { useYmapsLoader } from '../hooks/useYmapsLoader';
import FlightStatistics from '../modules/FlightStatistics/FlightStatistics';
import MapComponent from '../modules/MapComponent/MapComponent';
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

  const {
    data: regionsPolygons,
    loading: regionsLoading,
    error: regionsError,
  } = useGzipPolygonsData();

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
        onDateRangeChange={handleDateRangeChange}
      />
    </div>
  );
};

export default RussianMapPage;
