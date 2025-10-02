/* eslint-disable no-unused-vars */
import { memo, useCallback, useRef, useState } from 'react';

import { useNavigate } from 'react-router';

import { useMapPoints } from '../../hooks/useMapPoints';
import { useMapPolygons } from '../../hooks/useMapPolygons';
import { useYandexMap } from '../../hooks/useYandexMap';
import ROUTES from '../../utils/routes';
import FallBackMap from '../FallBackMap/FallBackMap';
import style from './MapComponent.module.css';

const MapComponent = memo(
  ({ regionsData, points = [], errorLoadYmaps, center = [69, 100], zoom = 3 }) => {
    const mapContainerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const navigate = useNavigate();

    const handleRegionClick = useCallback(
      (region) => {
        const regionId = region.properties?.region_id;

        setSelectedRegion(region);

        if (regionId) {
          navigate(`${ROUTES.REGIONS}/${regionId}`, { state: region });
        } else {
          console.warn('region_id отсутствует в свойствах региона:', region);
        }
      },
      [navigate],
    );

    const { mapInstance, ymapsReady } = useYandexMap({
      containerRef: mapContainerRef,
      center,
      zoom,
      onReady: () => {
        setIsLoading(false);
        setError(null);
      },
      onError: (err) => {
        console.error('Ошибка инициализации карты:', err);
        setError(`Ошибка инициализации карты: ${err.message}`);
        setIsLoading(false);
      },
    });

    // Отрисовка полигонов
    const polygonsRef = useMapPolygons({
      mapInstance,
      ymapsReady,
      regionsData,
      selectedRegion,
      onRegionClick: handleRegionClick,
    });

    // Отрисовка точек
    const pointsRef = useMapPoints({
      mapInstance,
      ymapsReady,
      points,
    });

    if (errorLoadYmaps && regionsData) {
      return (
        <div className={style['map-container']}>
          <FallBackMap geoData={regionsData} flightsData={points} />
        </div>
      );
    }

    if (error && regionsData) {
      return (
        <div className={style['map-container']}>
          <FallBackMap geoData={regionsData} flightsData={points} />
        </div>
      );
    }

    if (error && !regionsData) {
      return <div className={style['map-error']}>Ошибка: {error}</div>;
    }

    return (
      <div className={style['map-container']}>
        {isLoading && <div className={style['map-loading']}>Загрузка данных карты...</div>}
        <div ref={mapContainerRef} className={style['map-element']} />
      </div>
    );
  },
);

export default MapComponent;
