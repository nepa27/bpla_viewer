import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';

import DatePicker from './DatePicker';

describe('DatePicker', () => {
  const setDateRange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with correct date range from, to', () => {
    const dateRange = [dayjs('2025-01-01'), dayjs('2025-10-03')];

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    expect(screen.getByPlaceholderText('Начало')).toHaveValue('01.01.2025');
    expect(screen.getByPlaceholderText('Окончание')).toHaveValue('03.10.2025');
  });

  it.todo('should handle date range changes correct', async () => {
    //@TODO
    const dateRange = [dayjs('2025-01-01'), dayjs('2025-10-03')];

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);
    const inputFrom = screen.getByPlaceholderText('Начало');
    const inputTo = screen.getByPlaceholderText('Окончание');

    expect(setDateRange).not.toHaveBeenCalled();

    await userEvent.type(inputFrom, '01.01.2025');
    await userEvent.type(inputTo, '03.10.2025');

    expect(setDateRange).toHaveBeenCalledTimes(2);
  });

  it('should render default value if date range', () => {
    const dateRange = undefined;
    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    expect(screen.getByPlaceholderText('Начало')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Окончание')).toBeInTheDocument();
  });

  it.todo('should render russian locale correctly', () => {
    //@TODO
    const dateRange = [dayjs('2025-01-01'), dayjs('2025-10-03')];

    const { container } = render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);
    const datePickerHeader = container.parentElement.querySelector('.ant-picker-header');

    expect(screen.getByText('Выберите диапазон дат')).toBeInTheDocument();
    expect(datePickerHeader).toBeInTheDocument();
  });

  it('should apply proper CSS classes', () => {
    const dateRange = [dayjs('2025-01-01'), dayjs('2025-10-03')];

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    const container = screen.getByText('Выберите диапазон дат').parentElement;
    expect(container.className).toContain('date__wrapper');
  });

  it('should have proper accessibility labels', () => {
    const dateRange = [dayjs('2025-01-01'), dayjs('2025-10-03')];

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    const header = screen.getByText('Выберите диапазон дат');
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe('H4');
  });
});
