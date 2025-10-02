/* eslint-disable no-unused-vars */
import { clusterPoints } from './clusterUtils';
import { createClusterer, createPlacemark } from './geoObjectUtils';
import { getClusterHash } from './hashUtils';

export const processPoints = (pointsArray, zoomLevel) => {
  if (!pointsArray || pointsArray.length === 0) return [];

  const clustered = clusterPoints(pointsArray, zoomLevel);

  return clustered;
};

export const createGeoObjects = (clusteredPoints) => {
  const geoObjects = [];

  for (let i = 0; i < clusteredPoints.length; i++) {
    const cluster = clusteredPoints[i];
    if (!cluster) continue;

    const placemark = createPlacemark(cluster, cluster.isCluster);
    geoObjects.push(placemark);
  }

  return geoObjects;
};

export const updateMapPoints = (mapInstance, points, zoom, pointsRef, clustererRef) => {
  const clusteredPoints = processPoints(points, zoom);
  const newHash = getClusterHash(clusteredPoints);
  const currentHash = pointsRef.current.hash || '';

  if (currentHash === newHash && pointsRef.current.length > 0) {
    return;
  }

  try {
    if (clustererRef.current && mapInstance.geoObjects) {
      mapInstance.geoObjects.remove(clustererRef.current);
    }
  } catch (e) {
    // Игнорируем ошибки очистки
  }

  const clusterer = createClusterer();
  const geoObjects = createGeoObjects(clusteredPoints);

  clusterer.add(geoObjects);
  mapInstance.geoObjects.add(clusterer);

  clustererRef.current = clusterer;
  pointsRef.current = clusteredPoints;
  pointsRef.current.hash = newHash;
};
