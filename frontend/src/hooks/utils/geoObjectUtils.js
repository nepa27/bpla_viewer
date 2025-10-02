// utils/geoObjectUtils.js
export const createPlacemark = (cluster, isCluster = false) => {
  if (!isCluster) {
    return createSinglePlacemark(cluster);
  }
  return createClusterPlacemark(cluster);
};

const createSinglePlacemark = (cluster) => {
  const point = cluster.points[0];
  return new window.ymaps.Placemark(
    [cluster.lat, cluster.lng],
    {
      hintContent: `${point.type || 'Полет'} ${point.id || ''}`,
      balloonContent: `
        <div style="max-width: 300px;">
          <h3 style="margin: 0 0 10px 0; color: #e74c3c;">Информация о полете</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>ID полета:</b></td>
              <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.id || 'Не указан'}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Дата:</b></td>
              <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.date || 'Не указана'}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Тип ВС:</b></td>
              <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.type || 'Не указан'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><b>Регион:</b></td>
              <td style="padding: 5px;">${point.region || 'Не определен'}</td>
            </tr>
          </table>
        </div>
      `,
    },
    {
      preset: 'islands#dotIcon',
      iconColor: '#e74c3c',
    },
  );
};

const createClusterPlacemark = (cluster) => {
  const flightsByDate = {};
  const MAX_VISIBLE_DATES = 15;
  const MAX_VISIBLE_FLIGHTS_PER_DATE = 10;

  // Группируем полеты по датам
  for (let j = 0; j < cluster.points.length; j++) {
    const point = cluster.points[j];
    const date = point.date || 'Не указана';

    if (!flightsByDate[date]) {
      flightsByDate[date] = {
        flights: [],
        count: 0,
      };
    }
    flightsByDate[date].flights.push({
      id: point.id || 'Не указан',
      type: point.type || 'Не указан',
      region: point.region || 'Не определен',
    });
    flightsByDate[date].count++;
  }

  // Разделяем даты на отображаемые и скрытые
  const allDates = Object.keys(flightsByDate);
  const visibleDates = allDates.slice(0, MAX_VISIBLE_DATES);
  const hiddenDates = allDates.slice(MAX_VISIBLE_DATES);

  let flightsByDateList = '';

  // Создаем отображаемые даты
  for (let k = 0; k < visibleDates.length; k++) {
    const date = visibleDates[k];
    const dateInfo = flightsByDate[date];
    const flights = dateInfo.flights.slice(0, MAX_VISIBLE_FLIGHTS_PER_DATE);

    flightsByDateList += `
      <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
        <div style="font-weight: bold; color: #333; margin-bottom: 8px;">
          ${date} <span style="color: #e74c3c;">(${dateInfo.count} полетов)</span>
        </div>
        <div style="max-height: 120px; overflow-y: auto;">
          <table style="width: 100%; font-size: 12px;">
            <thead>
              <tr style="background: #eee;">
                <th style="padding: 4px; text-align: left;">ID полета</th>
                <th style="padding: 4px; text-align: left;">Тип ВС</th>
                <th style="padding: 4px; text-align: left;">Регион</th>
              </tr>
            </thead>
            <tbody>
    `;

    for (let l = 0; l < flights.length; l++) {
      const flight = flights[l];
      flightsByDateList += `
        <tr>
          <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.id}</td>
          <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.type}</td>
          <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.region}</td>
        </tr>
      `;
    }

    flightsByDateList += `
            </tbody>
          </table>
    `;

    if (dateInfo.flights.length > MAX_VISIBLE_FLIGHTS_PER_DATE) {
      flightsByDateList += `
        <div style="color: #777; font-size: 11px; margin-top: 5px;">
          и еще ${dateInfo.flights.length - MAX_VISIBLE_FLIGHTS_PER_DATE} полетов...
        </div>
      `;
    }

    flightsByDateList += `
        </div>
      </div>
    `;
  }

  // Добавляем скрытые даты с возможностью показать их
  if (hiddenDates.length > 0) {
    flightsByDateList += `
      <div id="hidden-dates-${cluster.lat}-${cluster.lng}" style="display: none;">
    `;

    for (let k = 0; k < hiddenDates.length; k++) {
      const date = hiddenDates[k];
      const dateInfo = flightsByDate[date];
      const flights = dateInfo.flights.slice(0, MAX_VISIBLE_FLIGHTS_PER_DATE);

      flightsByDateList += `
        <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
          <div style="font-weight: bold; color: #333; margin-bottom: 8px;">
            ${date} <span style="color: #e74c3c;">(${dateInfo.count} полетов)</span>
          </div>
          <div style="max-height: 120px; overflow-y: auto;">
            <table style="width: 100%; font-size: 12px;">
              <thead>
                <tr style="background: #eee;">
                  <th style="padding: 4px; text-align: left;">ID полета</th>
                  <th style="padding: 4px; text-align: left;">Тип ВС</th>
                  <th style="padding: 4px; text-align: left;">Регион</th>
                </tr>
              </thead>
              <tbody>
      `;

      for (let l = 0; l < flights.length; l++) {
        const flight = flights[l];
        flightsByDateList += `
          <tr>
            <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.id}</td>
            <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.type}</td>
            <td style="padding: 3px; border-bottom: 1px solid #eee;">${flight.region}</td>
          </tr>
        `;
      }

      flightsByDateList += `
              </tbody>
            </table>
      `;

      if (dateInfo.flights.length > MAX_VISIBLE_FLIGHTS_PER_DATE) {
        flightsByDateList += `
          <div style="color: #777; font-size: 11px; margin-top: 5px;">
            и еще ${dateInfo.flights.length - MAX_VISIBLE_FLIGHTS_PER_DATE} полетов...
          </div>
        `;
      }

      flightsByDateList += `
          </div>
        </div>
      `;
    }

    flightsByDateList += `</div>`;

    // Добавляем кнопку "и еще N дат..." с обработчиком
    flightsByDateList += `
      <button id="show-more-dates-${cluster.lat}-${cluster.lng}" 
              style="color: #3498db; border: none; background: none; cursor: pointer; font-size: 12px; margin: 10px 0; padding: 5px; text-decoration: underline;"
              onclick="showMoreDates('${cluster.lat}', '${cluster.lng}')">
        и еще ${hiddenDates.length} дат...
      </button>
    `;
  }

  return new window.ymaps.Placemark(
    [cluster.lat, cluster.lng],
    {
      hintContent: `Группа полетов: ${cluster.count}`,
      balloonContent: `
        <div style="max-width: 500px; max-height: 600px; overflow-y: auto;">
          <h3 style="margin: 0 0 15px 0; color: #e74c3c; text-align: center;">Группа полетов</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${cluster.count > 99 ? '99+' : cluster.count}</div>
            <div style="color: #666;">полетов в этой группе</div>
            <div style="font-size: 12px; color: #999; margin-top: 5px;">
              Группировка по близким координатам взлета
            </div>
          </div>
          
          <div>
            <h4 style="margin: 0 0 15px 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 8px;">
              Полеты по датам:
            </h4>
            <div id="dates-container-${cluster.lat}-${cluster.lng}">
              ${flightsByDateList}
            </div>
          </div>
        </div>
      `,
    },
    {
      iconLayout: 'default#imageWithContent',
      iconImageHref:
        'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">` +
            `<circle cx="12" cy="12" r="10" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>` +
            `<text x="12" y="16" text-anchor="middle" font-family="Arial" font-size="12" fill="white" font-weight="bold">${cluster.count > 99 ? '99+' : cluster.count}</text>` +
            `</svg>`,
        ),
      iconImageSize: [30, 30],
      iconImageOffset: [-15, -15],
    },
  );
};

// Глобальная функция для отображения дополнительных дат
window.showMoreDates = function (lat, lng) {
  const hiddenDates = document.getElementById(`hidden-dates-${lat}-${lng}`);
  const showMoreButton = document.getElementById(`show-more-dates-${lat}-${lng}`);

  if (hiddenDates && showMoreButton) {
    hiddenDates.style.display = 'block';
    showMoreButton.style.display = 'none';
  }
};

export const createClusterer = () => {
  return new window.ymaps.Clusterer({
    gridSize: 64,
    clusterDisableClickZoom: false,
    clusterOpenBalloonOnClick: true,
    clusterBalloonContentLayout: 'cluster#balloonTwoColumns',
    clusterBalloonPanelMaxMapArea: 0,
    clusterBalloonContentLayoutWidth: 200,
    clusterBalloonContentLayoutHeight: 150,
  });
};
