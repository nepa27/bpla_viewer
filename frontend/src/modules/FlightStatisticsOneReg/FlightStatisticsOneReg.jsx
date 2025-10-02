/* eslint-disable no-unused-vars */
import { memo, useMemo } from 'react';

import { BrushableBarChart } from '../../components/BrushableBarChart';
import { FlightDurationChart } from '../../components/FlightDurationChart';
import { PeakHourlyFlightsChart } from '../../components/PeakHourlyFlightsChart';
import { PieChart } from '../../components/PieChart/PieChart';
import { useFlightData } from '../../hooks/useFlightData';
import TableInfoChart from '../../ui/TableInfoChart/TableInfoChart';
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
    const { statistics } = useFlightData(flightsData, dateRange);

    const dataTableInfo = useMemo(
      () => [
        {
          id: 1,
          name: 'Средняя продолжительность полета:',
          value: statistics.averageFlightDuration,
        },
        { id: 2, name: 'Дней без полетов:', value: statistics.daysWithoutFlights },
        { id: 3, name: 'Всего полетов:', value: statistics.totalFlights },
      ],
      [statistics],
    );

    if (!flightsData) {
      return (
        <div className={style['chart-container']}>
          <div>Нет данных для отображения</div>
        </div>
      );
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
