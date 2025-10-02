// utils/colorScale.js
/**
 * Создает цветовую шкалу от зеленого к красному.
 * @param {number} value - Значение от 0 до 1.
 * @returns {string} - Цвет в формате HEX.
 */
export const getColorForValue = (value) => {
  // Убедимся, что значение в диапазоне [0, 1]
  const clampedValue = Math.max(0, Math.min(1, value));

  // Простая линейная интерполяция между зеленым (#4CAF50) и красным (#F44336)
  const r = Math.round(255 * clampedValue + 76 * (1 - clampedValue));
  const g = Math.round(76 * clampedValue + 175 * (1 - clampedValue));
  const b = Math.round(36 * clampedValue + 80 * (1 - clampedValue));

  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Генерирует массив цветов для легенды.
 * @param {number} steps - Количество шагов в легенде.
 * @returns {Array<{color: string, value: number}>} - Массив объектов цвет-значение.
 */
export const generateLegendSteps = (steps = 5) => {
  const legendSteps = [];
  for (let i = 0; i <= steps; i++) {
    const value = i / steps;
    legendSteps.push({
      color: getColorForValue(value),
      value: value,
    });
  }
  return legendSteps;
};
