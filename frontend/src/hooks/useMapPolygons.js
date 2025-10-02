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
      if (!region.geometry?.coordinates) {
        return;
      }

      try {
        let polygonsToAdd = [];

        if (region.geometry.type === 'MultiPolygon') {
          region.geometry.coordinates.forEach((polygonCoords, polyIndex) => {
            const polygon = new window.ymaps.Polygon(
              polygonCoords,
              {
                name: region.properties?.region || `Регион ${index}-${polyIndex}`,
                hintContent: region.properties?.region || `Регион ${index}-${polyIndex}`,
                regionId: region.properties?.region_id,
              },
              {
                fillColor:
                  selectedRegion?.properties?.region === region.properties?.region
                    ? '#ff444499'
                    : '#4488ff99',
                strokeColor: '#000000',
                strokeWidth:
                  selectedRegion?.properties?.region === region.properties?.region ? 2 : 1,
                opacity: 0.7,
                cursor: 'pointer',
              },
            );

            polygon.events.add('click', () => {
              onRegionClick?.(region);
            });

            polygonsToAdd.push(polygon);
          });
        } else if (region.geometry.type === 'Polygon') {
          const polygon = new window.ymaps.Polygon(
            region.geometry.coordinates,
            {
              name: region.properties?.region || `Регион ${index}`,
              hintContent: region.properties?.region || `Регион ${index}`,
              regionId: region.properties?.region_id,
            },
            {
              fillColor:
                selectedRegion?.properties?.region === region.properties?.region
                  ? '#ff444499'
                  : '#4488ff99',
              strokeColor: '#000000',
              strokeWidth: selectedRegion?.properties?.region === region.properties?.region ? 2 : 1,
              opacity: 0.7,
              cursor: 'pointer',
            },
          );

          polygon.events.add('click', () => {
            onRegionClick?.(region);
          });

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
          fillColor: isSelected ? '#ff444499' : '#4488ff99',
          strokeWidth: isSelected ? 2 : 1,
        });
      } catch (e) {
        console.warn('Ошибка обновления стиля полигона:', e);
      }
    });
  }, [selectedRegion]);

  return polygonsRef;
};
