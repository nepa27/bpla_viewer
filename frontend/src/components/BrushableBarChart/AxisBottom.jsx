// components/BrushableBarChart/AxisBottom.jsx
import { axisBottom, timeFormat, timeFormatDefaultLocale } from 'd3';

// Определяем русскую локализацию для d3
timeFormatDefaultLocale({
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
});

export const AxisBottom = (g, x, height, width, isMonthly = false) => {
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(
      axisBottom(x)
        .tickFormat((d) => {
          const date = new Date(d);
          // Если данные помесячные, отображаем месяц и год
          if (isMonthly) {
            return timeFormat('%b %Y')(date);
          }
          // Иначе отображаем день и месяц
          return timeFormat('%d.%m')(date);
        })
        .tickSize(0),
    )
    .selectAll('text')
    .attr('fill', 'white')
    .style('font-size', width < 768 ? '8px' : '10px')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  // Стилизация оси
  g.selectAll('.x-axis line, .x-axis path').attr('stroke', '#555');
};

// // components/BrushableBarChart/AxisBottom.jsx
// import { axisBottom, timeFormat } from 'd3';

// export const AxisBottom = (g, x, height, width, isMonthly = false) => {
//   g.append('g')
//     .attr('class', 'x-axis')
//     .attr('transform', `translate(0,${height})`)
//     .call(
//       axisBottom(x)
//         .tickFormat((d) => {
//           const date = new Date(d);
//           // Если данные помесячные, отображаем месяц и год
//           if (isMonthly) {
//             return timeFormat('%b %Y')(date);
//           }
//           // Иначе отображаем день и месяц
//           return timeFormat('%d.%m')(date);
//         })
//         .tickSize(0),
//     )
//     .selectAll('text')
//     .attr('fill', 'white')
//     .style('font-size', width < 768 ? '8px' : '10px')
//     .attr('transform', 'rotate(-45)')
//     .style('text-anchor', 'end');

//   // Стилизация оси
//   g.selectAll('.x-axis line, .x-axis path').attr('stroke', '#555');
// };

// import { axisBottom, timeFormat } from 'd3';

// export const AxisBottom = (g, x, height) => {
//   // export const AxisBottom = (g, x, height, width) => {
//   g.append('g')
//     .attr('class', 'x-axis')
//     .attr('transform', `translate(0,${height})`)
//     .call(axisBottom(x).tickFormat(timeFormat('%m-%d')).tickSize(0))
//     .selectAll('text')
//     .attr('fill', 'white')
//     .style('font-size', '10px')
//     .attr('transform', 'rotate(-45)')
//     .style('text-anchor', 'end');

//   // Стилизация оси
//   g.selectAll('.x-axis line, .x-axis path').attr('stroke', '#555');
// };
