import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createFlightWorker, useFlightCoreDataWorker } from '../useFlightCoreDataWorker';

// Не мокаем Worker и URL.createObjectURL
global.Worker = window.Worker;
global.URL = window.URL;

describe('useFlightCoreDataWorker', () => {
  let dateRange;
  let flightsData;

  beforeEach(() => {
    dateRange = [new Date(), new Date()];
    flightsData = [
      {
        id: '7773422',
        date: new Date('01.01.25').toISOString().split('T')[0],
        lat: '56.46',
        lng: '62.02',
        takeoff_time: '00:30',
        landing_time: '02:40',
        type: 'BLA',
        region: 'Москва',
        durationMinutes: 688,
      },
    ];
  });

  it('should return an object with correct properties', () => {
    const { result } = renderHook(() => useFlightCoreDataWorker(flightsData, dateRange));

    expect(result.current).toHaveProperty('filteredFlights');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('dailyFlights');
    expect(result.current).toHaveProperty('flightsByRegion');
    expect(result.current).toHaveProperty('flightsDurationByRegion');

    expect(Array.isArray(result.current.filteredFlights)).toBe(true);
    expect(typeof result.current.isLoading).toBe('boolean');
    expect(Array.isArray(result.current.dailyFlights)).toBe(true);
    expect(Array.isArray(result.current.flightsByRegion)).toBe(true);
    expect(Array.isArray(result.current.flightsDurationByRegion)).toBe(true);
  });

  it('should initialize correctly without flightsData or workerReady', () => {
    const { result } = renderHook(() => useFlightCoreDataWorker(null, dateRange));

    expect(result.current.filteredFlights).toEqual([]);
    expect(result.current.dailyFlights).toEqual([]);
    expect(result.current.flightsByRegion).toEqual([]);
    expect(result.current.flightsDurationByRegion).toEqual([]);
  });

  it('should send daily flights message to worker when flightsData is provided', () => {
    const { result } = renderHook(() => useFlightCoreDataWorker(flightsData, dateRange));

    // Проверяем, что Worker был создан и сообщение отправлено
    expect(global.Worker).toHaveBeenCalled();
    const workerInstance = createFlightWorker();
    expect(workerInstance.postMessage).toHaveBeenCalledWith({
      action: 'dailyFlights',
      data: flightsData,
    });
  });

  it('should send filter message to worker when dateRange is provided', () => {
    const { result, rerender } = renderHook(() => useFlightCoreDataWorker(flightsData, dateRange));

    rerender({ flightsData, dateRange: [new Date(), new Date()] });
    expect(global.Worker).toHaveBeenCalled();

    // Проверяем, что Worker был создан и сообщение отправлено
    const workerInstance = createFlightWorker();
    expect(workerInstance.postMessage).toHaveBeenCalledWith({
      action: 'filter',
      data: flightsData,
      dateRange: dateRange,
    });
  });

  it('should handle messages from the worker', () => {
    const { result } = renderHook(() => useFlightCoreDataWorker(flightsData, dateRange));

    // Мокаем addEventListener для обработки сообщений от Worker
    const workerInstance = createFlightWorker();
    workerInstance.addEventListener.mockImplementation((event, callback) => {
      if (event === 'message') {
        callback({
          data: {
            action: 'filtered',
            result: flightsData,
          },
        });
      }
    });

    // Проверяем состояние после получения сообщения от Worker
    expect(result.current.filteredFlights).toEqual(flightsData);
  });
});

// import { renderHook } from '@testing-library/react';
// import { beforeEach, describe, expect, it, vi } from 'vitest';

// import { createFlightWorker, useFlightCoreDataWorker } from '../useFlightCoreDataWorker';

// describe('useFlightCoreDataWorker', () => {
//   let dateRange;
//   let flightsData;

//   beforeEach(() => {
//     dateRange = [new Date(), new Date()];
//     flightsData = [
//       {
//         id: '7773422',
//         date: new Date('01.01.25').toISOString().split('T')[0],
//         lat: '56.46',
//         lng: '62.02',
//         takeoff_time: '00:30',
//         landing_time: '02:40',
//         type: 'BLA',
//         region: 'Москва',
//         durationMinutes: 688,
//       },
//     ];

//     // // Mock the Worker API
//     // global.Worker = vi.fn(() => ({
//     //   postMessage: vi.fn(),
//     //   addEventListener: vi.fn(),
//     //   removeEventListener: vi.fn(),
//     //   terminate: vi.fn(),
//     // }));

//     const newWorker = createFlightWorker();
//   });

//   it.only('should return an object with correct properties', () => {
//     const { result } = renderHook(() => useFlightCoreDataWorker(flightsData, dateRange));

//     expect(result.current).toHaveProperty('filteredFlights');
//     expect(result.current).toHaveProperty('isLoading');
//     expect(result.current).toHaveProperty('dailyFlights');
//     expect(result.current).toHaveProperty('flightsByRegion');
//     expect(result.current).toHaveProperty('flightsDurationByRegion');

//     expect(Array.isArray(result.current.filteredFlights)).toBe(true);
//     expect(typeof result.current.isLoading).toBe('boolean');
//     expect(Array.isArray(result.current.dailyFlights)).toBe(true);
//     expect(Array.isArray(result.current.flightsByRegion)).toBe(true);
//     expect(Array.isArray(result.current.flightsDurationByRegion)).toBe(true);
//   });

//   it('should initialize correctly without flightsData or workerReady', () => {
//     const { result } = renderHook(() => useFlightCoreDataWorker(null, dateRange));

//     expect(result.current.filteredFlights).toEqual([]);
//     expect(result.current.dailyFlights).toEqual([]);
//     expect(result.current.flightsByRegion).toEqual([]);
//     expect(result.current.flightsDurationByRegion).toEqual([]);
//   });

//   it('should send daily flights message to worker when flightsData is provided', () => {
//     const { result } = renderHook(() => useFlightCoreDataWorker(flightsData, dateRange));

//     expect(createFlightWorker).toHaveBeenCalled();
//     const workerInstance = createFlightWorker();
//     expect(workerInstance.postMessage).toHaveBeenCalledWith({
//       action: 'dailyFlights',
//       data: flightsData,
//     });
//   });

//   it('should send filter message to worker when dateRange is provided', () => {
//     const { result, rerender } = renderHook(() => useFlightCoreDataWorker(flightsData, dateRange));

//     rerender({ flightsData, dateRange: [new Date(), new Date()] });
//     expect(createFlightWorker).toHaveBeenCalled();
//     const workerInstance = createFlightWorker();
//     expect(workerInstance.postMessage).toHaveBeenCalledWith({
//       action: 'filter',
//       data: flightsData,
//       dateRange: dateRange,
//     });
//   });

//   it('should handle messages from the worker', () => {
//     const { result } = renderHook(() => useFlightCoreDataWorker(flightsData, dateRange));

//     const workerInstance = createFlightWorker();
//     workerInstance.addEventListener.mockImplementation((event, callback) => {
//       if (event === 'message') {
//         callback({
//           data: {
//             action: 'filtered',
//             result: flightsData,
//           },
//         });
//       }
//     });

//     expect(result.current.filteredFlights).toEqual(flightsData);
//   });
// });
