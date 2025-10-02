import { Skeleton, Space } from 'antd';
import dayjs from 'dayjs';

import { useEffect, useState } from 'react';

import { useParams } from 'react-router';

import ChartExportSelectorRegion from '../components/ChartExportSelectorRegion/ChartExportSelectorRegion';
import DateRangePicker from '../components/DatePicker/DatePicker';
import { useFlightData } from '../hooks/useFlightData';
import { useGzipPolygonsData } from '../hooks/useGzipPolygonsData';
import { useGzipRegionFlightData } from '../hooks/useGzipRegionFlightData';
import { useYmapsLoader } from '../hooks/useYmapsLoader';
import FlightStatisticsOneReg from '../modules/FlightStatisticsOneReg/FlightStatisticsOneReg';
import MapComponent from '../modules/MapComponent/MapComponent';
import ButtonGoBack from '../ui/ButtonGoBack/ButtonGoBack';
import { initialDateRange } from '../utils/constant';
import { timeToDateConverter } from '../utils/functions';
import { loadYmapsScript } from '../utils/loadYmaps';
import { FlightStatsSkeleton, MapSkeleton } from '../utils/skeletons';

export const OneRegionMapPage = () => {
  const { id } = useParams();

  const [dateRange, setDateRange] = useState(null);
  const [dateQuery, setDateQuery] = useState(initialDateRange);

  const from = timeToDateConverter(dateQuery[0].toDate());
  const to = timeToDateConverter(dateQuery[1].toDate());

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
  } = useFlightData(flightData, dateRange);

  const oneRegionData = regionsPolygons?.features?.find(
    (obj) => String(obj.properties?.region_id) === String(id),
  );
  const regionCenter = oneRegionData?.properties?.center || [69, 100];

  const { errorLoadYmaps, ymapsLoading } = useYmapsLoader();

  const loading = ymapsLoading || flightLoading || regionsLoading;
  const error = flightError || regionsError;

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
        <FlightStatsSkeleton />
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
            <h1>{oneRegionData?.properties?.region || 'Регион России'}</h1>
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
          {`Ошибка: ${error}`}
        </div>
      </div>
    );
  }
  const regionName = oneRegionData?.properties?.region || 'Регион России';

  const chartsDataForExport = {
    dailyFlights,
    flightData,
    peakHourlyFlights,
    flightsByTimeOfDay,
    statistics,
  };

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
        points={filteredFlights}
        errorLoadYmaps={errorLoadYmaps}
        center={regionCenter}
        zoom={6}
      />
      <DateRangePicker dateRange={dateQuery} setDateRange={setDateQuery} />

      <FlightStatisticsOneReg
        dailyFlights={dailyFlights}
        flightsData={flightData}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        peakHourlyFlights={peakHourlyFlights}
        flightsByTimeOfDay={flightsByTimeOfDay}
        flightsDurationByRegion={flightsDurationByRegion}
      />
    </div>
  );
};

export default OneRegionMapPage;
