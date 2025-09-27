// components/FlightStatistics.jsx
/* eslint-disable no-unused-vars */
import { BrushableBarChart } from './BrushableBarChart';

const FlightStatisticsOneReg = ({
  dailyFlights,
  flightsByRegion,
  flightsDurationByRegion,
  onDateRangeChange,
}) => {
  return (
    <div className="chart-container">
      <h3 className="chart-title">Количество полетов по датам</h3>
      <BrushableBarChart data={dailyFlights} onBrush={onDateRangeChange} />


    </div>
  );
};

export default FlightStatisticsOneReg;

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
