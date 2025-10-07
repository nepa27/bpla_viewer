import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import DatePicker from './DatePicker';

describe('DatePicker', () => {
  it('should render with correct date range from, to', () => {
    const dateRange = ['2025-01-01T20:19:30.555Z', '2025-10-03T20:19:30.556Z'];
    const setDateRange = () => {};
    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    // expect(screen.getByText())
  });
  it.todo('should draw data for the last calendar year from today');
  it.todo('should render russian names of months and days');
  it.todo('should change dates range');
  it.todo('should be disabled if the date is selected further than today');
});
