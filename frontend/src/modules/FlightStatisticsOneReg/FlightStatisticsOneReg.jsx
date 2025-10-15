/* eslint-disable no-unused-vars */
import { memo, useMemo } from 'react';

import { BrushableBarChart } from '../../components/BrushableBarChart';
import { FlightDurationChart } from '../../components/FlightDurationChart';
import { PeakHourlyFlightsChart } from '../../components/PeakHourlyFlightsChart';
import { PieChart } from '../../components/PieChart/PieChart';
import DateRangeShower from '../../ui/DateRangeShower/DateRangeShower';
import TableInfoChart from '../../ui/TableInfoChart/TableInfoChart';
import { ChartsSkeletonStatistics } from '../../utils/skeletons';
import style from './FlightStatisticsOneReg.module.css';

const FlightStatisticsOneReg = memo(
  ({
    dailyFlights,
    dateRange,
    onDateRangeChange,
    statistics,
    peakHourlyFlights,
    flightsByTimeOfDay,
    flightDurationByDate,
  }) => {
    const hasData = useMemo(() => {
      return (
        Array.isArray(dailyFlights) &&
        Array.isArray(peakHourlyFlights) &&
        Array.isArray(flightsByTimeOfDay) &&
        Array.isArray(flightDurationByDate) &&
        statistics != null
      );
    }, [dailyFlights, peakHourlyFlights, flightsByTimeOfDay, statistics, flightDurationByDate]);

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
        {dateRange && <DateRangeShower dateRange={dateRange} />}
        <BrushableBarChart data={dailyFlights} onBrush={onDateRangeChange} />
        <h3 className={style['chart-title']}>Суммарная длительность полетов по датам</h3>
        <FlightDurationChart data={flightDurationByDate} />
        <h3 className={style['chart-title']}>Пиковая нагрузка по дням</h3>
        <PeakHourlyFlightsChart peakHourlyFlightsData={peakHourlyFlights} />
        <h3 className={style['chart-title']}>Распределение полетов по часам</h3>
        <PieChart data={flightsByTimeOfDay} />
      </div>
    );
  },
);

export default FlightStatisticsOneReg;
