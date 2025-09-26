// src/d3/createCities.js
import { select } from 'd3';

/**
 * Создает и отрисовывает города (центры и столицы) для ВСЕЙ карты.
 * Возвращает D3-селектор для текстовых элементов (cityLabels).
 */
export const createCities = ({ mapGroup, mapData, path, setTooltip, isSingleRegion, height }) => {
  if (!mapData || (mapData.type !== 'FeatureCollection' && mapData.type !== 'Feature')) {
    console.log('createCities: Skipping city creation (invalid map data provided).');
    // Удаляем существующие города, если они есть
    mapGroup.selectAll('g.city-group').remove();
    return null; // Возвращаем null, если данных нет
  }

  // console.log('createCities: Creating cities for the entire map.'); // Закомментировать или удалить

  // Удаляем предыдущую группу городов перед созданием новой
  // Это важно, если функция вызывается повторно при перерендеринге карты
  mapGroup.selectAll('g.city-group').remove();

  const citiesGroup = mapGroup.append('g').attr('class', 'city-group');

  const featuresToProcess = mapData.features || [];
  const cityData = [];

  featuresToProcess.forEach((feature) => {
    const props = feature.properties;
    if (!props) return;

    // Извлечение данных о столице
    const capitalName = props.capital;
    const capitalCoords = props.capital_coordinates;
    if (capitalCoords && Array.isArray(capitalCoords) && capitalCoords.length === 2) {
      cityData.push({
        name: capitalName || 'Столица',
        type: 'Столица',
        coordinates: [capitalCoords[1], capitalCoords[0]], // [lng, lat] -> [lat, lng]
        regionId: props['hc-key'] || props.region,
        feature,
      });
    }
  });

  if (!cityData.length) {
    return null; // Возвращаем null, если данных нет
  }

  // Создаем элементы для городов
  const cities = citiesGroup
    .selectAll('g.city')
    .data(cityData, (d) => d.regionId || d.name) // Используем ключ для правильного обновления
    .enter()
    .append('g')
    .attr('class', 'city')
    .attr('transform', (d) => {
      // Преобразует [lng, lat] в [x, y]
      const projected = path.projection()(d.coordinates);
      if (projected && projected.length === 2) {
        // Учитываем сдвиг при отображении региона
        const x = projected[0];
        let y = projected[1];

        if (!isSingleRegion) {
          const scaleFactor = 1.8;
          const translateY = (height - height * scaleFactor) / 2;
          y = y * scaleFactor + translateY;
        }

        return `translate(${x},${y})`;
      }
      return 'translate(0,0)';
    })
    .style('pointer-events', 'all');

  // Кружок для столицы
  cities
    .append('circle')
    .attr('r', 2)
    .attr('fill', '#e74c3c')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 0.5)
    .attr('opacity', 0.9);

  // Подпись столицы
  const cityLabels = cities
    .append('text')
    .attr('class', 'city-label')
    .attr('dy', -6) // Смещение вверх над кружком
    .attr('text-anchor', 'middle')
    .attr('font-size', '8px') // Начальный размер шрифта
    .attr('fill', 'white')
    .text((d) => d.name)
    .style('pointer-events', 'none')
    .style('text-shadow', '1px 1px 2px rgba(0, 0, 0, 0.9)')
    .attr('opacity', 0.8);

  // Обработчики событий
  cities
    .on('mouseover', function (event, d) {
      select(this).select('circle').attr('r', 3).attr('opacity', 1);
      // Увеличиваем шрифт при наведении, но не больше чем на 20%
      const currentFontSize = parseFloat(select(this).select('text').attr('font-size'));
      select(this)
        .select('text')
        .attr('opacity', 1)
        .attr('font-size', `${currentFontSize * 1.2}px`);
      const [x, y] = [event.layerX, event.layerY];
      setTooltip({
        visible: true,
        content: `<b>${d.name}</b><br/>${d.type} региона<br/>Регион: ${d.feature?.properties?.region || 'N/A'}`,
        x: x,
        y: y,
      });
    })
    .on('mouseout', function () {
      select(this).select('circle').attr('r', 2).attr('opacity', 0.9);
      // Возвращаем размер шрифта к нормальному (определяемому зумом)
      // Это будет обновлено при следующем событии зума, так что не нужно ничего устанавливать здесь
      // select(this).select('text').attr('font-size', '8px');
      select(this).select('text').attr('opacity', 0.8);
      setTooltip({ visible: false, content: '', x: 0, y: 0 });
    });

  // Возвращаем только селектор для текстовых элементов
  return cityLabels;
};
// // src/d3/createCities.js
// import { select } from 'd3';

// /**
//  * Создает и отрисовывает города (центры и столицы) для ВСЕЙ карты.
//  *
//  * @param {Object} params - Параметры для создания городов.
//  * @param {Object} params.svg - D3 выборка SVG элемента.
//  * @param {Object} params.mapGroup - D3 группа внутри SVG для карты.
//  * @param {Object} params.mapData - Данные GeoJSON FeatureCollection ВСЕЙ карты.
//  * @param {Function} params.path - Функция проекции D3.
//  * @param {Function} params.setTooltip - Функция для установки состояния тултипа.
//  * @param {number} params.height - Высота SVG.
//  * @param {number} params.zoomLevel - Текущий уровень зума (для управления видимостью).
//  */
// export const createCities = ({
//   //   svg,
//   mapGroup,
//   mapData, // Ожидаем FeatureCollection всей карты
//   path,
//   setTooltip,
//   isSingleRegion,
//   height,
//   //   zoomLevel = 1,
// }) => {
//   if (!mapData || (mapData.type !== 'FeatureCollection' && mapData.type !== 'Feature')) {
//     console.log('createCities: Skipping city creation (invalid map data provided).');
//     // Очищаем существующие города, если они есть
//     mapGroup.selectAll('g.city-group').remove();
//     return;
//   }

//   console.log('createCities: Creating cities for the entire map.');

//   // Очищаем предыдущие города
//   mapGroup.selectAll('g.city-group').remove();

//   const citiesGroup = mapGroup.append('g').attr('class', 'city-group');

//   const featuresToProcess = mapData.features || [];

//   const cityData = [];

//   featuresToProcess.forEach((feature) => {
//     const props = feature.properties;
//     if (!props) return;

//     // --- Извлечение данных о городах ---

//     // 2. Столица региона
//     const capitalName = props.capital;
//     const capitalCoords = props.capital_coordinates;
//     if (capitalCoords && Array.isArray(capitalCoords) && capitalCoords.length === 2) {
//       cityData.push({
//         name: capitalName || 'Столица',
//         type: 'Столица',
//         coordinates: [capitalCoords[1], capitalCoords[0]], // [lng, lat] -> [lat, lng]
//         regionId: props['hc-key'] || props.region,
//         feature,
//       });
//     }
//   });

//   if (!cityData.length) {
//     return;
//   }

//   const cities = citiesGroup
//     .selectAll('g.city')
//     .data(cityData)
//     .enter()
//     .append('g')
//     .attr('class', 'city')
//     .attr('transform', (d) => {
//       // преобразует [lng, lat] в [x, y]
//       const projected = path.projection()(d.coordinates);
//       if (projected && projected.length === 2) {
//         return `translate(${projected[0]},${projected[1]})`;
//       }
//       return 'translate(0,0)';
//     })
//     .style('pointer-events', 'all');

//   // if (!isSingleRegion) {
//   //   const scaleFactor = 1.8;
//   //   const translateY = (height - height * scaleFactor) / 2;
//   //   cities.attr('transform', `matrix(1, 0, 0, ${scaleFactor}, 0, ${translateY})`);
//   // }

//   // Кружок для города
//   cities
//     .append('circle')
//     .attr('r', 1)
//     .attr('fill', '#e74c3c')
//     .attr('stroke', '#ffffff')
//     .attr('stroke-width', 0.5)
//     .attr('opacity', 0.8);

//   // Подпись города (возможно, скрыть на общей карте по умолчанию или показывать при зуме)
//   cities
//     .append('text')
//     .attr('class', 'city-label')
//     .attr('dy', -5) // Смещение вверх над кружком
//     .attr('text-anchor', 'middle')
//     .attr('font-size', '6px') // Меньший шрифт
//     .attr('fill', 'white')
//     .text((d) => `${d.name}`) // Только имя, без типа на общей карте
//     .style('pointer-events', 'none')
//     .style('text-shadow', '1px 1px 2px rgba(0, 0, 0, 0.9)')
//     .attr('opacity', 0.7); // Немного прозрачности

//   // if (!isSingleRegion) {
//   //   const scaleFactor = 1.8;
//   //   const translateY = (height - height * scaleFactor) / 2;
//   //   cities.attr('transform', `matrix(1, 0, 0, ${scaleFactor}, 0, ${translateY})`);
//   // }

//   // --- Обработчики событий ---
//   cities
//     .on('mouseover', function (event, d) {
//       select(this).select('circle').attr('r', 1.5).attr('opacity', 1);
//       select(this).select('text').attr('opacity', 1);
//       // Позиционируем тултип относительно курсора или элемента
//       const x = event.layerX || event.offsetX;
//       const y = event.layerY || event.offsetY;

//       setTooltip({
//         visible: true,
//         content: `<b>${d.name}</b><br/>${d.type} региона<br/>Регион: ${d.feature?.properties?.region || 'N/A'}`,
//         x: x,
//         y: y,
//       });
//     })
//     .on('mouseout', function () {
//       select(this).select('circle').attr('r', 1.5).attr('opacity', 0.8);
//       select(this).select('text').attr('opacity', 0.7);
//       setTooltip({ visible: false, content: '', x: 0, y: 0 });
//     });

//   return citiesGroup;
// };
