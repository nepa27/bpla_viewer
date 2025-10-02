import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router';

import MapVisualization from '../../components/MapVisualization/MapVisualization';
import { useFlightDataFallBack } from '../../hooks/useFlightDataFallBack';
import { useMapData } from '../../hooks/useMapData';
import { generateLegendSteps } from '../../utils/colorScale';
import ROUTES from '../../utils/routes';
import style from './FallBackMap.module.css';

const FallBackMap = ({ geoData, flightsData }) => {
  const svgRef = useRef();
  const navigate = useNavigate();

  const { mapData, loading } = useMapData(geoData);
  const { flightsByRegion } = useFlightDataFallBack(flightsData);

  const maxFlightsInRegion = useMemo(() => {
    if (flightsByRegion.size === 0) {
      return 1;
    }
    const max = Math.max(...flightsByRegion.values());
    return max;
  }, [flightsByRegion]);

  const legendSteps = useMemo(() => generateLegendSteps(5), []);

  const handleRegionSelect = useCallback(
    (region) => {
      navigate(`${ROUTES.REGIONS}/${region.region_id}`);
    },
    [navigate],
  );

  if (loading) {
    return (
      <div className={style['russia-map-loading']}>
        <div className={style['loading-content']}>
          <p>Загрузка карты России...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={style['russia-map-container']}>
      <div className={style['map-content']}>
        <div className={style['map-wrapper']}>
          <MapVisualization
            ref={svgRef}
            mapData={mapData}
            flightsByRegion={flightsByRegion}
            maxFlightsInRegion={maxFlightsInRegion}
            onRegionSelect={handleRegionSelect}
          />
        </div>
        <div className={style['map-legend']}>
          <h4>Количество полетов</h4>
          <div className={style['legend-steps']}>
            {legendSteps.map((step, index) => (
              <div key={index} className={style['legend-step']}>
                <div
                  className={style['legend-color-box']}
                  style={{ backgroundColor: step.color }}
                ></div>
                <span className={style['legend-label']}>
                  {index === 0 ? '0' : `${Math.round(step.value * maxFlightsInRegion)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallBackMap;
