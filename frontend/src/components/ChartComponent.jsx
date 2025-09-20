import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ChartComponent = ({ data, onBrush }) => {
  const svgRef = useRef();
  const brushRef = useRef(null);
  const currentSelectionRef = useRef(null);

  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const dateCounts = d3.rollup(
      data, 
      v => v.length, 
      d => d3.timeDay(new Date(d.date))
    );

    const chartData = Array.from(dateCounts, ([date, count]) => ({
      date: date,
      count: count
    })).sort((a, b) => a.date - b.date);

    const x = d3.scaleBand()
      .domain(chartData.map(d => d.date))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.count)])
      .nice()
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d.%m")))
      .selectAll("text")
      .style("font-size", "10px");

    svg.append("g")
      .call(d3.axisLeft(y));

    svg.selectAll(".bar")
      .data(chartData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.date))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.count))
      .attr("height", d => height - y(d.count))
      .attr("fill", "#4488ff")
      .on("mouseover", function() {
        d3.select(this).attr("fill", "#ff4444");
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", "#4488ff");
      });

    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("start", () => {
        // При начале нового выделения сбрасываем предыдущее
        currentSelectionRef.current = null;
      })
      .on("end", (event) => {
        if (event.selection) {
          const [x0, x1] = event.selection;
          
          const domain = x.domain();
          const bandwidth = x.bandwidth();
          const step = (width - bandwidth) / (domain.length - 1);
          
          const index0 = Math.max(0, Math.floor(x0 / (step + bandwidth * x.padding())));
          const index1 = Math.min(domain.length - 1, Math.floor(x1 / (step + bandwidth * x.padding())));
          
          const date0 = domain[index0];
          const date1 = domain[index1];
          
          const endDate = new Date(date1);
          endDate.setDate(endDate.getDate() + 1);
          
          // Сохраняем текущее выделение
          currentSelectionRef.current = { start: date0, end: endDate };
          onBrush(date0, endDate);
        } else {
          // Если выделение сброшено программно, не вызываем onBrush
          if (currentSelectionRef.current !== null) {
            currentSelectionRef.current = null;
            onBrush(null, null);
          }
        }
      });

    const brushGroup = svg.append("g")
      .attr("class", "brush")
      .call(brush);

    brushRef.current = brush;

    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 5})`)
      .style("text-anchor", "middle")
      .text("Дата");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Количество полетов");

  }, [data, onBrush]);

  return <svg ref={svgRef}></svg>;
};

export default ChartComponent;
// // components/ChartComponent.jsx
// import React, { useEffect, useRef } from 'react';
// import * as d3 from 'd3';

// const ChartComponent = ({ data, onBrush }) => {
//   const svgRef = useRef();

//   useEffect(() => {
//     const margin = { top: 10, right: 30, bottom: 30, left: 40 };
//     const width = 800 - margin.left - margin.right;
//     const height = 200 - margin.top - margin.bottom;

//     const svg = d3.select(svgRef.current)
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     const x = d3.scaleTime()
//       .domain(d3.extent(data, d => new Date(d.date)))
//       .range([0, width]);

//     const brush = d3.brushX()
//       .extent([[0, 0], [width, height]])
//       .on("end", (event) => {
//         if (event.selection) {
//           const [x0, x1] = event.selection.map(x.invert);
//           onBrush(x0, x1);
//         }
//       });

//     svg.append("g")
//       .attr("transform", `translate(0,${height})`)
//       .call(d3.axisBottom(x));

//     svg.append("g")
//       .call(brush);

//   }, [data, onBrush]);

//   return <svg ref={svgRef}></svg>;
// };

// export default ChartComponent;