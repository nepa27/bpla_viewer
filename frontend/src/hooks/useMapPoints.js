

import { useEffect, useRef } from 'react';

export const useMapPoints = ({ mapInstance, ymapsReady, points }) => {
  const pointsRef = useRef([]);

  useEffect(() => {
    if (!mapInstance || !ymapsReady) return;

    // Создаем хэш текущих точек для сравнения
    const getCurrentPointsHash = () => {
      return pointsRef.current
        .map(point => {
          const geometry = point.geometry?.getCoordinates();
          const properties = point.properties?.getAll();
          return `${geometry?.[0]}-${geometry?.[1]}-${properties?.hintContent || ''}`;
        })
        .sort()
        .join('|');
    };

    // Создаем хэш новых точек
    const getNewPointsHash = () => {
      return points
        .filter(p => p.lat != null && p.lng != null)
        .map(p => `${p.lat}-${p.lng}-${p.type || 'Точка'}`)
        .sort()
        .join('|');
    };

    const currentHash = getCurrentPointsHash();
    const newHash = getNewPointsHash();

    // Если точки не изменились, ничего не делаем
    if (currentHash === newHash && pointsRef.current.length === points.length) {
      return;
    }

    // Очищаем старые точки
    pointsRef.current.forEach(point => {
      try {
        if (mapInstance.geoObjects && point.getParent()) {
          mapInstance.geoObjects.remove(point);
        }
      } catch (e) {
        console.warn('Ошибка удаления точки:', e);
      }
    });
    pointsRef.current = [];

    // Добавляем новые точки
    points.forEach((point, idx) => {
      if (point.lat == null || point.lng == null) return;
      
      try {
        const placemark = new window.ymaps.Placemark(
          [point.lat, point.lng],
          {
            hintContent: `${point.type || 'Точка'} ${idx + 1}`,
            balloonContent: `<b>Дата:</b> ${point.date || ''}<br><b>Тип:</b> ${point.type || ''}`
          },
          {
            preset: 'islands#redCircleIcon'
          }
        );
        mapInstance.geoObjects.add(placemark);
        pointsRef.current.push(placemark);
      } catch (pointError) {
        console.warn(`Ошибка добавления точки ${idx}:`, pointError);
      }
    });

    return () => {
      // Очистка при изменении зависимостей
      pointsRef.current.forEach(point => {
        try {
          if (mapInstance.geoObjects && point.getParent()) {
            mapInstance.geoObjects.remove(point);
          }
        } catch (e) {
          console.warn('Ошибка удаления точки при очистке:', e);
        }
      });
      pointsRef.current = [];
    };
  }, [mapInstance, ymapsReady, points]); // Тот же массив зависимостей, что и в оригинале

  return pointsRef;
};