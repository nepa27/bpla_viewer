// src/d3/createCities.js
import { select } from 'd3';

/**
 * Создает и отрисовывает города (центры и столицы) для ВСЕЙ карты.
 *
 * @param {Object} params - Параметры для создания городов.
 * @param {Object} params.svg - D3 выборка SVG элемента.
 * @param {Object} params.mapGroup - D3 группа внутри SVG для карты.
 * @param {Object} params.mapData - Данные GeoJSON FeatureCollection ВСЕЙ карты.
 * @param {Function} params.path - Функция проекции D3.
 * @param {Function} params.setTooltip - Функция для установки состояния тултипа.
 * @param {number} params.height - Высота SVG.
 * @param {number} params.zoomLevel - Текущий уровень зума (для управления видимостью).
 */
export const createCities = ({
  //   svg,
  mapGroup,
  mapData, // Ожидаем FeatureCollection всей карты
  path,
  setTooltip,
  //   height,
  //   zoomLevel = 1,
}) => {
  // --- Явная проверка ---
  if (!mapData || (mapData.type !== 'FeatureCollection' && mapData.type !== 'Feature')) {
    console.log('createCities: Skipping city creation (invalid map data provided).');
    // Очищаем существующие города, если они есть
    mapGroup.selectAll('g.city-group').remove();
    return;
  }

  console.log('createCities: Creating cities for the entire map.');

  // Очищаем предыдущие города
  mapGroup.selectAll('g.city-group').remove();

  const citiesGroup = mapGroup.append('g').attr('class', 'city-group');

  // const featuresToProcess = mapData.features || (mapData.type === 'Feature' ? [mapData] : []);
  const featuresToProcess = mapData.features || []; // Обрабатываем только FeatureCollection

  const cityData = [];

  featuresToProcess.forEach((feature) => {
    const props = feature.properties;
    if (!props) return;

    // --- Извлечение данных о городах ---
    // 1. Центр региона
    const centerCoords = props.center;
    if (centerCoords && Array.isArray(centerCoords) && centerCoords.length === 2) {
      cityData.push({
        name: props.region || 'Регион',
        type: 'Центр',
        coordinates: [centerCoords[1], centerCoords[0]], // [lng, lat] -> [lat, lng]
        regionId: props['hc-key'] || props.region,
        feature: feature, // Передаем feature для потенциальной подсветки
      });
    }

    // 2. Столица региона
    const capitalName = props.capital;
    const capitalCoords = props.capital_coordinates;
    if (capitalCoords && Array.isArray(capitalCoords) && capitalCoords.length === 2) {
      cityData.push({
        name: capitalName || 'Столица',
        type: 'Столица',
        coordinates: [capitalCoords[1], capitalCoords[0]], // [lng, lat] -> [lat, lng]
        regionId: props['hc-key'] || props.region,
        feature: feature, // Передаем feature для потенциальной подсветки
      });
    }
  });

  if (cityData.length === 0) {
    console.log('createCities: No city data found in map data.');
    return;
  }

  // --- Отрисовка городов ---
  // Для всей карты, возможно, стоит показывать только столицы или делать их менее заметными
  // Пока рендерим все

  // Фильтр: показывать только столицы или все города?
  // const filteredCityData = cityData.filter(d => d.type === 'Столица'); // Пример: только столицы
  const filteredCityData = cityData; // Показываем все

  const cities = citiesGroup
    .selectAll('g.city')
    .data(filteredCityData)
    .enter()
    .append('g')
    .attr('class', 'city')
    // Используем path.centroid или напрямую координаты для позиционирования
    .attr('transform', (d) => {
      // path.projection()(d.coordinates) преобразует [lng, lat] в [x, y]
      const projected = path.projection()(d.coordinates);
      if (projected && projected.length === 2) {
        return `translate(${projected[0]},${projected[1]})`;
      }
      return 'translate(0,0)'; // fallback
    })
    .style('pointer-events', 'all');

  // Кружок для города
  cities
    .append('circle')
    .attr('r', 4) // Размер можно варьировать
    .attr('fill', (d) => (d.type === 'Столица' ? '#e74c3c' : '#3498db')) // Разный цвет для столиц и центров
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 1)
    .attr('opacity', 0.8);

  // Подпись города (возможно, скрыть на общей карте по умолчанию или показывать при зуме)
  cities
    .append('text')
    .attr('class', 'city-label')
    .attr('dy', -10) // Смещение вверх над кружком
    .attr('text-anchor', 'middle')
    .attr('font-size', '9px') // Меньший шрифт
    .attr('fill', 'white')
    .text((d) => `${d.name}`) // Только имя, без типа на общей карте
    .style('pointer-events', 'none')
    .style('text-shadow', '1px 1px 2px rgba(0, 0, 0, 0.9)')
    .attr('opacity', 0.7); // Немного прозрачности

  // --- Обработчики событий ---
  cities
    .on('mouseover', function (event, d) {
      select(this).select('circle').attr('r', 6).attr('opacity', 1);
      select(this).select('text').attr('opacity', 1);
      // Позиционируем тултип относительно курсора или элемента
      const x = event.layerX || event.offsetX;
      const y = event.layerY || event.offsetY;
      setTooltip({
        visible: true,
        content: `<b>${d.name}</b><br/>${d.type} региона<br/>Регион: ${d.feature?.properties?.region || 'N/A'}`,
        x: x,
        y: y,
      });
    })
    .on('mouseout', function () {
      select(this).select('circle').attr('r', 4).attr('opacity', 0.8);
      select(this).select('text').attr('opacity', 0.7);
      setTooltip({ visible: false, content: '', x: 0, y: 0 });
    });
  // .on('click', function(event, d) {
  //   // Можно добавить обработчик клика по городу, например, для выбора региона
  //   console.log('Клик по городу:', d);
  // });

  return citiesGroup;
};
