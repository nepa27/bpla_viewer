import { memo } from 'react';

import { SORT_OPTIONS_CHART } from '../../utils/constant';
import style from './ChartSortSelect.module.css';

const ChartSortSelect = memo(({ selectedOption, onChange, label = 'Показать:' }) => {
  const handleSelectChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div className={style['chart-sort-select-container']}>
      <label htmlFor="chart-sort-select" className={style['chart-sort-select-label']}>
        {label}
      </label>
      <select
        id="chart-sort-select"
        value={selectedOption}
        onChange={handleSelectChange}
        className={style['chart-sort-select']}
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
