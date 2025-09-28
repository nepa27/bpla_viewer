import './TableInfoChart.css';

const TableInfoChart = ({ data }) => {
  return (
    <div className="info-board">
      <div className="info-item">
        <span className="info-label">Средняя продолжительность полета:</span>
        <span className="info-value">{data.averageFlightDuration} ч</span>
      </div>
      <div className="info-item">
        <span className="info-label">Дней без полетов:</span>
        <span className="info-value">{data.daysWithoutFlights}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Всего полетов:</span>
        <span className="info-value">{data.totalFlights}</span>
      </div>
    </div>
  );
};

export default TableInfoChart;
