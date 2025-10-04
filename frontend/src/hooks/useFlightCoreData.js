// hooks/useFlightCoreData.js
import { useEffect, useMemo, useState } from 'react';

export const useFlightCoreData = (flightsData, dateRange = null) => {
  const [filteredFlights, setFilteredFlights] = useState([]);

  useEffect(() => {
    if (!flightsData?.length) {
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

    const filtered = flightsData.filter((flight) => {
      const flightDate = new Date(flight.date);
      const compareDate = new Date(flightDate);
      compareDate.setHours(0, 0, 0, 0);
      return compareDate >= startCompareDate && compareDate <= endCompareDate;
    });

    setFilteredFlights(filtered);
  }, [dateRange, flightsData]);

  const dailyFlights = useMemo(() => {
    if (!flightsData?.length) return [];

    const flightsByDate = new Map();
    for (const flight of flightsData) {
      const date = flight.date;
      flightsByDate.set(date, (flightsByDate.get(date) || 0) + 1);
    }

    return Array.from(flightsByDate.entries())
      .map(([date, count]) => ({
        date: new Date(date),
        count,
      }))
      .sort((a, b) => a.date - b.date);
  }, [flightsData]);

  const flightsByRegion = useMemo(() => {
    if (!filteredFlights?.length) return [];

    const regionCounts = new Map();
    for (const flight of filteredFlights) {
      const region = flight.region || 'Не определен';
      regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
    }

    return Array.from(regionCounts.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredFlights]);

  const flightsDurationByRegion = useMemo(() => {
    if (!filteredFlights?.length) return [];

    const durationByRegion = new Map();
    for (const flight of filteredFlights) {
      const region = flight.region || 'Не определен';
      const duration = flight.durationMinutes || 0;
      durationByRegion.set(region, (durationByRegion.get(region) || 0) + duration);
    }

    return Array.from(durationByRegion.entries())
      .map(([region, totalDurationMinutes]) => ({ region, totalDurationMinutes }))
      .sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);
  }, [filteredFlights]);

  return {
    filteredFlights,
    dailyFlights,
    flightsByRegion,
    flightsDurationByRegion,
  };
};
