// FallBackMap.jsx.jsx
import { useState, useRef, useCallback } from 'react';
import './FallBackMap.css';
import MapVisualization from '../components/MapVisualization';

import { useMapData } from '../hooks/useMapData';
import { useFlightData } from '../hooks/useFlightData';
import * as d3 from 'd3';

const FallBackMap = ({ geoData, flightsData }) => {
  const svgRef = useRef();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
  
  const { mapData, loading } = useMapData(geoData);
  const { filteredFlights } = useFlightData(flightsData);

  const handleRegionSelect = useCallback((region) => {
    setSelectedRegion(region);
  }, []);

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

  return (
    <div className="russia-map-container">
      <div className="map-content">
        <div className="map-wrapper">
          <MapVisualization
            ref={svgRef}
            mapData={mapData}
            selectedRegion={selectedRegion}
            filteredFlights={filteredFlights}
            onRegionSelect={handleRegionSelect}
            onResetRegion={handleResetRegion}
            tooltip={tooltip}
            setTooltip={setTooltip}
          />
          
        </div>
        
      
      </div>
    </div>
  );
};

export default FallBackMap;