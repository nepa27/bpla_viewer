import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export const createFlightWorker = () => {
  const workerScript = `
    self.onmessage = function(e) {
      const { action, data, dateRange, filters } = e.data;

      switch(action) {
        case 'filter':
          const [startDate, endDate] = dateRange;
          const startCompareDate = new Date(startDate);
          const endCompareDate = new Date(endDate);
          startCompareDate.setHours(0, 0, 0, 0);
          endCompareDate.setHours(23, 59, 59, 999);

          const filtered = data.filter((flight) => {
            const flightDate = new Date(flight.date);
            const compareDate = new Date(flightDate);
            compareDate.setHours(0, 0, 0, 0);
            return compareDate >= startCompareDate && compareDate <= endCompareDate;
          });

          self.postMessage({ action: 'filtered', result: filtered });
          break;

        case 'dailyFlights':
          const flightsByDate = new Map();
          for (const flight of data) {
            const date = flight.date;
            flightsByDate.set(date, (flightsByDate.get(date) || 0) + 1);
          }

          const dailyResult = Array.from(flightsByDate.entries())
            .map(([date, count]) => ({
              date: new Date(date),
              count,
            }))
            .sort((a, b) => a.date - b.date);

          self.postMessage({ action: 'dailyFlights', result: dailyResult });
          break;

        case 'flightsByRegion':
          const regionCounts = new Map();
          for (const flight of data) {
            const region = flight.region || 'Не определен';
            regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
          }

          const regionResult = Array.from(regionCounts.entries())
            .map(([region, count]) => ({ region, count }))
            .sort((a, b) => b.count - a.count);

          self.postMessage({ action: 'flightsByRegion', result: regionResult });
          break;

        case 'flightsDurationByRegion':
          const durationByRegion = new Map();
          for (const flight of data) {
            const region = flight.region || 'Не определен';
            const duration = flight.durationMinutes || 0;
            durationByRegion.set(region, (durationByRegion.get(region) || 0) + duration);
          }

          const durationResult = Array.from(durationByRegion.entries())
            .map(([region, totalDurationMinutes]) => ({ region, totalDurationMinutes }))
            .sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);

          self.postMessage({ action: 'flightsDurationByRegion', result: durationResult });
          break;

        case 'flightsByTimeOfDay':
          const timeOfDayCounts = { Утро: 0, День: 0, Вечер: 0, Ночь: 0 };

          for (const flight of data) {
            const [hours] = flight.takeoff_time.split(':').map(Number);
            if (hours >= 5 && hours < 12) timeOfDayCounts['Утро']++;
            else if (hours >= 12 && hours < 18) timeOfDayCounts['День']++;
            else if (hours >= 18 && hours < 24) timeOfDayCounts['Вечер']++;
            else timeOfDayCounts['Ночь']++;
          }

          const timeOfDayResult = Object.entries(timeOfDayCounts)
            .map(([label, value]) => ({ label, value }))
            .filter((item) => item.value > 0);

          self.postMessage({ action: 'flightsByTimeOfDay', result: timeOfDayResult });
          break;

        case 'peakHourlyFlights':
          const dailyPeakData = new Map();

          for (const flight of data) {
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

          const peakResult = [];
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
            peakResult.push({ date, maxFlights, peakHour });
          }

          peakResult.sort((a, b) => new Date(a.date) - new Date(b.date));
          self.postMessage({ action: 'peakHourlyFlights', result: peakResult });
          break;

        case 'statistics':
          const totalFlights = data.length;
          const totalDurationMinutes = data.reduce(
            (sum, flight) => sum + (flight.durationMinutes || 0),
            0,
          );

          let averageFlightDuration = '0 ч 0 мин';
          if (totalFlights > 0) {
            const avgMinutes = totalDurationMinutes / totalFlights;
            const hours = Math.floor(avgMinutes / 60);
            const minutes = Math.round(avgMinutes % 60);
            averageFlightDuration = \`\${hours} ч \${minutes} мин\`;
          }

          let daysWithoutFlights = 0;
          if (filters?.dateRange) {
            const [startDate, endDate] = filters.dateRange;
            const start = new Date(startDate);
            const end = new Date(endDate);
            const totalDaysInRange = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            const uniqueFlightDates = new Set(
              data.map((f) => new Date(f.date).toDateString()),
            );
            daysWithoutFlights = Math.max(0, totalDaysInRange - uniqueFlightDates.size);
          } else {
            if (data.length > 0) {
              const allDates = data.map((f) => new Date(f.date));
              const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
              const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
              const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
              const uniqueFlightDates = new Set(data.map((f) => new Date(f.date).toDateString()));
              daysWithoutFlights = Math.max(0, totalDays - uniqueFlightDates.size);
            }
          }

          self.postMessage({
            action: 'statistics',
            result: { averageFlightDuration, daysWithoutFlights, totalFlights }
          });
          break;

        case 'flightDurationByDate':
          const aggregated = new Map();

          for (const flight of data) {
            const dateStr = flight.date;
            const duration = flight.durationMinutes || 0;

            if (!aggregated.has(dateStr)) {
              aggregated.set(dateStr, {
                date: new Date(dateStr),
                totalDuration: 0,
              });
            }
            aggregated.get(dateStr).totalDuration += duration;
          }

          const durationResult2 = Array.from(aggregated.values())
            .map(({ date, totalDuration }) => ({
              date,
              value: totalDuration,
            }))
            .sort((a, b) => a.date - b.date);

          self.postMessage({ action: 'flightDurationByDate', result: durationResult2 });
          break;

        default:
          self.postMessage({ action: 'error', error: 'Unknown action' });
      }
    };
  `;

  const blob = new Blob([workerScript], { type: 'application/javascript' });
  console.log(URL.createObjectURL(blob))
  return new Worker(URL.createObjectURL(blob));
};   

// Throttle функция для ограничения частоты вызовов
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export const useFlightCoreDataWorker = (flightsData, dateRange = null) => {
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [dailyFlights, setDailyFlights] = useState([]);
  const [flightsByRegion, setFlightsByRegion] = useState([]);
  const [flightsDurationByRegion, setFlightsDurationByRegion] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [worker, setWorker] = useState(null);
  const [workerReady, setWorkerReady] = useState(false);

  // Ref для хранения throttled функции
  const throttledWorkerRef = useRef(null);

  // Создание воркера
  useLayoutEffect(() => {
    const newWorker = createFlightWorker();
    setWorker(newWorker);
    setWorkerReady(true);

    return () => {
      newWorker.terminate();
    };
  }, []);

  // Обработка сообщений от воркера
  useEffect(() => {
    if (!worker) return;

    const handleMessage = (event) => {
      const { action, result, error } = event.data;

      if (error) {
        console.error('Worker error:', error);
        setIsLoading(false);
        return;
      }

      switch (action) {
        case 'filtered':
          setFilteredFlights(result);
          if (result.length > 0 && throttledWorkerRef.current) {
            // Используем throttled версию для отправки данных
            throttledWorkerRef.current(result);
          } else {
            setFlightsByRegion([]);
            setFlightsDurationByRegion([]);
            setIsLoading(false);
          }
          break;

        case 'dailyFlights':
          setDailyFlights(result);
          break;

        case 'flightsByRegion':
          setFlightsByRegion(result);
          break;

        case 'flightsDurationByRegion':
          setFlightsDurationByRegion(result);
          setIsLoading(false);
          break;

        default:
          break;
      }
    };

    worker.addEventListener('message', handleMessage);
    return () => worker.removeEventListener('message', handleMessage);
  }, [worker]);

  useEffect(() => {
    if (!flightsData?.length || !workerReady || !worker) {
      setDailyFlights([]);
      return;
    }

    worker.postMessage({ action: 'dailyFlights', data: flightsData });
  }, [flightsData, workerReady, worker]);

  useEffect(() => {
    if (!flightsData?.length || !workerReady || !worker) {
      setFilteredFlights([]);
      setFlightsByRegion([]);
      setFlightsDurationByRegion([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (!dateRange) {
      setFilteredFlights(flightsData);
      // Создаем или используем существующую throttled функцию
      if (!throttledWorkerRef.current) {
        throttledWorkerRef.current = throttle((data) => {
          worker.postMessage({ action: 'flightsByRegion', data });
          worker.postMessage({ action: 'flightsDurationByRegion', data });
        }, 500);
      }
      throttledWorkerRef.current(flightsData);
    } else {
      worker.postMessage({
        action: 'filter',
        data: flightsData,
        dateRange,
      });
    }
  }, [dateRange, flightsData, workerReady, worker]);

  return {
    filteredFlights,
    isLoading,
    dailyFlights,
    flightsByRegion,
    flightsDurationByRegion,
  };
};
