// components/FallBackMap/FallBackMap.jsx
/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router';

import MapVisualization from '../components/MapVisualization';
// Добавлен useEffect для отладки

import { useFlightDataFallBack } from '../hooks/useFlightDataFallBack';
import { useMapData } from '../hooks/useMapData';
import { generateLegendSteps, getColorForValue } from '../utils/colorScale';
import ROUTES from '../utils/routes';
import './FallBackMap.css';

const FallBackMap = ({ geoData, flightsData }) => {
  const svgRef = useRef();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const navigate = useNavigate();

  const { mapData, loading } = useMapData(geoData);
  const { filteredFlights, flightsByRegion } = useFlightDataFallBack(flightsData);

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
      setSelectedRegion(region);

      navigate(`${ROUTES.REGIONS}/${region.region_id}`);
    },
    [navigate],
  );

  const handleResetRegion = useCallback(() => {
    setSelectedRegion(null);
  }, []);

  if (loading) {
    return (
      <div className="russia-map-loading">
        <div className="loading-content">
          <p>Загрузка карты России...</p>
        </div>
      </div>
    );
  }

  // --- Отладка: Передаем отладочные пропсы ---
  return (
    <div className="russia-map-container">
      <div className="map-content">
        <div className="map-wrapper">
          <MapVisualization
            ref={svgRef}
            mapData={mapData}
            selectedRegion={selectedRegion}
            flightsByRegion={flightsByRegion}
            maxFlightsInRegion={maxFlightsInRegion}
            onRegionSelect={handleRegionSelect}
            onResetRegion={handleResetRegion}
          />
        </div>
        <div className="map-legend">
          <h4>Количество полетов</h4>
          <div className="legend-steps">
            {legendSteps.map((step, index) => (
              <div key={index} className="legend-step">
                <div className="legend-color-box" style={{ backgroundColor: step.color }}></div>
                <span className="legend-label">
                  {index === 0 ? '0' : `${Math.round(step.value * maxFlightsInRegion)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  // --- Конец отладки ---
};

export default FallBackMap;

// /* eslint-disable no-unused-vars */
// import { useCallback, useRef, useState } from 'react';

// import MapVisualization from '../components/MapVisualization';
// import { useFlightData } from '../hooks/useFlightData';
// import { useMapData } from '../hooks/useMapData';
// import './FallBackMap.css';

// const FallBackMap = ({ geoData, flightsData }) => {
//   const svgRef = useRef();
//   const [selectedRegion, setSelectedRegion] = useState(null);
//   const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });

//   const { mapData, loading } = useMapData(geoData);
//   const { filteredFlights } = useFlightData(flightsData);

//   const handleRegionSelect = useCallback((region) => {
//     setSelectedRegion(region);
//   }, []);

//   const handleResetRegion = useCallback(() => {
//     setSelectedRegion(null);
//   }, []);

//   if (loading) {
//     return (
//       <div className="russia-map-loading">
//         <div className="loading-content">
//           <p>Загрузка карты России...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="russia-map-container">
//       <div className="map-content">
//         <div className="map-wrapper">
//           <MapVisualization
//             ref={svgRef}
//             mapData={mapData}
//             selectedRegion={selectedRegion}
//             filteredFlights={filteredFlights}
//             onRegionSelect={handleRegionSelect}
//             onResetRegion={handleResetRegion}
//             tooltip={tooltip}
//             setTooltip={setTooltip}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FallBackMap;
