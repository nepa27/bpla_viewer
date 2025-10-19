import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { formatDuration } from '../../utils/functions';
import { useFlightFullData } from '../useFlightFullData';

const mockUseFlightCoreData = vi.fn();

describe('useFlightFullData', () => {
  let mockFlightsData;
  let mockDateRange;

  beforeEach(() => {
    mockDateRange = [new Date('2025-01-01'), new Date('2025-01-03')];
    mockFlightsData = [
      {
        id: '7773422',
        date: '2025-01-01',
        takeoff_time: '11:30',
        landing_time: '13:40',
        durationMinutes: 688,
      },
      {
        id: '7773423',
        date: '2025-01-01',
        takeoff_time: '13:30',
        landing_time: '15:40',
        durationMinutes: 688,
      },
      {
        id: '7773424',
        date: '2025-01-02',
        takeoff_time: '19:30',
        landing_time: '21:40',
        durationMinutes: 688,
      },
    ];

    mockUseFlightCoreData.mockReturnValue({
      filteredFlights: mockFlightsData,
      dailyFlights: [],
      flightsByRegion: {},
      flightsDurationByRegion: {},
    });
  });

  it('should expand useFlightCoreData and return its object', () => {
    const { result } = renderHook(() => useFlightFullData(mockFlightsData, mockDateRange));
    expect(result.current).toHaveProperty('filteredFlights');
    expect(result.current).toHaveProperty('dailyFlights');
    expect(result.current).toHaveProperty('flightsByRegion');
    expect(result.current).toHaveProperty('flightsDurationByRegion');
  });

  it('should return an object with correct properties', () => {
    const { result } = renderHook(() => useFlightFullData(mockFlightsData, mockDateRange));
    expect(result.current).toHaveProperty('flightsByTimeOfDay');
    expect(result.current).toHaveProperty('peakHourlyFlights');
    expect(result.current).toHaveProperty('statistics');
    expect(result.current).toHaveProperty('flightDurationByDate');

    const { flightsByTimeOfDay, peakHourlyFlights, statistics, flightDurationByDate } =
      result.current;

    const averageFlightDuration =
      mockFlightsData.reduce((acc, cur) => (acc += +cur.durationMinutes), 0) /
      mockFlightsData.length;

    const timeStr = formatDuration(averageFlightDuration);

    expect(Array.isArray(flightsByTimeOfDay)).toBe(true);
    expect(flightsByTimeOfDay.length).toBe(3);

    // Проверка peakHourlyFlights
    expect(Array.isArray(peakHourlyFlights)).toBe(true);
    expect(peakHourlyFlights.length).toBe(2);

    // Проверка statistics
    expect(typeof statistics).toBe('object');
    expect(statistics.averageFlightDuration).toBe(timeStr); //('11 ч 28 мин');
    expect(statistics.daysWithoutFlights).toBe(1);
    expect(statistics.totalFlights).toBe(3);

    // Проверка flightDurationByDate
    expect(Array.isArray(flightDurationByDate)).toBe(true);
    expect(flightDurationByDate.length).toBe(2);
  });

  it('should calculate flightsByTimeOfDay correctly', () => {
    const { result } = renderHook(() => useFlightFullData(mockFlightsData, mockDateRange));
    const flightsByTimeOfDay = result.current.flightsByTimeOfDay;

    expect(flightsByTimeOfDay).toEqual([
      { label: 'Утро', value: 1 },
      { label: 'День', value: 1 },
      { label: 'Вечер', value: 1 },
    ]);
  });

  it('should calculate peakHourlyFlights correctly', () => {
    const { result } = renderHook(() => useFlightFullData(mockFlightsData, mockDateRange));
    const peakHourlyFlights = result.current.peakHourlyFlights;
    expect(peakHourlyFlights).toEqual([
      {
        date: '2025-01-01',
        maxFlights: 2,
        peakHour: new Date('2025-01-01T10:00:00.000Z'),
      },
      {
        date: '2025-01-02',
        maxFlights: 1,
        peakHour: new Date('2025-01-02T16:00:00.000Z'),
      },
    ]);
  });

  it('should calculate statistics correctly', () => {
    const { result } = renderHook(() => useFlightFullData(mockFlightsData, mockDateRange));
    const statistics = result.current.statistics;

    expect(statistics).toEqual({
      averageFlightDuration: '11 ч 28 мин',
      daysWithoutFlights: 1,
      totalFlights: 3,
    });
  });

  it('should calculate flightDurationByDate correctly', () => {
    const { result } = renderHook(() => useFlightFullData(mockFlightsData, mockDateRange));
    const flightDurationByDate = result.current.flightDurationByDate;

    expect(flightDurationByDate).toEqual([
      {
        date: new Date('2025-01-01'),
        value: 688 * 2,
      },
      {
        date: new Date('2025-01-02'),
        value: 688,
      },
    ]);
  });
});
