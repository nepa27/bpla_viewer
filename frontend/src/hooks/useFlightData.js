// hooks/useFlightData.js
import { useState, useEffect, useMemo } from 'react';

export const useFlightData = (flightsData) => {
  const [dateRange, setDateRange] = useState(null);
  const [filteredFlights, setFilteredFlights] = useState([]);

  const dailyFlights = useMemo(() => {
    if (!flightsData) return [];
    
    const flightsByDate = flightsData.reduce((acc, flight) => {
      const date = flight.date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(flightsByDate)
      .map(([date, count]) => ({ date: new Date(date), count }))
      .sort((a, b) => a.date - b.date);
  }, [flightsData]);

  useEffect(() => {
    if (!dateRange || !flightsData) {
      setFilteredFlights(flightsData || []);
      return;
    }

    const [startDate, endDate] = dateRange;
    const filtered = (flightsData || []).filter(flight => {
      const flightDate = new Date(flight.date);
      return flightDate >= startDate && flightDate <= endDate;
    });

    setFilteredFlights(filtered);
  }, [dateRange, flightsData]);

  return {
    filteredFlights,
    dailyFlights,
    setDateRange
  };
};