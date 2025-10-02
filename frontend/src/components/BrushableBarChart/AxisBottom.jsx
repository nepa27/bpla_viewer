import { axisBottom, timeFormat, timeFormatDefaultLocale } from 'd3';

import { timeFormatDefaultRussia } from '../../utils/constant';

timeFormatDefaultLocale(timeFormatDefaultRussia);

export const AxisBottom = (g, x, height, width, isMonthly = false) => {
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(
      axisBottom(x)
        .tickFormat((d) => {
          const date = new Date(d);
          if (isMonthly) {
            return timeFormat('%b %Y')(date);
          }
          return timeFormat('%d.%m')(date);
        })
        .tickSize(0),
    )
    .selectAll('text')
    .attr('fill', 'white')
    .style('font-size', width < 768 ? '8px' : '10px')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  g.selectAll('.x-axis line, .x-axis path').attr('stroke', '#555');
};
