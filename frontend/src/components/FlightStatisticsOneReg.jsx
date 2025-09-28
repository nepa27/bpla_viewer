// components/FlightStatistics.jsx
/* eslint-disable no-unused-vars */
import { useState } from 'react';

import { useData } from '../hooks/useData';
import { useFlightData } from '../hooks/useFlightData';
import { BrushableBarChart } from './BrushableBarChart';
import { FlightDurationChart } from './FlightDurationChart/FlightDurationChart';
import { PeakHourlyFlightsChart } from './PeakHourlyFlightsChart/PeakHourlyFlightsChart';
import { PieChart } from './PieChart/PieChart';
import TableInfoChart from './TableInfoChart/TableInfoChart';

const FlightStatisticsOneReg = ({
  dateRange,
  dailyFlights,
  flightsData,
  flightsByRegion,
  flightsDurationByRegion,
  onDateRangeChange,
  flightsByTimeOfDay,
  peakHourlyFlights,
}) => {
  const stats = {
    averageFlightDuration: flightsDurationByRegion
      ? (
          flightsDurationByRegion.reduce((sum, flight) => sum + flight.totalDurationMinutes, 0) /
          flightsDurationByRegion.length
        ).toFixed(2)
      : 0,
    daysWithoutFlights: dailyFlights ? dailyFlights.filter((day) => day.count === 0).length : 0,
    totalFlights: dailyFlights ? dailyFlights.reduce((sum, day) => sum + day.count, 0) : 0,
    peakHourlyFlights: peakHourlyFlights.length > 0 ? peakHourlyFlights[0].maxFlights : 0,
  };

  const { data: flightData, loading, error } = useData(); // ✅ Убран data:

  if (loading) {
    return (
      <div className="chart-container">
        <div>Загрузка графиков...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div>Ошибка: {error}</div>
      </div>
    );
  }

  if (!flightsData) {
    return (
      <div className="chart-container">
        <div>Нет данных для отображения</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <TableInfoChart data={stats} />
      <h3 className="chart-title">Количество полетов по датам</h3>
      <BrushableBarChart data={dailyFlights} onBrush={onDateRangeChange} />
      <h3 className="chart-title">Пиковая нагрузка по дням</h3>
      <PeakHourlyFlightsChart
        peakHourlyFlightsData={peakHourlyFlights}
        onBrush={onDateRangeChange}
      />

      <h3 className="chart-title">Суммарная длительность полетов по датам</h3>
      <FlightDurationChart flightData={flightsData} dateRange={dateRange} />
      <h3 className="chart-title">Распределение полетов по часам</h3>
      <PieChart data={flightsByTimeOfDay} />
    </div>
  );
};

export default FlightStatisticsOneReg;

// // components/FlightStatistics.jsx
// /* eslint-disable no-unused-vars */
// import { useState } from 'react';

// import { useData } from '../hooks/useData';
// import { BrushableBarChart } from './BrushableBarChart';
// import { FlightDurationChart } from './FlightDurationChart/FlightDurationChart';
// import { PeakHourlyFlightsChart } from './PeakHourlyFlightsChart/PeakHourlyFlightsChart';
// import { PieChart } from './PieChart/PieChart';
// import TableInfoChart from './TableInfoChart/TableInfoChart';

// const FlightStatisticsOneReg = ({
//   dailyFlights,
//   flightsByRegion,
//   flightsDurationByRegion,
//   flightsByTimeOfDay,
//   onDateRangeChange,
// }) => {
//   const stats = {
//     averageFlightDuration: flightsDurationByRegion
//       ? (
//           flightsDurationByRegion.reduce((sum, flight) => sum + flight.totalDurationMinutes, 0) /
//           flightsDurationByRegion.length
//         ).toFixed(2)
//       : 0,
//     daysWithoutFlights: dailyFlights ? dailyFlights.filter((day) => day.count === 0).length : 0,
//     totalFlights: dailyFlights ? dailyFlights.reduce((sum, day) => sum + day.count, 0) : 0,
//   };

//   const { data: flightData, loading, error } = useData();

//   // ✅ Добавим состояние для dateRange
//   const [dateRange, setDateRange] = useState(null);
//   return (
//     <div className="chart-container">
//       <TableInfoChart data={stats} />
//       <h3 className="chart-title">Количество полетов по датам</h3>
//       <BrushableBarChart data={dailyFlights} onBrush={setDateRange} />
//       <h3 className="chart-title">Суммарная длительность полетов по датам</h3>
//       <FlightDurationChart flightData={flightData} dateRange={dateRange} />
//       <h3 className="chart-title">Распределение полетов по часам</h3>
//       <PieChart data={flightsByTimeOfDay} />
//     </div>
//   );
// };

// export default FlightStatisticsOneReg;
// // components/FlightStatistics.jsx
// /* eslint-disable no-unused-vars */
// import { useState } from 'react';

// import { useData } from '../hooks/useData';
// import { BrushableBarChart } from './BrushableBarChart';
// import { FlightDurationChart } from './FlightDurationChart/FlightDurationChart';
// import { PeakHourlyFlightsChart } from './PeakHourlyFlightsChart/PeakHourlyFlightsChart';
// import { PieChart } from './PieChart/PieChart';
// import TableInfoChart from './TableInfoChart/TableInfoChart';

// const FlightStatisticsOneReg = ({
//   dailyFlights,
//   flightsByRegion,
//   flightsDurationByRegion,
//   flightsByTimeOfDay,
//   onDateRangeChange,
// }) => {
//   const stats = {
//     averageFlightDuration: flightsDurationByRegion
//       ? (
//           flightsDurationByRegion.reduce((sum, flight) => sum + flight.totalDurationMinutes, 0) /
//           flightsDurationByRegion.length
//         ).toFixed(2)
//       : 0,
//     daysWithoutFlights: dailyFlights ? dailyFlights.filter((day) => day.count === 0).length : 0,
//     totalFlights: dailyFlights ? dailyFlights.reduce((sum, day) => sum + day.count, 0) : 0,
//   };

//   const pieData = [
//     { label: 'Утро', value: 35 },
//     { label: 'День', value: 40 },
//     { label: 'Вечер', value: 25 },
//   ];

//   const { data: flightData, loading, error } = useData();

//   // ✅ Добавим состояние для dateRange
//   const [dateRange, setDateRange] = useState(null);
//   return (
//     <div className="chart-container">
//       <TableInfoChart data={stats} />
//       <h3 className="chart-title">Количество полетов по датам</h3>
//       <BrushableBarChart data={dailyFlights} onBrush={setDateRange} />
//       <h3 className="chart-title">Суммарная длительность полетов по датам</h3>
//       <FlightDurationChart flightData={flightData} dateRange={dateRange} />
//       <h3 className="chart-title">Распределение полетов по часам</h3>
//       <PieChart data={pieData} />
//     </div>
//   );
// };

// export default FlightStatisticsOneReg;
// /* eslint-disable no-unused-vars */
// import { BrushableBarChart } from './BrushableBarChart';

// const FlightStatistics = ({ dailyFlights, onDateRangeChange }) => {
//   return (
//     <div className="chart-container">
//       <h3 className="chart-title">Количество полетов по регионам</h3>
//       <BrushableBarChart data={dailyFlights} onBrush={onDateRangeChange} />
//     </div>
//   );
// };

// export default FlightStatistics;

// // FlightStatistics.jsx
// import { BrushableBarChart } from './BrushableBarChartUniversal/BrushableBarChart';

// const FlightStatistics = ({ dailyFlights, onDateRangeChange }) => {
//   // Преобразование данных в формат, ожидаемый универсальным компонентом
//   const chartData = (dailyFlights || [])
//     .filter(item => item.date instanceof Date && !isNaN(item.date) && typeof item.count === 'number')
//     .map(item => ({
//       label: item.date, // Передаем сам объект Date как label
//       value: item.count,
//       originalDate: item.date // И сохраняем его как originalDate для брашинга
//     }))
//     // Сортируем по дате, как в оригинальном коде
//     .sort((a, b) => a.label - b.label);

//   return (
//     <div className="chart-container">
//       <h3 className="chart-title">Статистика полетов за год</h3>
//       <BrushableBarChart
//         data={chartData}
//         onBrush={onDateRangeChange} // Просто передаем напрямую
//         orientation="vertical" // или "horizontal"
//         xAxisLabel="Дата"
//         yAxisLabel="Количество полетов"
//       />
//     </div>
//   );
// };

// export default FlightStatistics;
