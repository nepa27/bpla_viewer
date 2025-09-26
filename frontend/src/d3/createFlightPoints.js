// d3/createFlightPoints.js
import { pointer, select } from 'd3';

export const createFlightPoints = ({
  svg,
  mapGroup,
  filteredFlights,
  projection,
  isSingleRegion,
  setTooltip,
  height,
}) => {
  // Определяем плотность точек для оптимизации
  const pointCount = filteredFlights.length;
  let pointSize, opacity;

  if (pointCount > 50000) {
    pointSize = 0.5;
    opacity = 0.3;
  } else if (pointCount > 10000) {
    pointSize = 1;
    opacity = 0.5;
  } else {
    pointSize = 1.5;
    opacity = 0.7;
  }

  // Для очень больших наборов данных используем кластеризацию
  let displayFlights = filteredFlights;
  if (pointCount > 10000) {
    // Группируем точки по координатам с округлением
    const clusterMap = new Map();

    filteredFlights.forEach((flight) => {
      if (flight.lat != null && flight.lng != null) {
        // Округляем до 2 знаков после запятой для группировки
        const latKey = Math.round(flight.lat * 100) / 100;
        const lngKey = Math.round(flight.lng * 100) / 100;
        const key = `${latKey},${lngKey}`;

        if (!clusterMap.has(key)) {
          clusterMap.set(key, {
            lat: latKey,
            lng: lngKey,
            count: 0,
            flights: [],
          });
        }

        const cluster = clusterMap.get(key);
        cluster.count++;
        cluster.flights.push(flight);
      }
    });

    // Преобразуем кластеры в точки для отображения
    displayFlights = Array.from(clusterMap.values()).map((cluster) => ({
      lat: cluster.lat,
      lng: cluster.lng,
      count: cluster.count,
      isCluster: cluster.count > 1,
      ...cluster.flights[0], // Берем данные первой точки для отображения
    }));
  }

  const flightPoints = mapGroup
    .selectAll('circle.flight-point')
    .data(displayFlights)
    .enter()
    .append('circle')
    .attr('class', 'flight-point')
    .attr('cx', (d) => {
      const coords = projection([parseFloat(d.lng), parseFloat(d.lat)]);
      return coords ? coords[0] : null;
    })
    .attr('cy', (d) => {
      const coords = projection([parseFloat(d.lng), parseFloat(d.lat)]);
      return coords ? coords[1] : null;
    })
    .attr('r', (d) => {
      // Для кластеров увеличиваем размер в зависимости от количества точек
      if (d.isCluster) {
        return Math.min(8, Math.max(2, Math.log(d.count) * 1.5));
      }
      return pointSize / (isSingleRegion ? 1 : 2);
    })
    .attr('fill', (d) => {
      // Для кластеров используем другой цвет
      if (d.isCluster) {
        return '#e67e22'; // Оранжевый для кластеров
      }
      return '#e74c3c'; // Красный для одиночных точек
    })
    .attr('stroke', (d) => {
      if (d.isCluster) {
        return '#d35400';
      }
      return '#c0392b';
    })
    .attr('stroke-width', (d) => {
      if (d.isCluster) {
        return 1;
      }
      return 0.5 / (isSingleRegion ? 1 : 2);
    })
    .attr('opacity', (d) => {
      // Для кластеров используем большую непрозрачность
      if (d.isCluster) {
        return Math.min(0.9, 0.3 + Math.log(d.count) / 10);
      }
      return opacity;
    })
    .on('mouseover', function (event, d) {
      select(this)
        .attr('r', (d2) => {
          if (d2.isCluster) {
            return Math.min(12, Math.max(3, Math.log(d2.count) * 2));
          }
          return (pointSize * 1.5) / (isSingleRegion ? 1 : 2);
        })
        .attr('opacity', (d2) => {
          if (d2.isCluster) {
            return 0.9;
          }
          return 1;
        });

      const [x, y] = pointer(event, svg.node());
      const content = d.isCluster
        ? `Группа полетов: ${d.count}<br>Наведите для деталей`
        : `Полет ${d.id}: ${d.date}`;

      setTooltip({
        visible: true,
        content: content,
        x: x,
        y: y,
      });
    })
    .on('mouseout', function (event, d) {
      select(this)
        .attr('r', (d2) => {
          if (d2.isCluster) {
            return Math.min(8, Math.max(2, Math.log(d2.count) * 1.5));
          }
          return pointSize / (isSingleRegion ? 1 : 2);
        })
        .attr('opacity', (d2) => {
          if (d2.isCluster) {
            return Math.min(0.9, 0.3 + Math.log(d2.count) / 10);
          }
          return opacity;
        });

      setTooltip({ visible: false, content: '', x: 0, y: 0 });
    });

  // Увеличение по оси Y на 1.8 для всей карты
  if (!isSingleRegion) {
    const scaleFactor = 1.8;
    const translateY = (height - height * scaleFactor) / 2;
    flightPoints.attr('transform', `matrix(1, 0, 0, ${scaleFactor}, 0, ${translateY})`);
  }

  // Удаляем точки с некорректными координатами
  flightPoints
    .filter(function () {
      const cx = select(this).attr('cx');
      const cy = select(this).attr('cy');
      return cx === null || cy === null || isNaN(parseFloat(cx)) || isNaN(parseFloat(cy));
    })
    .remove();

  return flightPoints;
};

// import { pointer, select } from 'd3';

// export const createFlightPoints = ({
//   svg,
//   mapGroup,
//   filteredFlights,
//   projection,
//   isSingleRegion,
//   setTooltip,
//   height,
// }) => {
//   const flightPoints = mapGroup
//     .selectAll('circle.flight-point')
//     .data(filteredFlights)
//     .enter()
//     .append('circle')
//     .attr('class', 'flight-point')
//     .attr('cx', (d) => {
//       const coords = projection([parseFloat(d.lng), parseFloat(d.lat)]);
//       return coords ? coords[0] : null;
//     })
//     .attr('cy', (d) => {
//       const coords = projection([parseFloat(d.lng), parseFloat(d.lat)]);
//       return coords ? coords[1] : null;
//     })
//     .attr('r', 2 / (isSingleRegion ? 1 : 2)) // Компенсируем увеличение радиуса для всей карты
//     .attr('fill', '#e74c3c')
//     .attr('stroke', '#c0392b')
//     .attr('stroke-width', 1 / (isSingleRegion ? 1 : 2)) // Компенсируем увеличение толщины для всей карты
//     .attr('opacity', 0.8)
//     .on('mouseover', function (event, d) {
//       select(this)
//         .attr('r', 1 / (isSingleRegion ? 1 : 2))
//         .attr('opacity', 1);
//       const [x, y] = pointer(event, svg.node());
//       setTooltip({
//         visible: true,
//         content: `Полет ${d.id}: ${d.date}`,
//         x: x,
//         y: y,
//       });
//     })
//     .on('mouseout', function () {
//       select(this)
//         .attr('r', 1 / (isSingleRegion ? 1 : 2))
//         .attr('opacity', 0.8);
//       setTooltip({ visible: false, content: '', x: 0, y: 0 });
//     });

//   // Увеличение по оси Y на 1.8 для всей карты
//   if (!isSingleRegion) {
//     const scaleFactor = 1.8;
//     const translateY = (height - height * scaleFactor) / 2;
//     flightPoints.attr('transform', `matrix(1, 0, 0, ${scaleFactor}, 0, ${translateY})`);
//   }

//   flightPoints
//     .filter(function () {
//       const cx = select(this).attr('cx');
//       const cy = select(this).attr('cy');
//       return cx === null || cy === null || isNaN(parseFloat(cx)) || isNaN(parseFloat(cy));
//     })
//     .remove();

//   return flightPoints;
// };
