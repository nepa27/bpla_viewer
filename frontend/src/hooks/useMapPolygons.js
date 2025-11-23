import { useEffect, useMemo, useRef } from 'react';

import { useLocation } from 'react-router';

export const useMapPolygons = ({ mapInstance, ymapsReady, regionsData, onRegionClick }) => {
  const polygonsRef = useRef([]);
  const location = useLocation();
  const selectedRegion = location.state?.region || null;

  const regionsKey = useMemo(() => {
    if (!regionsData) return '';
    const features =
      regionsData.type === 'FeatureCollection' ? regionsData.features : [regionsData];
    return (
      features
        ?.map(
          (region, index) =>
            `${region.properties?.region_id || region.properties?.region || index}-${region.geometry?.type || 'unknown'}`,
        )
        .join('|') || ''
    );
  }, [regionsData]);

  useEffect(() => {
    if (!mapInstance || !ymapsReady || !regionsData) return;

    polygonsRef.current.forEach((p) => {
      if (p.setParent) p.setParent(null);
    });
    polygonsRef.current = [];

    const features =
      regionsData.type === 'FeatureCollection' ? regionsData.features : [regionsData];

    features.forEach((region, index) => {
      if (!region.geometry?.coordinates) return;

      try {
        let polygonsToAdd = [];

        const commonOptions = {
          fillColor: '#00000000', // прозрачный
          strokeColor: '#660011', // темно-бордовый
          strokeWidth: selectedRegion?.properties?.region === region.properties?.region ? 2 : 1,
          opacity: 1,
          cursor: 'pointer',
        };

        const commonProperties = {
          name: region.properties?.region || `Регион ${index}`,
          hintContent: region.properties?.region || `Регион ${index}`,
          regionId: region.properties?.region_id,
        };

        if (region.geometry.type === 'MultiPolygon') {
          region.geometry.coordinates.forEach((polygonCoords) => {
            const polygon = new window.ymaps.Polygon(
              polygonCoords,
              commonProperties,
              commonOptions,
            );
            polygon.events.add('click', () => onRegionClick?.(region));
            polygonsToAdd.push(polygon);
          });
        } else if (region.geometry.type === 'Polygon') {
          const polygon = new window.ymaps.Polygon(
            region.geometry.coordinates,
            commonProperties,
            commonOptions,
          );
          polygon.events.add('click', () => onRegionClick?.(region));
          polygonsToAdd.push(polygon);
        }

        polygonsToAdd.forEach((polygon) => {
          mapInstance.geoObjects.add(polygon);
          polygonsRef.current.push(polygon);
        });
      } catch (regionError) {
        console.warn(`Ошибка добавления региона ${index}:`, regionError);
      }
    });

    return () => {
      polygonsRef.current.forEach((p) => {
        if (p.setParent) p.setParent(null);
      });
      polygonsRef.current = [];
    };
  }, [mapInstance, ymapsReady, regionsKey, onRegionClick, selectedRegion, regionsData]);

  useEffect(() => {
    polygonsRef.current.forEach((polygon) => {
      try {
        const polygonName = polygon.properties.get('name');
        const isSelected = selectedRegion?.properties?.region === polygonName;

        polygon.options.set({
          fillColor: '#00000000', // прозрачный
          strokeColor: '#660011',
          strokeWidth: isSelected ? 2 : 1,
        });
      } catch (e) {
        console.warn('Ошибка обновления стиля полигона:', e);
      }
    });
  }, [selectedRegion]);

  return polygonsRef;
};
