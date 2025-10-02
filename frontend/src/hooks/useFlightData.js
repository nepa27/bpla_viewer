import { useEffect, useMemo, useState } from 'react';

export const useFlightData = (flightsData, dateRange = null) => {
  const [filteredFlights, setFilteredFlights] = useState([]);

  // Фильтрация полётов по диапазону дат
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
  }, [flightsData, dateRange]);

  // Вычисление полётов по времени суток (на основе takeoff_time)
  const flightsByTimeOfDay = useMemo(() => {
    if (!filteredFlights?.length) return [];

    const timeOfDayCounts = {
      Утро: 0, // 5:00 - 11:59
      День: 0, // 12:00 - 17:59
      Вечер: 0, // 18:00 - 23:59
      Ночь: 0, // 00:00 - 4:59
    };

    for (const flight of filteredFlights) {
      // Используем takeoff_time (например, "00:00")
      const [hours, minutes] = flight.takeoff_time.split(':').map(Number);

      if (hours >= 5 && hours < 12) {
        timeOfDayCounts['Утро']++;
      } else if (hours >= 12 && hours < 18) {
        timeOfDayCounts['День']++;
      } else if (hours >= 18 && hours < 24) {
        timeOfDayCounts['Вечер']++;
      } else {
        timeOfDayCounts['Ночь']++;
      }
    }

    return Object.entries(timeOfDayCounts)
      .map(([label, value]) => ({ label, value }))
      .filter((item) => item.value > 0);
  }, [filteredFlights]);

  // Ежедневные полеты
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

  // Количество полетов по регионам
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

  //  Суммарная длительность полетов по регионам
  const flightsDurationByRegion = useMemo(() => {
    if (!filteredFlights?.length) return [];

    const durationByRegion = new Map();

    for (const flight of filteredFlights) {
      const region = flight.region || 'Не определен';
      const duration = flight.durationMinutes || 0;
      const currentDuration = durationByRegion.get(region) || 0;
      durationByRegion.set(region, currentDuration + duration);
    }

    return Array.from(durationByRegion.entries())
      .map(([region, totalDurationMinutes]) => ({
        region,
        totalDurationMinutes,
      }))
      .sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);
  }, [filteredFlights]);

  // Вычисление пиковой нагрузки: максимальное число полетов за час для каждой даты
  const peakHourlyFlights = useMemo(() => {
    if (!filteredFlights?.length) return [];

    const dailyPeakData = new Map();

    for (const flight of filteredFlights) {
      const flightDateStr = flight.date; // "2025-01-01"

      if (!dailyPeakData.has(flightDateStr)) {
        dailyPeakData.set(flightDateStr, new Map());
      }

      const hourlyCounts = dailyPeakData.get(flightDateStr);

      // Парсим время взлета и посадки
      const [startHours, startMinutes] = flight.takeoff_time.split(':').map(Number);
      const [endHours, endMinutes] = flight.landing_time.split(':').map(Number);

      const flightDate = new Date(flightDateStr);

      // Определяем все часы, когда полет активен
      const startTime = new Date(flightDate);
      startTime.setHours(startHours, startMinutes, 0, 0);

      const endTime = new Date(flightDate);
      endTime.setHours(endHours, endMinutes, 0, 0);

      // Генерируем все часы между началом и окончанием полета
      const currentHour = new Date(startTime);
      while (currentHour <= endTime) {
        // Создаем ключ для часа в формате YYYY-MM-DDTHH:00:00
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

      let peakHour;
      if (peakHourISO) {
        peakHour = new Date(peakHourISO);
      } else {
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);
        peakHour = dateObj;
      }

      result.push({
        date,
        maxFlights,
        peakHour,
      });
    }

    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    return result;
  }, [filteredFlights]);

  // Вычисление статистики
  const statistics = useMemo(() => {
    if (!flightsData?.length) {
      return {
        averageFlightDuration: '0 ч 0 мин',
        daysWithoutFlights: 0,
        totalFlights: 0,
      };
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
        filteredFlights.map((flight) => new Date(flight.date).toDateString()),
      );

      daysWithoutFlights = Math.max(0, totalDaysInRange - uniqueFlightDates.size);
    } else {
      if (flightsData.length > 0) {
        const allDates = flightsData.map((flight) => new Date(flight.date));
        const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

        const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

        const uniqueFlightDates = new Set(
          flightsData.map((flight) => new Date(flight.date).toDateString()),
        );

        daysWithoutFlights = Math.max(0, totalDays - uniqueFlightDates.size);
      }
    }

    return {
      averageFlightDuration,
      daysWithoutFlights,
      totalFlights,
    };
  }, [filteredFlights, dateRange, flightsData]);

  return {
    filteredFlights,
    dailyFlights,
    flightsByRegion,
    flightsDurationByRegion,
    peakHourlyFlights,
    flightsByTimeOfDay,
    statistics,
  };
};
