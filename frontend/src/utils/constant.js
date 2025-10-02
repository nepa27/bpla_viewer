import dayjs from 'dayjs';

export const SORT_OPTIONS_KEY = { top10: 'top10', desc: 'desc', asc: 'asc', all: 'all' };

export const SORT_OPTIONS_CHART = [
  { value: SORT_OPTIONS_KEY.desc, label: 'Топ 10 регионов' },
  { value: SORT_OPTIONS_KEY.asc, label: 'По возрастанию (Топ 10)' },
  { value: SORT_OPTIONS_KEY.all, label: 'Показать весь список регионов' },
];

export const timeFormatDefaultRussia = {
  dateTime: '%A, %e %B %Y г. %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['AM', 'PM'],
  days: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  shortDays: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  months: [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ],
  shortMonths: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
};

export const initialDateRange = [dayjs().month(0).date(1), dayjs()];
