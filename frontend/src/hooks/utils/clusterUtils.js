// utils/clusterUtils.js
export const clusterPointsFast = (pointsArray, zoomLevel) => {
  const clusters = new Map();
  const gridSize = Math.max(1, Math.min(100, 12 - zoomLevel));

  for (let i = 0; i < pointsArray.length; i++) {
    const point = pointsArray[i];
    if (point.lat == null || point.lng == null) continue;

    const latKey = Math.round(point.lat * gridSize * 10) / (gridSize * 10);
    const lngKey = Math.round(point.lng * gridSize * 10) / (gridSize * 10);
    const key = `${latKey}_${lngKey}`;

    if (!clusters.has(key)) {
      clusters.set(key, {
        lat: latKey,
        lng: lngKey,
        count: 0,
        points: [],
      });
    }

    const cluster = clusters.get(key);
    cluster.count++;
    cluster.points.push(point);
  }

  const result = [];
  for (const cluster of clusters.values()) {
    if (cluster.count > 0) {
      result.push({
        lat: cluster.lat,
        lng: cluster.lng,
        count: cluster.count,
        isCluster: cluster.count > 1,
        points: cluster.points,
      });
    }
  }

  return result;
};

export const clusterPointsStandard = (pointsArray, zoomLevel) => {
  const clusters = new Map();
  const gridSize = Math.max(1, 12 - zoomLevel);

  for (let i = 0; i < pointsArray.length; i++) {
    const point = pointsArray[i];
    if (point.lat == null || point.lng == null) continue;

    const latKey = Math.round(point.lat * gridSize * 100) / (gridSize * 100);
    const lngKey = Math.round(point.lng * gridSize * 100) / (gridSize * 100);
    const key = `${latKey}_${lngKey}`;

    if (!clusters.has(key)) {
      clusters.set(key, {
        lat: latKey,
        lng: lngKey,
        count: 0,
        points: [],
      });
    }

    const cluster = clusters.get(key);
    cluster.count++;
    cluster.points.push(point);
  }

  const result = [];
  for (const cluster of clusters.values()) {
    if (cluster.count > 0) {
      result.push({
        lat: cluster.lat,
        lng: cluster.lng,
        count: cluster.count,
        isCluster: cluster.count > 1,
        points: cluster.points,
      });
    }
  }

  return result;
};

export const clusterPoints = (pointsArray, zoomLevel = 3) => {
  if (!pointsArray || pointsArray.length === 0) return [];

  if (pointsArray.length > 100000) {
    return clusterPointsFast(pointsArray, zoomLevel);
  }

  return clusterPointsStandard(pointsArray, zoomLevel);
};
