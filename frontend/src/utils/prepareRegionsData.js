/**
 * Подготавливает данные регионов для отображения в меню
 * @param {Object} regionsData - данные регионов в формате GeoJSON
 * @returns {Array} массив объектов с данными регионов
 */
export const prepareRegionsForMenu = (regionsData) => {
  if (!regionsData?.features?.length) {
    return [];
  }

  return regionsData.features
    .map((feature) => {
      const { region_id, region } = feature.properties || {};

      if (!region_id || !region) {
        return null;
      }

      return {
        id: region_id,
        name: region,
        path: `/regions/${region_id}`,
      };
    })
    .filter(Boolean) // Убираем null значения
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
};
