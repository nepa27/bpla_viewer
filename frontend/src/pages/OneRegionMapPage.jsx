/* eslint-disable no-unused-vars */
import { useMemo, useState } from 'react';

import { useParams } from 'react-router';

import ChartExportSelectorRegion from '../components/ChartExportSelectorRegion/ChartExportSelectorRegion';
import DateRangePicker from '../components/DatePicker/DatePicker';
import ErrorDisplay from '../components/ErrorDisplay/ErrorDisplay';
import TableMain from '../components/Table/Table';
import { useFlightFullData } from '../hooks/useFlightFullData';
import { useGzipPolygonsData } from '../hooks/useGzipPolygonsData';
import { useGzipRegionFlightData } from '../hooks/useGzipRegionFlightData';
import { useYmapsLoader } from '../hooks/useYmapsLoader';
import FlightStatisticsOneReg from '../modules/FlightStatisticsOneReg/FlightStatisticsOneReg';
import MapComponent from '../modules/MapComponent/MapComponent';
import ButtonGoBack from '../ui/ButtonGoBack/ButtonGoBack';
import { initialDateRange } from '../utils/constant';
import { timeToDateConverter } from '../utils/functions';
import ROUTES from '../utils/routes';
import { ChartsSkeletonStatistics, MapSkeleton } from '../utils/skeletons/skeletons';

export const OneRegionMapPage = () => {
  const { id } = useParams();

  const [dateRange, setDateRange] = useState(null);
  const [dateQuery, setDateQuery] = useState(initialDateRange);

  const [from, to] = useMemo(() => {
    if (!dateQuery) return ['', ''];
    return [timeToDateConverter(dateQuery[0].toDate()), timeToDateConverter(dateQuery[1].toDate())];
  }, [dateQuery]);

  const {
    data: flightData,
    loading: flightLoading,
    error: flightError,
  } = useGzipRegionFlightData(id, from, to);

  const {
    data: regionsPolygons,
    loading: regionsLoading,
    error: regionsError,
  } = useGzipPolygonsData();

  const {
    filteredFlights,
    dailyFlights,
    peakHourlyFlights,
    flightsDurationByRegion,
    flightsByTimeOfDay,
    statistics,
    flightDurationByDate,
  } = useFlightFullData(flightData, dateRange);

  const oneRegionData = regionsPolygons?.features?.find(
    (obj) => String(obj.properties?.region_id) === String(id),
  );
  const regionCenter = oneRegionData?.properties?.center || [69, 100];

  const { errorLoadYmaps, ymapsLoading } = useYmapsLoader();

  const loading = ymapsLoading || flightLoading || regionsLoading;
  const error = flightError || regionsError;

  const chartsDataForExport = useMemo(
    () => ({
      dailyFlights,
      flightDurationByDate,
      peakHourlyFlights,
      flightsByTimeOfDay,
      statistics,
    }),
    [dailyFlights, flightDurationByDate, peakHourlyFlights, flightsByTimeOfDay, statistics],
  );

  const regionName = oneRegionData?.properties?.region || 'Регион России';

  if (loading) {
    return (
      <div className="main">
        <div className="btn-back-container">
          <ButtonGoBack />
          <div className="header-region">
            <h1>Загрузка региона...</h1>
          </div>
        </div>
        <MapSkeleton />
        <ChartsSkeletonStatistics count={3} />
      </div>
    );
  }

  if (!regionsPolygons) {
    return (
      <div className="main">
        <div className="btn-back-container">
          <ButtonGoBack />
          <div className="header-region">
            <h1>Загрузка карты...</h1>
          </div>
        </div>
        <MapSkeleton />
      </div>
    );
  }

  if (!oneRegionData) {
    return (
      <div className="main">
        <div className="btn-back-container">
          <ButtonGoBack />
          <div className="header-region">
            <h1>Регион не найден</h1>
          </div>
        </div>
        <div
          style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Регион с ID {id} не найден.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main">
        <div className="btn-back-container">
          <ButtonGoBack />
          <div className="header-region">
            <h1>{regionName}</h1>
          </div>
        </div>
        <ErrorDisplay
          errorCode="400"
          errorMessage="Ошибка загрузки данных"
          errorSubmessage={error}
          buttonText="Вернуться к карте России"
          linkTo={ROUTES.HOME}
        />
      </div>
    );
  }

  return (
    <div className="main">
      <div className="btn-back-container">
        <ButtonGoBack />
        <div className="header-region">
          <h1>{regionName}</h1>
        </div>
      </div>

      <ChartExportSelectorRegion
        regionName={regionName}
        chartsData={chartsDataForExport}
        dateRange={dateQuery}
      />

      <MapComponent
        regionsData={oneRegionData}
        points={filteredFlights || []}
        errorLoadYmaps={errorLoadYmaps}
        center={regionCenter}
        zoom={6}
      />

      <DateRangePicker dateRange={dateQuery} setDateRange={setDateQuery} />

      <TableMain data={filteredFlights} />

      <FlightStatisticsOneReg
        dateRange={dateRange}
        statistics={statistics}
        dailyFlights={dailyFlights}
        onDateRangeChange={setDateRange}
        peakHourlyFlights={peakHourlyFlights}
        flightsByTimeOfDay={flightsByTimeOfDay}
        flightsDurationByRegion={flightsDurationByRegion}
        flightDurationByDate={flightDurationByDate}
      />
    </div>
  );
};

export default OneRegionMapPage;
