import { getDateNow } from '../functions';

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
          <h3 style="margin: 0 0 10px 0; color: #1890ff;">Информация о полете</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>ID полета:</b></td>
              <td style="padding: 5px; border-bottom: 1px solid #eee;">${point.id || 'Не указан'}</td>
            </tr>
            <tr>
              <td style="padding: 5px; border-bottom: 1px solid #eee;"><b>Дата:</b></td>
              <td style="padding: 5px; border-bottom: 1px solid #eee;">${getDateNow(point.date) || 'Не указана'}</td>
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
      iconColor: '#1890ff',
    },
  );
};

const createClusterPlacemark = (cluster) => {
   const flights = [];

  // Собираем все полеты с датами
  for (let j = 0; j < cluster.points.length; j++) {
    const point = cluster.points[j];
    flights.push({
      id: point.id || 'Не указан',
      type: point.type || 'Не указан',
      region: point.region || 'Не определен',
      date: getDateNow(point.date) || 'Не указана',
    });
  }

  // Сортируем полеты по дате в порядке возрастания
  flights.sort((a, b) => {
    const dateA = new Date(a.date.split('.').reverse().join('-'));
    const dateB = new Date(b.date.split('.').reverse().join('-'));
    return dateA - dateB;
  });

  // Разделяем на первые 5 и остальные
  const firstFiveFlights = flights.slice(0, 5);
  const remainingFlights = flights.slice(5);

  // Создаем таблицу с данными
  let flightsTable = `
    <div style="max-height: 400px; overflow-y: auto;">
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <thead>
          <tr style="background: #e9ecef;">
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #dee2e6;">ID полета</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #dee2e6;">Тип ВС</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #dee2e6;">Регион</th>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #dee2e6;">Дата</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Добавляем первые 5 строк в таблицу
  for (let l = 0; l < firstFiveFlights.length; l++) {
    const flight = firstFiveFlights[l];
    flightsTable += `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 6px 8px; color: #333;">${flight.id}</td>
        <td style="padding: 6px 8px; color: #333;">${flight.type}</td>
        <td style="padding: 6px 8px; color: #333;">${flight.region}</td>
        <td style="padding: 6px 8px; color: #333;">${flight.date}</td>
      </tr>
    `;
  }

  // Добавляем скрытые строки для остальных полетов
  if (remainingFlights.length > 0) {
    flightsTable += `
      <tr id="hidden-rows-${cluster.lat}-${cluster.lng}" style="display: none;">
        <td colspan="4">
          <table style="width: 100%; border-collapse: collapse;">
    `;
    
    for (let l = 0; l < remainingFlights.length; l++) {
      const flight = remainingFlights[l];
      flightsTable += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 6px 8px; color: #333;">${flight.id}</td>
          <td style="padding: 6px 8px; color: #333;">${flight.type}</td>
          <td style="padding: 6px 8px; color: #333;">${flight.region}</td>
          <td style="padding: 6px 8px; color: #333;">${flight.date}</td>
        </tr>
      `;
    }
    
    flightsTable += `
          </table>
        </td>
      </tr>
    `;
  }

  flightsTable += `
        </tbody>
      </table>
    </div>
  `;

  return new window.ymaps.Placemark(
    [cluster.lat, cluster.lng],
    {
      hintContent: `Группа полетов: ${cluster.count}`,
      balloonContent: `
        <div style="max-width: 500px; max-height: 600px; overflow-y: auto;">
          <h2 style="margin: 0 0 15px 0; color: #1890ff; text-align: center;">Группа полетов</h2>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #1890ff;">${cluster.count > 99 ? '99+' : cluster.count}</div>
            <div style="color: #666;">полетов в этой группе</div>
            <div style="font-size: 12px; color: #999; margin-top: 5px;">
              Группировка по близким координатам взлета
            </div>
          </div>
          
          <div>
            <div id="dates-container-${cluster.lat}-${cluster.lng}">
               ${flightsTable}
            </div>
            
            ${remainingFlights.length > 0 ? `
              <div style="text-align: center;">
                <button 
                  onclick="showMoreDates('${cluster.lat}', '${cluster.lng}')" 
                  style="margin-top: 10px; padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                  Показать еще (${remainingFlights.length})
                </button>
              </div>
            ` : ''}
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
            `<circle cx="12" cy="12" r="10" fill="#1890ff" stroke="#c0392b" stroke-width="1"/>` +
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
  try {
    const hiddenRows = document.getElementById(`hidden-rows-${lat}-${lng}`);
    const buttons = document.querySelectorAll(`button[onclick*="showMoreDates('${lat}', '${lng}')"]`);
    
    if (hiddenRows) {
      hiddenRows.style.display = 'table-row';
    }
    
    // Скрываем все кнопки с этим lat/lng
    buttons.forEach(button => {
      button.style.display = 'none';
    });
  } catch (error) {
    console.error('Ошибка при показе дополнительных дат:', error);
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
