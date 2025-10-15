/* eslint-disable no-unused-vars */
import { memo, useCallback } from 'react';

import { BrushableBarChart } from '../../components/BrushableBarChart';
import { RegionDurationChart } from '../../components/RegionDurationChart/RegionDurationChart';
import { RegionFlightsChart } from '../../components/RegionFlightsChart/RegionFlightsChart';
import DateRangeShower from '../../ui/DateRangeShower/DateRangeShower';
import { ChartsSkeletonStatistics } from '../../utils/skeletons';
import style from './FlightStatistics.module.css';

const FlightStatistics = memo(
  ({ dailyFlights, dateRange, flightsByRegion, flightsDurationByRegion, onDateRangeChange }) => {
    const handleBrush = useCallback(
      (range) => {
        onDateRangeChange(range);
      },
      [onDateRangeChange],
    );

    const hasData =
      Array.isArray(dailyFlights) &&
      Array.isArray(flightsByRegion) &&
      Array.isArray(flightsDurationByRegion);

    return (
      <div className={style['chart-container']}>
        {hasData ? (
          <>
            <h3 className={style['chart-title']}>Количество полетов по датам</h3>
            {dateRange && <DateRangeShower dateRange={dateRange} />}
            <BrushableBarChart data={dailyFlights} onBrush={handleBrush} />

            <h3 className={style['chart-title']}>Количество полетов по регионам</h3>
            <RegionFlightsChart data={flightsByRegion} />

            <h3 className={style['chart-title']}>Суммарная длительность полетов по регионам</h3>
            <RegionDurationChart data={flightsDurationByRegion} />
          </>
        ) : (
          <ChartsSkeletonStatistics count={3} />
        )}
      </div>
    );
  },
);

export default FlightStatistics;
