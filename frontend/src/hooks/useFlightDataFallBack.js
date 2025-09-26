// hooks/useFlightData.js
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useFlightDataFallBack = (flightsData) => {
  const [dateRange, setDateRange] = useState(null);
  const [filteredFlights, setFilteredFlights] = useState([]);

  // Оптимизированное вычисление ежедневных полетов
  const dailyFlights = useMemo(() => {
    if (!flightsData || flightsData.length === 0) return [];

    const flightsByDate = new Map();

    for (let i = 0; i < flightsData.length; i++) {
      const flight = flightsData[i];
      const date = flight.date;
      flightsByDate.set(date, (flightsByDate.get(date) || 0) + 1);
    }

    const result = Array.from(flightsByDate.entries())
      .map(([date, count]) => ({ date: new Date(date), count }))
      .sort((a, b) => a.date - b.date);

    return result;
  }, [flightsData]);

  // Новое: вычисление количества полетов по регионам
  const flightsByRegion = useMemo(() => {
    if (!filteredFlights || filteredFlights.length === 0) return new Map();

    const regionCounts = new Map();

    for (let i = 0; i < filteredFlights.length; i++) {
      const flight = filteredFlights[i];
      const region = flight.region || 'Не определен';
      regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
    }

    return regionCounts;
  }, [filteredFlights]); // Зависит от filteredFlights, которые обновляются при изменении dateRange

  // Оптимизированная фильтрация полетов
  const filterFlights = useCallback(() => {
    if (!flightsData || flightsData.length === 0) {
      setFilteredFlights([]);
      return;
    }

    if (!dateRange) {
      setFilteredFlights(flightsData);
      return;
    }

    const [startDate, endDate] = dateRange;
    const startCompareDate = new Date(startDate);
    const endCompareDate = new Date(endDate);
    startCompareDate.setHours(0, 0, 0, 0);
    endCompareDate.setHours(23, 59, 59, 999);

    const filtered = [];
    for (let i = 0; i < flightsData.length; i++) {
      const flight = flightsData[i];
      const flightDate = new Date(flight.date);
      const compareDate = new Date(flightDate);
      compareDate.setHours(0, 0, 0, 0);

      if (compareDate >= startCompareDate && compareDate <= endCompareDate) {
        filtered.push(flight);
      }
    }

    setFilteredFlights(filtered);
  }, [flightsData, dateRange]);

  useEffect(() => {
    filterFlights();
  }, [filterFlights]);

  return {
    filteredFlights,
    dailyFlights,
    flightsByRegion, // Возвращаем новое значение
    setDateRange,
  };
};
