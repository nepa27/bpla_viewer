import {axisLeft} from 'd3';

export const AxisLeft = (g, y, width) => {
  g.append("g")
    .attr("class", "y-axis")
    .call(axisLeft(y).tickSize(0))
    .selectAll("text")
    .attr("fill", "white")
    .style("font-size", "10px");

  // Стилизация оси
  g.selectAll(".y-axis line, .y-axis path")
    .attr("stroke", "#555");
};