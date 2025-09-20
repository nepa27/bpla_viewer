import  { forwardRef, useCallback, useEffect } from 'react';
import * as d3 from 'd3';
import { createRegions } from '../d3/createRegions';
import { createFlightPoints } from '../d3/createFlightPoints';
import { resetRegionButton } from '../d3/resetRegionButton';
import { resetZoomButton } from '../d3/resetZoomButton';
import { useMapZoom } from '../d3/useMapZoom';

// Функция для замены координат местами (долгота <-> широта)
const swapCoordinates = (geometry) => {
  if (!geometry) return geometry;
  
  const swapCoords = (coords) => {
    if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number') {
      // Это точка [lng, lat] -> меняем на [lat, lng]
      return [coords[1], coords[0]];
    } else if (Array.isArray(coords)) {
      // Это массив координат - рекурсивно обрабатываем каждый элемент
      return coords.map(swapCoords);
    }
    return coords;
  };
  
  const newGeometry = { ...geometry };
  
  if (geometry.coordinates) {
    newGeometry.coordinates = swapCoords(geometry.coordinates);
  }
  
  return newGeometry;
};

// Функция для замены координат во всем FeatureCollection
const swapMapDataCoordinates = (mapData) => {
  if (!mapData) return mapData;
  
  if (mapData.type === "FeatureCollection") {
    return {
      ...mapData,
      features: mapData.features.map(feature => ({
        ...feature,
        geometry: swapCoordinates(feature.geometry)
      }))
    };
  } else if (mapData.type === "Feature") {
    return {
      ...mapData,
      geometry: swapCoordinates(mapData.geometry)
    };
  }
  
  return mapData;
};

const MapVisualization = forwardRef(({
  mapData,
  selectedRegion,
  filteredFlights,
  onRegionSelect,
  onResetRegion,
  tooltip,
  setTooltip
}, ref) => {
  const { initializeZoom, resetZoom } = useMapZoom();
  
  const renderMap = useCallback((dataToRender, isSingleRegion = false) => {
    if (!dataToRender) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    
    const width = 1200;
    const height = 600;

    svg.attr("width", width)
       .attr("height", height)
       .attr("viewBox", `0 0 ${width} ${height}`)
       .attr("style", "max-width: 100%; height: auto; background-color: #2c3e50;");

    const projection = d3.geoIdentity()
      .reflectY(true)
      .fitSize([width, height], dataToRender);

    if (!isSingleRegion) {
      const currentScale = projection.scale();
      projection.scale(currentScale * 2);

      const currentTranslate = projection.translate();
      const currentCenterX = currentTranslate[0];
      const currentCenterY = currentTranslate[1];
      
      const newTranslateX = width / 2 - (width / 1.3 - currentCenterX) * 2;
      const newTranslateY = height / 2 - (height / 2 - currentCenterY) * 2;
      
      projection.translate([newTranslateX, newTranslateY]);
    }

    const path = d3.geoPath().projection(projection);
    const mapGroup = svg.append("g").attr("class", "map-group");

    createRegions({
      svg, 
      mapGroup, 
      dataToRender, 
      path, 
      setSelectedRegion: onRegionSelect, 
      isSingleRegion, 
      setTooltip, 
      height
    });

    createFlightPoints({
      svg, 
      mapGroup, 
      filteredFlights, 
      projection, 
      isSingleRegion, 
      setTooltip, 
      height
    });

    resetZoomButton(svg, mapGroup, initializeZoom, resetZoom);
    resetRegionButton(svg, onResetRegion);

  }, [ref, filteredFlights, initializeZoom, resetZoom, onRegionSelect, onResetRegion, setTooltip]);

  useEffect(() => {
    if (!mapData) return;

    // Заменяем координаты местами
    const swappedMapData = swapMapDataCoordinates(mapData);
    
    let dataToRender;
    let isSingleRegion = false;

    if (selectedRegion) {
      const foundFeature = swappedMapData.features.find(
        feature => 
          feature.properties?.['hc-key'] === selectedRegion.id ||
          feature.properties?.region === selectedRegion.id
      );
      
      if (foundFeature) {
        dataToRender = { 
          type: "FeatureCollection", 
          features: [foundFeature] 
        };
        isSingleRegion = true;
      } else {
        dataToRender = swappedMapData;
      }
    } else {
      dataToRender = swappedMapData;
    }

    if ((dataToRender.type === "FeatureCollection" && dataToRender.features.length > 0) || 
        dataToRender.type === "Feature") {
      renderMap(dataToRender, isSingleRegion);
    }
  }, [mapData, selectedRegion, renderMap]);

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
              transform: 'translateZ(0)'
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  );
});

export default MapVisualization;

// import  { forwardRef, useCallback, useEffect } from 'react';
// import * as d3 from 'd3';
// import { createRegions } from '../d3/createRegions';
// import { createFlightPoints } from '../d3/createFlightPoints';
// import { resetRegionButton } from '../d3/resetRegionButton';
// import { resetZoomButton } from '../d3/resetZoomButton';
// import { useMapZoom } from '../d3/useMapZoom';

// const MapVisualization = forwardRef(({
//   mapData,
//   selectedRegion,
//   filteredFlights,
//   onRegionSelect,
//   onResetRegion,
//   tooltip,
//   setTooltip
// }, ref) => {
//   const { initializeZoom, resetZoom } = useMapZoom();
//   console.log(`  mapData,
//   selectedRegion,
//   filteredFlights,
//   onRegionSelect,
//   onResetRegion,
//   tooltip,
//   setTooltip`,   mapData,
//   selectedRegion,
//   filteredFlights,
//   onRegionSelect,
//   onResetRegion,
//   tooltip,
//   setTooltip);
  
//   const renderMap = useCallback((dataToRender, isSingleRegion = false) => {
//     if (!dataToRender) return;

//     const svg = d3.select(ref.current);
//     svg.selectAll("*").remove();
    
//     const width = 1200;
//     const height = 600;

//     svg.attr("width", width)
//        .attr("height", height)
//        .attr("viewBox", `0 0 ${width} ${height}`)
//        .attr("style", "max-width: 100%; height: auto; background-color: #2c3e50;");

//     const projection = d3.geoIdentity()
//       .reflectY(true)
//       .fitSize([width, height], dataToRender);

//     if (!isSingleRegion) {
//       const currentScale = projection.scale();
//       projection.scale(currentScale * 2);

//       const currentTranslate = projection.translate();
//       const currentCenterX = currentTranslate[0];
//       const currentCenterY = currentTranslate[1];
      
//       const newTranslateX = width / 2 - (width / 1.3 - currentCenterX) * 2;
//       const newTranslateY = height / 2 - (height / 2 - currentCenterY) * 2;
      
//       projection.translate([newTranslateX, newTranslateY]);
//     }

//     const path = d3.geoPath().projection(projection);
//     const mapGroup = svg.append("g").attr("class", "map-group");

//     createRegions({
//       svg, 
//       mapGroup, 
//       dataToRender, 
//       path, 
//       setSelectedRegion: onRegionSelect, 
//       isSingleRegion, 
//       setTooltip, 
//       height
//     });

//     createFlightPoints({
//       svg, 
//       mapGroup, 
//       filteredFlights, 
//       projection, 
//       isSingleRegion, 
//       setTooltip, 
//       height
//     });

//     resetZoomButton(svg, mapGroup, initializeZoom, resetZoom);
//     resetRegionButton(svg, onResetRegion);

//   }, [ref, filteredFlights, initializeZoom, resetZoom, onRegionSelect, onResetRegion, setTooltip]);

//   useEffect(() => {
//     if (!mapData) return;

//     let dataToRender;
//     let isSingleRegion = false;

//     if (selectedRegion) {
//       const foundFeature = mapData.features.find(
//         feature => 
//           feature.properties?.['hc-key'] === selectedRegion.id ||
//           feature.properties?.region === selectedRegion.id
//       );
      
//       if (foundFeature) {
//         dataToRender = { 
//           type: "FeatureCollection", 
//           features: [foundFeature] 
//         };
//         isSingleRegion = true;
//       } else {
//         dataToRender = mapData;
//       }
//     } else {
//       dataToRender = mapData;
//     }

//     if ((dataToRender.type === "FeatureCollection" && dataToRender.features.length > 0) || 
//         dataToRender.type === "Feature") {
//       renderMap(dataToRender, isSingleRegion);
//     }
//   }, [mapData, selectedRegion, renderMap]);

//   return (
//     <div className="map-visualization">
//       <div className="svg-container">
//         <svg ref={ref} className="russia-map-svg"></svg>
        
//         {tooltip.visible && (
//           <div 
//             className="custom-tooltip"
//             style={{
//               left: `${tooltip.x}px`,
//               top: `${tooltip.y}px`,
//               transform: 'translateZ(0)'
//             }}
//           >
//             {tooltip.content}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// });

// export default MapVisualization;