// components/MapVisualization/MapAllRegions.jsx
import { geoIdentity, geoPath, select } from 'd3';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { createCities } from '../../d3/createCities';
import { createRegionsWithFlightData } from '../../d3/createRegionsWithFlightData';
import { resetRegionButton } from '../../d3/resetRegionButton';
import { resetZoomButton } from '../../d3/resetZoomButton';
import { useMapZoom } from '../../d3/useMapZoom';
import { swapMapDataCoordinates } from '../../utils/swapMapDataCoordinates';

const MapAllRegions = forwardRef(
  ({ mapData, flightsByRegion, maxFlightsInRegion, onRegionSelect, onResetRegion }, ref) => {
    const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
    const mapGroupRef = useRef(null);
    const svgRef = useRef(null);
    const { initializeZoom, resetZoom, currentScale } = useMapZoom();

    const renderMap = useCallback(
      (dataToRender) => {
        const svg = select(ref.current);
        svgRef.current = svg.node();

        svg.selectAll('*').remove();

        const width = 1200;
        const height = 600;

        svg
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', `0 0 ${width} ${height}`)
          .attr('style', 'max-width: 100%; background-color: #2c3e50;');

        const projection = geoIdentity().reflectY(true).fitSize([width, height], dataToRender);

        console.log('currentScale > ', currentScale);

        const currentScale = projection.scale();
        projection.scale(currentScale * 2);

        const currentTranslate = projection.translate();
        const currentCenterX = currentTranslate[0];
        const currentCenterY = currentTranslate[1];

        const newTranslateX = width / 2 - (width / 1.3 - currentCenterX) * 2;
        const newTranslateY = height / 2 - (height / 2 - currentCenterY) * 2;

        projection.translate([newTranslateX, newTranslateY]);

        const path = geoPath().projection(projection);
        const mapGroup = svg.append('g').attr('class', 'map-group');
        mapGroupRef.current = mapGroup.node();

        // Создаем регионы
        createRegionsWithFlightData({
          svg,
          mapGroup,
          dataToRender,
          path,
          setSelectedRegion: onRegionSelect,
          isSingleRegion: false,
          setTooltip,
          height,
          flightsByRegion,
          maxFlightsInRegion,
        });

        // Создаем города
        createCities({
          mapGroup,
          mapData: dataToRender,
          path,
          setTooltip,
          isSingleRegion: false,
          height,
        });

        resetZoomButton(svg, mapGroup, initializeZoom, resetZoom);
        resetRegionButton(svg, onResetRegion);
      },
      [ref, onRegionSelect, onResetRegion, setTooltip, flightsByRegion, maxFlightsInRegion],
    );

    useEffect(() => {
      const swappedMapData = swapMapDataCoordinates(mapData);

      if (
        (swappedMapData.type === 'FeatureCollection' && swappedMapData.features.length > 0) ||
        swappedMapData.type === 'Feature'
      ) {
        renderMap(swappedMapData);
      }
    }, [mapData, renderMap]);

    return (
      <div className="map-visualization">
        <div className="svg-container">
          <svg ref={ref} className="russia-map-svg"></svg>

          {tooltip.visible && (
            <div
              className="custom-tooltip"
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: 'translateZ(0)',
              }}
              dangerouslySetInnerHTML={{ __html: tooltip.content }}
            />
          )}
        </div>
      </div>
    );
  },
);

export default MapAllRegions;
