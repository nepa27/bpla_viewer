// hooks/useFlightFullData.js
import { useMemo } from 'react';

import { useFlightCoreData } from './useFlightCoreData';

export const useFlightFullData = (flightsData, dateRange = null) => {
  const core = useFlightCoreData(flightsData, dateRange);

  const { filteredFlights } = core;

  // flightsByTimeOfDay
  const flightsByTimeOfDay = useMemo(() => {
    if (!filteredFlights?.length) return [];

    const timeOfDayCounts = { Утро: 0, День: 0, Вечер: 0, Ночь: 0 };

    for (const flight of filteredFlights) {
      const [hours] = flight.takeoff_time.split(':').map(Number);
      if (hours >= 5 && hours < 12) timeOfDayCounts['Утро']++;
      else if (hours >= 12 && hours < 18) timeOfDayCounts['День']++;
      else if (hours >= 18 && hours < 24) timeOfDayCounts['Вечер']++;
      else timeOfDayCounts['Ночь']++;
    }

    return Object.entries(timeOfDayCounts)
      .map(([label, value]) => ({ label, value }))
      .filter((item) => item.value > 0);
  }, [filteredFlights]);

  // peakHourlyFlights
  const peakHourlyFlights = useMemo(() => {
    if (!filteredFlights?.length) return [];

    const dailyPeakData = new Map();

    for (const flight of filteredFlights) {
      const flightDateStr = flight.date;
      if (!dailyPeakData.has(flightDateStr)) {
        dailyPeakData.set(flightDateStr, new Map());
      }

      const hourlyCounts = dailyPeakData.get(flightDateStr);
      const [startHours, startMinutes] = flight.takeoff_time.split(':').map(Number);
      const [endHours, endMinutes] = flight.landing_time.split(':').map(Number);

      const flightDate = new Date(flightDateStr);
      const startTime = new Date(flightDate);
      startTime.setHours(startHours, startMinutes, 0, 0);
      const endTime = new Date(flightDate);
      endTime.setHours(endHours, endMinutes, 0, 0);

      const currentHour = new Date(startTime);
      while (currentHour <= endTime) {
        const hourKey = new Date(currentHour);
        hourKey.setMinutes(0, 0, 0);
        const hourStr = hourKey.toISOString().slice(0, 13) + ':00:00.000Z';
        hourlyCounts.set(hourStr, (hourlyCounts.get(hourStr) || 0) + 1);
        currentHour.setHours(currentHour.getHours() + 1);
      }
    }

    const result = [];
    for (const [date, hourlyCounts] of dailyPeakData.entries()) {
      let maxFlights = 0;
      let peakHourISO = null;
      for (const [hourKey, count] of hourlyCounts.entries()) {
        if (count > maxFlights) {
          maxFlights = count;
          peakHourISO = hourKey;
        }
      }

      const peakHour = peakHourISO ? new Date(peakHourISO) : new Date(date);
      result.push({ date, maxFlights, peakHour });
    }

    result.sort((a, b) => new Date(a.date) - new Date(b.date));
    return result;
  }, [filteredFlights]);

  // statistics
  const statistics = useMemo(() => {
    if (!flightsData?.length) {
      return { averageFlightDuration: '0 ч 0 мин', daysWithoutFlights: 0, totalFlights: 0 };
    }

    const totalFlights = filteredFlights.length;
    const totalDurationMinutes = filteredFlights.reduce(
      (sum, flight) => sum + (flight.durationMinutes || 0),
      0,
    );

    let averageFlightDuration = '0 ч 0 мин';
    if (totalFlights > 0) {
      const avgMinutes = totalDurationMinutes / totalFlights;
      const hours = Math.floor(avgMinutes / 60);
      const minutes = Math.round(avgMinutes % 60);
      averageFlightDuration = `${hours} ч ${minutes} мин`;
    }

    let daysWithoutFlights = 0;
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const totalDaysInRange = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      const uniqueFlightDates = new Set(
        filteredFlights.map((f) => new Date(f.date).toDateString()),
      );
      daysWithoutFlights = Math.max(0, totalDaysInRange - uniqueFlightDates.size);
    } else {
      if (flightsData.length > 0) {
        const allDates = flightsData.map((f) => new Date(f.date));
        const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
        const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
        const uniqueFlightDates = new Set(flightsData.map((f) => new Date(f.date).toDateString()));
        daysWithoutFlights = Math.max(0, totalDays - uniqueFlightDates.size);
      }
    }

    return { averageFlightDuration, daysWithoutFlights, totalFlights };
  }, [filteredFlights, dateRange, flightsData]);

  return {
    ...core,
    flightsByTimeOfDay,
    peakHourlyFlights,
    statistics,
  };
};
