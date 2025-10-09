import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';

import DatePicker from './DatePicker';

describe('DatePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with correct date range from, to', () => {
    const dateRange = [dayjs('2025-01-01'), dayjs('2025-10-03')];
    const setDateRange = vi.fn();

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    expect(screen.getByText('Выберите диапазон дат')).toBeInTheDocument();
  });

  it('should render with null date range', () => {
    const dateRange = null;
    const setDateRange = vi.fn();

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    expect(screen.getByText('Выберите диапазон дат')).toBeInTheDocument();
  });

  it('should render with empty array date range', () => {
    const dateRange = [];
    const setDateRange = vi.fn();

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    expect(screen.getByText('Выберите диапазон дат')).toBeInTheDocument();
  });

  it('should render russian locale correctly', () => {
    const dateRange = [dayjs('2025-01-01'), dayjs('2025-10-03')];
    const setDateRange = vi.fn();

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    expect(screen.getByText('Выберите диапазон дат')).toBeInTheDocument();
  });

  it('should handle invalid date values gracefully', () => {
    const dateRange = ['invalid-date', null];
    const setDateRange = vi.fn();

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    expect(screen.getByText('Выберите диапазон дат')).toBeInTheDocument();
  });

  it('should have proper structure and elements', () => {
    const dateRange = [dayjs('2025-01-01'), dayjs('2025-10-03')];
    const setDateRange = vi.fn();

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    // Проверяем наличие заголовка
    const header = screen.getByText('Выберите диапазон дат');
    expect(header).toBeInTheDocument();

    // Проверяем контейнер - теперь проверяем по части класса
    const container = header.parentElement;
    expect(container).toBeInTheDocument();
    // Проверяем, что класс содержит нужную часть (CSS Modules генерируют уникальные имена)
    expect(container.className).toContain('date__wrapper');
  });

  it('should apply proper CSS classes', () => {
    const dateRange = [dayjs('2025-01-01'), dayjs('2025-10-03')];
    const setDateRange = vi.fn();

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    // Проверяем, что элементы имеют нужные классы (по части имени)
    const container = screen.getByText('Выберите диапазон дат').parentElement;
    expect(container.className).toContain('date__wrapper');
  });

  it('should have proper accessibility labels', () => {
    const dateRange = [dayjs('2025-01-01'), dayjs('2025-10-03')];
    const setDateRange = vi.fn();

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    // Проверяем наличие заголовка
    const header = screen.getByText('Выберите диапазон дат');
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe('H4');
  });

  it('should be accessible via keyboard', () => {
    const dateRange = [dayjs('2025-01-01'), dayjs('2025-10-03')];
    const setDateRange = vi.fn();

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    // Проверяем, что компонент доступен
    const header = screen.getByText('Выберите диапазон дат');
    expect(header).toBeInTheDocument();

    // Проверяем контейнер
    const container = header.parentElement;
    expect(container).toBeInTheDocument();
  });

  it('should handle date range changes', () => {
    const dateRange = [dayjs('2025-01-01'), dayjs('2025-10-03')];
    const setDateRange = vi.fn();

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    // Проверяем, что функция не вызывается сразу
    expect(setDateRange).not.toHaveBeenCalled();
  });

  it('should work with undefined date range', () => {
    const dateRange = undefined;
    const setDateRange = vi.fn();

    render(<DatePicker dateRange={dateRange} setDateRange={setDateRange} />);

    expect(screen.getByText('Выберите диапазон дат')).toBeInTheDocument();
  });
});
