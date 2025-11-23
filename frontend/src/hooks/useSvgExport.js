import html2canvas from 'html2canvas';

import { useCallback } from 'react';

export const useSvgExport = () => {
  const exportSvgToPng = useCallback(async (svgElement, filename = 'map.png') => {
    if (!svgElement) return;

    try {
      // Создаем контейнер с SVG
      const container = document.createElement('div');
      container.appendChild(svgElement.cloneNode(true));
      container.style.width = svgElement.getAttribute('width') || '1200';
      container.style.height = svgElement.getAttribute('height') || '600';

      // Используем html2canvas
      const canvas = await html2canvas(container, {
        backgroundColor: '#2c3e50', // Соответствует фону SVG
        scale: 2, // Увеличиваем качество
      });

      // Создаем ссылку для скачивания
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();

      return { success: true };
    } catch (error) {
      console.error('Ошибка экспорта SVG в PNG:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return { exportSvgToPng };
};
