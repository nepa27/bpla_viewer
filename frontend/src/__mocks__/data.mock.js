export const filteredFlights = [
  {
    id: '7772282638',
    date: '2025-01-14',
    lat: 61.41,
    lng: 115.26,
    takeoff_time: '00:00',
    landing_time: '10:00',
    type: '2BLA',
    region: 'Республика Саха (Якутия)',
    durationMinutes: 600,
  },
  {
    id: '7772271067',
    date: '2025-01-01',
    lat: 57.06,
    lng: 65.45,
    takeoff_time: '00:00',
    landing_time: '23:59',
    type: 'BLA',
    region: 'Тюменская область',
    durationMinutes: 1439,
  },
  {
    id: '7772271634',
    date: '2025-01-01',
    lat: 60.01,
    lng: 30.28,
    takeoff_time: '07:00',
    landing_time: '09:55',
    type: 'BLA',
    region: 'Санкт-Петербург',
    durationMinutes: 175,
  },
];

export const dailyFlights = [
  { date: new Date('2025-07-01'), count: 64 },
  { date: new Date('2025-07-02'), count: 85 },
  { date: new Date('2025-07-03'), count: 142 },
];

export const flightsByRegion = [
  {
    region: 'Ханты-Мансийский автономный округ — Югра',
    count: 11899,
  },
  {
    region: 'Ямало-Ненецкий автономный округ',
    count: 6015,
  },
  {
    region: 'Москва',
    count: 4123,
  },

  { region: 'Тверская область', count: 3489 },
];

export const flightsDurationByRegion = [
  { region: 'Ханты-Мансийский автономный округ — Югра', totalDurationMinutes: 9918400 },
  { region: 'Ямало-Ненецкий автономный округ', totalDurationMinutes: 4724659 },
  { region: 'Республика Коми', totalDurationMinutes: 2304770 },
  { region: 'Тверская область', totalDurationMinutes: 1906388 },
];

export const peakHourlyFlights = [
  {
    date: '2025-07-01',
    maxFlights: 1,
    peakHour: new Date(new Date('2025-07-01').setHours(0, 2, 3, 0)),
  },
  {
    date: '2025-07-02',
    maxFlights: 1,
    peakHour: new Date(new Date('2025-07-02').setHours(2, 51, 23, 0)),
    //Tue Jul 02 2025 02:51:23 GMT+0300 (Москва, стандартное время)
  },
  {
    date: '2025-07-03',
    maxFlights: 1,
    peakHour: new Date(new Date('2025-07-03').setHours(0, 12, 3, 0)),
    //Tue Jul 03 2025 00:12:03 GMT+0300 (Москва, стандартное время)
  },
];

export const statistics = {
  averageFlightDuration: '10 ч 45 мин',
  daysWithoutFlights: 62,
  totalFlights: 416,
};

export const flightDurationByDate = [
  { date: new Date('2025-07-01'), value: 600 },
  { date: new Date('2025-07-02'), value: 600 },
  { date: new Date('2025-07-03'), value: 360 },
  { date: new Date('2025-07-04'), value: 600 },
];

export const flightsByTimeOfDay = [
  {
    label: 'Утро',
    value: 47,
  },
  {
    label: 'День',
    value: 7,
  },
  {
    label: 'Вечер',
    value: 16,
  },
  {
    label: 'Ночь',
    value: 346,
  },
];

export const ArrayBufferMock = new ArrayBuffer(32);
