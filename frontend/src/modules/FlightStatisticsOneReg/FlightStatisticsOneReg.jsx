/* eslint-disable no-unused-vars */
import { memo, useMemo } from 'react';

import { BrushableBarChart } from '../../components/BrushableBarChart';
import { FlightDurationChart } from '../../components/FlightDurationChart';
import { PeakHourlyFlightsChart } from '../../components/PeakHourlyFlightsChart';
import { PieChart } from '../../components/PieChart/PieChart';
import { useFlightFullData } from '../../hooks/useFlightFullData';
import TableInfoChart from '../../ui/TableInfoChart/TableInfoChart';
import { ChartsSkeletonStatistics } from '../../utils/skeletons';
import style from './FlightStatisticsOneReg.module.css';

const FlightStatisticsOneReg = memo(
  ({
    dailyFlights,
    flightsData,
    dateRange,
    onDateRangeChange,
    peakHourlyFlights,
    flightsByTimeOfDay,
  }) => {
    const { statistics } = useFlightFullData(flightsData, dateRange);

    const hasData = useMemo(() => {
      return (
        Array.isArray(dailyFlights) &&
        Array.isArray(peakHourlyFlights) &&
        Array.isArray(flightsByTimeOfDay) &&
        flightsData != null &&
        statistics != null
      );
    }, [dailyFlights, peakHourlyFlights, flightsByTimeOfDay, flightsData, statistics]);

    const dataTableInfo = useMemo(
      () => [
        {
          id: 1,
          name: 'Средняя продолжительность полета:',
          value: statistics?.averageFlightDuration || '—',
        },
        { id: 2, name: 'Дней без полетов:', value: statistics?.daysWithoutFlights || 0 },
        { id: 3, name: 'Всего полетов:', value: statistics?.totalFlights || 0 },
      ],
      [statistics],
    );

    if (!hasData) {
      return <ChartsSkeletonStatistics count={5} />;
    }

    return (
      <div className={style['chart-container']}>
        <TableInfoChart data={dataTableInfo} />
        <h3 className={style['chart-title']}>Количество полетов по датам</h3>
        <BrushableBarChart data={dailyFlights} onBrush={onDateRangeChange} />
        <h3 className={style['chart-title']}>Суммарная длительность полетов по датам</h3>
        <FlightDurationChart flightData={flightsData} dateRange={dateRange} />
        <h3 className={style['chart-title']}>Пиковая нагрузка по дням</h3>
        <PeakHourlyFlightsChart peakHourlyFlightsData={peakHourlyFlights} />
        <h3 className={style['chart-title']}>Распределение полетов по часам</h3>
        <PieChart data={flightsByTimeOfDay} />
      </div>
    );
  },
);

export default FlightStatisticsOneReg;
