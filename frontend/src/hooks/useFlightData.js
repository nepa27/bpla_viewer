import { useEffect, useMemo, useState } from 'react';

export const useFlightData = (flightsData, dateRange = null) => {
  const [filteredFlights, setFilteredFlights] = useState([]);

  // ✅ Фильтрация полётов по диапазону дат
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

  // ✅ Вычисление полётов по времени суток (на основе takeoff_time)
  const flightsByTimeOfDay = useMemo(() => {
    if (!filteredFlights?.length) return [];

    const timeOfDayCounts = {
      Утро: 0, // 5:00 - 11:59
      День: 0, // 12:00 - 17:59
      Вечер: 0, // 18:00 - 23:59
      Ночь: 0, // 00:00 - 4:59
    };

    for (const flight of filteredFlights) {
      // ✅ Используем takeoff_time (например, "00:00")
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

  // Оптимизированное вычисление ежедневных полетов
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

  // Вычисление количества полетов по регионам
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

  // Вычисление суммарной длительности полетов по регионам
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

  // Вычисление пиковой нагрузки: максимальное число полетов за час
  // Вычисление пиковой нагрузки: максимальное число полетов за час для каждой даты
  const peakHourlyFlights = useMemo(() => {
    if (!filteredFlights?.length) return [];

    // Создаем Map для хранения данных по каждой дате
    const dailyPeakData = new Map();

    // Для каждого полета создаем временные интервалы
    for (const flight of filteredFlights) {
      const flightDateStr = flight.date; // "2025-01-01"

      // Если еще не создана запись для этой даты, создаем ее
      if (!dailyPeakData.has(flightDateStr)) {
        dailyPeakData.set(flightDateStr, new Map());
      }

      const hourlyCounts = dailyPeakData.get(flightDateStr);

      // Парсим время взлета и посадки
      const [startHours, startMinutes] = flight.takeoff_time.split(':').map(Number);
      const [endHours, endMinutes] = flight.landing_time.split(':').map(Number);

      // Создаем дату для полета
      const flightDate = new Date(flightDateStr);

      // Определяем все часы, когда полет активен
      const startTime = new Date(flightDate);
      startTime.setHours(startHours, startMinutes, 0, 0);

      const endTime = new Date(flightDate);
      endTime.setHours(endHours, endMinutes, 0, 0);

      // Генерируем все часы между началом и окончанием полета
      const currentHour = new Date(startTime);
      while (currentHour <= endTime) {
        // Создаем ключ для часа (год, месяц, день, час)
        const hourKey = `${currentHour.getFullYear()}-${String(currentHour.getMonth() + 1).padStart(2, '0')}-${String(currentHour.getDate()).padStart(2, '0')}T${String(currentHour.getHours()).padStart(2, '0')}:00`;

        // Увеличиваем счетчик для этого часа
        hourlyCounts.set(hourKey, (hourlyCounts.get(hourKey) || 0) + 1);

        // Переходим к следующему часу
        currentHour.setHours(currentHour.getHours() + 1);
      }
    }

    // Находим максимальное количество полетов для каждой даты
    const result = [];

    for (const [date, hourlyCounts] of dailyPeakData.entries()) {
      let maxFlights = 0;
      let peakHour = null;

      for (const [hourKey, count] of hourlyCounts.entries()) {
        if (count > maxFlights) {
          maxFlights = count;
          peakHour = new Date(hourKey);
        }
      }

      result.push({
        date,
        maxFlights,
        peakHour,
      });
    }

    // Сортируем по дате
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    return result;
  }, [filteredFlights]);

  return {
    filteredFlights,
    dailyFlights,
    flightsByRegion,
    flightsDurationByRegion,
    peakHourlyFlights,
    flightsByTimeOfDay,
  };
};

// import { useCallback, useEffect, useMemo, useState } from 'react';

// export const useFlightData = (flightsData) => {
//   const [dateRange, setDateRange] = useState(null);
//   const [filteredFlights, setFilteredFlights] = useState([]);

//   // ✅ Фильтрация полётов по диапазону дат
//   const filterFlights = useCallback(() => {
//     if (!flightsData?.length) {
//       setFilteredFlights([]);
//       return;
//     }

//     if (!dateRange) {
//       setFilteredFlights(flightsData);
//       return;
//     }

//     const [startDate, endDate] = dateRange;
//     const startCompareDate = new Date(startDate);
//     const endCompareDate = new Date(endDate);

//     startCompareDate.setHours(0, 0, 0, 0);
//     endCompareDate.setHours(23, 59, 59, 999);

//     const filtered = flightsData.filter((flight) => {
//       const flightDate = new Date(flight.date);
//       const compareDate = new Date(flightDate);
//       compareDate.setHours(0, 0, 0, 0);
//       return compareDate >= startCompareDate && compareDate <= endCompareDate;
//     });

//     setFilteredFlights(filtered);
//   }, [flightsData, dateRange]);

//   useEffect(() => {
//     filterFlights();
//   }, [filterFlights]);

//   // ✅ Вычисление полётов по времени суток (на основе takeoff_time)
//   const flightsByTimeOfDay = useMemo(() => {
//     if (!flightsData?.length) return [];

//     const timeOfDayCounts = {
//       Утро: 0, // 5:00 - 11:59
//       День: 0, // 12:00 - 17:59
//       Вечер: 0, // 18:00 - 23:59
//       Ночь: 0, // 00:00 - 4:59
//     };

//     for (const flight of flightsData) {
//       // ✅ Используем takeoff_time (например, "00:00")
//       const [hours, minutes] = flight.takeoff_time.split(':').map(Number);

//       if (hours >= 5 && hours < 12) {
//         timeOfDayCounts['Утро']++;
//       } else if (hours >= 12 && hours < 18) {
//         timeOfDayCounts['День']++;
//       } else if (hours >= 18 && hours < 24) {
//         timeOfDayCounts['Вечер']++;
//       } else {
//         timeOfDayCounts['Ночь']++;
//       }
//     }

//     return Object.entries(timeOfDayCounts)
//       .map(([label, value]) => ({ label, value }))
//       .filter((item) => item.value > 0);
//   }, [flightsData]);

//   // Оптимизированное вычисление ежедневных полетов
//   const dailyFlights = useMemo(() => {
//     if (!flightsData?.length) return [];

//     const flightsByDate = new Map();

//     for (const flight of flightsData) {
//       const date = flight.date;
//       flightsByDate.set(date, (flightsByDate.get(date) || 0) + 1);
//     }

//     return Array.from(flightsByDate.entries())
//       .map(([date, count]) => ({
//         date: new Date(date),
//         count,
//       }))
//       .sort((a, b) => a.date - b.date);
//   }, [flightsData]);

//   // Вычисление количества полетов по регионам
//   const flightsByRegion = useMemo(() => {
//     if (!filteredFlights?.length) return [];

//     const regionCounts = new Map();

//     for (const flight of filteredFlights) {
//       const region = flight.region || 'Не определен';
//       regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
//     }

//     return Array.from(regionCounts.entries())
//       .map(([region, count]) => ({ region, count }))
//       .sort((a, b) => b.count - a.count);
//   }, [filteredFlights]);

//   // Вычисление суммарной длительности полетов по регионам
//   const flightsDurationByRegion = useMemo(() => {
//     if (!filteredFlights?.length) return [];

//     const durationByRegion = new Map();

//     for (const flight of filteredFlights) {
//       const region = flight.region || 'Не определен';
//       const duration = flight.durationMinutes || 0;
//       const currentDuration = durationByRegion.get(region) || 0;
//       durationByRegion.set(region, currentDuration + duration);
//     }

//     return Array.from(durationByRegion.entries())
//       .map(([region, totalDurationMinutes]) => ({
//         region,
//         totalDurationMinutes,
//       }))
//       .sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);
//   }, [filteredFlights]);

//   // Вычисление пиковой нагрузки: максимальное число полетов за час
//   const peakHourlyFlights = useMemo(() => {
//     if (!filteredFlights?.length) return { maxFlights: 0, peakHour: null };

//     const flightsByHour = new Map();

//     for (const flight of filteredFlights) {
//       const flightDate = new Date(flight.date);
//       const hourKey = new Date(
//         flightDate.getFullYear(),
//         flightDate.getMonth(),
//         flightDate.getDate(),
//         flightDate.getHours(),
//       ).toISOString();

//       flightsByHour.set(hourKey, (flightsByHour.get(hourKey) || 0) + 1);
//     }

//     let maxFlights = 0;
//     let peakHour = null;

//     for (const [hour, count] of flightsByHour.entries()) {
//       if (count > maxFlights) {
//         maxFlights = count;
//         peakHour = new Date(hour);
//       }
//     }

//     return { maxFlights, peakHour };
//   }, [filteredFlights]);

//   return {
//     filteredFlights,
//     dailyFlights,
//     flightsByRegion,
//     flightsDurationByRegion,
//     peakHourlyFlights,
//     flightsByTimeOfDay, // ✅ Добавлено
//     setDateRange,
//   };
// };
// import { useCallback, useEffect, useMemo, useState } from 'react';

// export const useFlightData = (flightsData) => {
//   const [dateRange, setDateRange] = useState(null);
//   const [filteredFlights, setFilteredFlights] = useState([]);

//   // Оптимизированное вычисление ежедневных полетов
//   const dailyFlights = useMemo(() => {
//     if (!flightsData?.length) return [];

//     const flightsByDate = new Map();

//     for (const flight of flightsData) {
//       const date = flight.date;
//       flightsByDate.set(date, (flightsByDate.get(date) || 0) + 1);
//     }

//     return Array.from(flightsByDate.entries())
//       .map(([date, count]) => ({
//         date: new Date(date),
//         count,
//       }))
//       .sort((a, b) => a.date - b.date);
//   }, [flightsData]);

//   // Вычисление количества полетов по регионам
//   const flightsByRegion = useMemo(() => {
//     if (!filteredFlights?.length) return [];

//     const regionCounts = new Map();

//     for (const flight of filteredFlights) {
//       const region = flight.region || 'Не определен';
//       regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
//     }

//     return Array.from(regionCounts.entries())
//       .map(([region, count]) => ({ region, count }))
//       .sort((a, b) => b.count - a.count);
//   }, [filteredFlights]);

//   // Вычисление суммарной длительности полетов по регионам
//   const flightsDurationByRegion = useMemo(() => {
//     if (!filteredFlights?.length) return [];

//     const durationByRegion = new Map();

//     for (const flight of filteredFlights) {
//       const region = flight.region || 'Не определен';
//       const duration = flight.durationMinutes || 0;
//       const currentDuration = durationByRegion.get(region) || 0;
//       durationByRegion.set(region, currentDuration + duration);
//     }

//     return Array.from(durationByRegion.entries())
//       .map(([region, totalDurationMinutes]) => ({
//         region,
//         totalDurationMinutes,
//       }))
//       .sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);
//   }, [filteredFlights]);

//   // Вычисление пиковой нагрузки: максимальное число полетов за час
//   const peakHourlyFlights = useMemo(() => {
//     if (!filteredFlights?.length) return { maxFlights: 0, peakHour: null };

//     const flightsByHour = new Map();

//     for (const flight of filteredFlights) {
//       const flightDate = new Date(flight.date);
//       const hourKey = new Date(
//         flightDate.getFullYear(),
//         flightDate.getMonth(),
//         flightDate.getDate(),
//         flightDate.getHours(),
//       ).toISOString();

//       flightsByHour.set(hourKey, (flightsByHour.get(hourKey) || 0) + 1);
//     }

//     let maxFlights = 0;
//     let peakHour = null;

//     for (const [hour, count] of flightsByHour.entries()) {
//       if (count > maxFlights) {
//         maxFlights = count;
//         peakHour = new Date(hour);
//       }
//     }

//     return { maxFlights, peakHour };
//   }, [filteredFlights]);

//   // Оптимизированная фильтрация полетов
//   const filterFlights = useCallback(() => {
//     if (!flightsData?.length) {
//       setFilteredFlights([]);
//       return;
//     }

//     if (!dateRange) {
//       setFilteredFlights(flightsData);
//       return;
//     }

//     const [startDate, endDate] = dateRange;
//     const startCompareDate = new Date(startDate);
//     const endCompareDate = new Date(endDate);

//     startCompareDate.setHours(0, 0, 0, 0);
//     endCompareDate.setHours(23, 59, 59, 999);

//     const filtered = flightsData.filter((flight) => {
//       const flightDate = new Date(flight.date);
//       const compareDate = new Date(flightDate);
//       compareDate.setHours(0, 0, 0, 0);
//       return compareDate >= startCompareDate && compareDate <= endCompareDate;
//     });

//     setFilteredFlights(filtered);
//   }, [flightsData, dateRange]);

//   useEffect(() => {
//     filterFlights();
//   }, [filterFlights]);

//   return {
//     filteredFlights,
//     dailyFlights,
//     flightsByRegion,
//     flightsDurationByRegion,
//     peakHourlyFlights,
//     setDateRange,
//   };
// };
// import { useCallback, useEffect, useMemo, useState } from 'react';

// export const useFlightData = (flightsData) => {
//   const [dateRange, setDateRange] = useState(null);
//   const [filteredFlights, setFilteredFlights] = useState([]);

//   // Оптимизированное вычисление ежедневных полетов
//   const dailyFlights = useMemo(() => {
//     if (!flightsData?.length) return [];

//     const flightsByDate = new Map();

//     // Используем for...of для лучшей читаемости
//     for (const flight of flightsData) {
//       const date = flight.date;
//       flightsByDate.set(date, (flightsByDate.get(date) || 0) + 1);
//     }

//     return Array.from(flightsByDate.entries())
//       .map(([date, count]) => ({
//         date: new Date(date),
//         count,
//       }))
//       .sort((a, b) => a.date - b.date);
//   }, [flightsData]);

//   // Вычисление количества полетов по регионам
//   const flightsByRegion = useMemo(() => {
//     if (!filteredFlights?.length) return [];

//     const regionCounts = new Map();

//     for (const flight of filteredFlights) {
//       const region = flight.region || 'Не определен';
//       regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
//     }

//     return Array.from(regionCounts.entries())
//       .map(([region, count]) => ({ region, count }))
//       .sort((a, b) => b.count - a.count);
//   }, [filteredFlights]);

//   // Вычисление суммарной длительности полетов по регионам
//   const flightsDurationByRegion = useMemo(() => {
//     if (!filteredFlights?.length) return [];

//     const durationByRegion = new Map();

//     // Один проход для сбора данных
//     for (const flight of filteredFlights) {
//       const region = flight.region || 'Не определен';
//       const duration = flight.durationMinutes || 0;
//       const currentDuration = durationByRegion.get(region) || 0;
//       durationByRegion.set(region, currentDuration + duration);
//     }

//     // Преобразуем в массив и сортируем
//     return Array.from(durationByRegion.entries())
//       .map(([region, totalDurationMinutes]) => ({
//         region,
//         totalDurationMinutes,
//       }))
//       .sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);
//   }, [filteredFlights]);

//   // Оптимизированная фильтрация полетов
//   const filterFlights = useCallback(() => {
//     if (!flightsData?.length) {
//       setFilteredFlights([]);
//       return;
//     }

//     if (!dateRange) {
//       setFilteredFlights(flightsData);
//       return;
//     }

//     const [startDate, endDate] = dateRange;
//     const startCompareDate = new Date(startDate);
//     const endCompareDate = new Date(endDate);

//     startCompareDate.setHours(0, 0, 0, 0);
//     endCompareDate.setHours(23, 59, 59, 999);

//     const filtered = flightsData.filter((flight) => {
//       const flightDate = new Date(flight.date);
//       const compareDate = new Date(flightDate);
//       compareDate.setHours(0, 0, 0, 0);
//       return compareDate >= startCompareDate && compareDate <= endCompareDate;
//     });

//     setFilteredFlights(filtered);
//   }, [flightsData, dateRange]);

//   useEffect(() => {
//     filterFlights();
//   }, [filterFlights]);

//   return {
//     filteredFlights,
//     dailyFlights,
//     flightsByRegion,
//     flightsDurationByRegion,
//     setDateRange,
//   };
// };
// // hooks/useFlightData.js
// import { useCallback, useEffect, useMemo, useState } from 'react';

// export const useFlightData = (flightsData) => {
//   const [dateRange, setDateRange] = useState(null);
//   const [filteredFlights, setFilteredFlights] = useState([]);

//   // Оптимизированное вычисление ежедневных полетов
//   const dailyFlights = useMemo(() => {
//     if (!flightsData || flightsData.length === 0) return [];

//     // Используем Map для лучшей производительности
//     const flightsByDate = new Map();

//     for (let i = 0; i < flightsData.length; i++) {
//       const flight = flightsData[i];
//       const date = flight.date;
//       flightsByDate.set(date, (flightsByDate.get(date) || 0) + 1);
//     }

//     // Преобразуем в массив и сортируем
//     const result = Array.from(flightsByDate.entries())
//       .map(([date, count]) => ({ date: new Date(date), count }))
//       .sort((a, b) => a.date - b.date);

//     return result;
//   }, [flightsData]);

//   // Оптимизированная фильтрация полетов с правильной обработкой дат
//   const filterFlights = useCallback(() => {
//     if (!flightsData || flightsData.length === 0) {
//       setFilteredFlights([]);
//       return;
//     }

//     if (!dateRange) {
//       setFilteredFlights(flightsData);
//       return;
//     }

//     const [startDate, endDate] = dateRange;

//     // Создаем копии дат для сравнения, чтобы не мутировать оригинальные объекты
//     const startCompareDate = new Date(startDate);
//     const endCompareDate = new Date(endDate);

//     // Устанавливаем время в начало и конец дня для точного сравнения
//     startCompareDate.setHours(0, 0, 0, 0);
//     endCompareDate.setHours(23, 59, 59, 999);

//     // Используем for loop для лучшей производительности
//     const filtered = [];
//     for (let i = 0; i < flightsData.length; i++) {
//       const flight = flightsData[i];
//       const flightDate = new Date(flight.date);

//       // Устанавливаем время в начало дня для сравнения
//       const compareDate = new Date(flightDate);
//       compareDate.setHours(0, 0, 0, 0);

//       if (compareDate >= startCompareDate && compareDate <= endCompareDate) {
//         filtered.push(flight);
//       }
//     }

//     setFilteredFlights(filtered);
//   }, [flightsData, dateRange]);

//   useEffect(() => {
//     filterFlights();
//   }, [filterFlights]);

//   return {
//     filteredFlights,
//     dailyFlights,
//     setDateRange,
//   };
// };

// import { useEffect, useMemo, useState } from 'react';

// export const useFlightData = (flightsData) => {
//   const [dateRange, setDateRange] = useState(null);
//   const [filteredFlights, setFilteredFlights] = useState([]);

//   const dailyFlights = useMemo(() => {
//     if (!flightsData) return [];

//     const flightsByDate = flightsData.reduce((acc, flight) => {
//       const date = flight.date;
//       acc[date] = (acc[date] || 0) + 1;
//       return acc;
//     }, {});

//     return Object.entries(flightsByDate)
//       .map(([date, count]) => ({ date: new Date(date), count }))
//       .sort((a, b) => a.date - b.date);
//   }, [flightsData]);

//   useEffect(() => {
//     const stableDateRange = dateRange ? [dateRange[0].getTime(), dateRange[1].getTime()] : null;

//     if (!stableDateRange || !flightsData) {
//       setFilteredFlights(flightsData || []);
//       return;
//     }

//     const [startTimestamp, endTimestamp] = stableDateRange;
//     const startDate = new Date(startTimestamp);
//     const endDate = new Date(endTimestamp);

//     const filtered = (flightsData || []).filter((flight) => {
//       const flightDate = new Date(flight.date);
//       return flightDate >= startDate && flightDate <= endDate;
//     });

//     setFilteredFlights(filtered);
//   }, [dateRange, flightsData]);

//   return {
//     filteredFlights,
//     dailyFlights,
//     setDateRange,
//   };
// };

// // hooks/useFlightData.js
// import { useEffect, useMemo, useState } from 'react';

// export const useFlightData = (flightsData) => {
//   const [dateRange, setDateRange] = useState(null);
//   const [filteredFlights, setFilteredFlights] = useState([]);

//   const dailyFlights = useMemo(() => {
//     if (!flightsData) return [];

//     const flightsByDate = flightsData.reduce((acc, flight) => {
//       const date = flight.date;
//       acc[date] = (acc[date] || 0) + 1;
//       return acc;
//     }, {});

//     return Object.entries(flightsByDate)
//       .map(([date, count]) => ({ date: new Date(date), count }))
//       .sort((a, b) => a.date - b.date);
//   }, [flightsData]);

//   useEffect(() => {
//     if (!dateRange || !flightsData) {
//       setFilteredFlights(flightsData || []);
//       return;
//     }

//     const [startDate, endDate] = dateRange;
//     const filtered = (flightsData || []).filter((flight) => {
//       const flightDate = new Date(flight.date);
//       return flightDate >= startDate && flightDate <= endDate;
//     });

//     setFilteredFlights(filtered);
//   }, [dateRange, flightsData]);

//   return {
//     filteredFlights,
//     dailyFlights,
//     setDateRange,
//   };
// };
