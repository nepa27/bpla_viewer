// components/common/ChartSortSelect.jsx
import { memo, useMemo } from 'react';

import { SORT_OPTIONS_CHART } from '../utils/constant';
import './ChartSortSelect.css';

const ChartSortSelect = memo(({ selectedOption, onChange, label = 'Показать:' }) => {
  const handleSelectChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className="chart-sort-select-container">
      <label htmlFor="chart-sort-select" className="chart-sort-select-label">
        {label}
      </label>
      <select
        id="chart-sort-select"
        value={selectedOption}
        onChange={handleSelectChange}
        className="chart-sort-select"
      >
        {SORT_OPTIONS_CHART.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

export default ChartSortSelect;
