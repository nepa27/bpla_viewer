// utils/hashUtils.js
export const getClusterHash = (clusters) => {
  if (!clusters || clusters.length === 0) return '';

  const keys = [];
  const maxItems = Math.min(clusters.length, 1000);

  for (let i = 0; i < maxItems; i++) {
    const cluster = clusters[i];
    keys.push(`${Math.round(cluster.lat * 100)}_${Math.round(cluster.lng * 100)}_${cluster.count}`);
  }

  return keys.join('|');
};

export const hasDataChanged = (oldPoints, newPoints) => {
  if (!oldPoints || !newPoints) return oldPoints !== newPoints;
  if (oldPoints.length !== newPoints.length) return true;

  const checkCount = Math.min(oldPoints.length, 100);
  for (let i = 0; i < checkCount; i++) {
    if (oldPoints[i]?.id !== newPoints[i]?.id) return true;
  }

  return false;
};
