import { useCallback, useEffect, useMemo, useState } from 'react';

export const useFlightData = (flightsData) => {
  const [dateRange, setDateRange] = useState(null);
  const [filteredFlights, setFilteredFlights] = useState([]);

  // Оптимизированное вычисление ежедневных полетов
  const dailyFlights = useMemo(() => {
    if (!flightsData?.length) return [];

    const flightsByDate = new Map();

    // Используем for...of для лучшей читаемости
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

    // Один проход для сбора данных
    for (const flight of filteredFlights) {
      const region = flight.region || 'Не определен';
      const duration = flight.durationMinutes || 0;
      const currentDuration = durationByRegion.get(region) || 0;
      durationByRegion.set(region, currentDuration + duration);
    }

    // Преобразуем в массив и сортируем
    return Array.from(durationByRegion.entries())
      .map(([region, totalDurationMinutes]) => ({
        region,
        totalDurationMinutes,
      }))
      .sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);
  }, [filteredFlights]);

  // Оптимизированная фильтрация полетов
  const filterFlights = useCallback(() => {
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

  useEffect(() => {
    filterFlights();
  }, [filterFlights]);

  return {
    filteredFlights,
    dailyFlights,
    flightsByRegion,
    flightsDurationByRegion,
    setDateRange,
  };
};
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
