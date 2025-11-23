import { useCallback } from 'react';

export const useMapExport = () => {
  const exportMapWithLegend = useCallback(async () => {
    try {
      // Проверяем, что мы находимся в браузере
      if (typeof window === 'undefined') {
        console.error('Экспорт доступен только в браузере');
        return;
      }

      // Проверяем наличие необходимых элементов
      const checkElementsExist = () => {
        const containers = [
          '.russia-map-container',
          '.map-content',
          '.russia-map-wrapper',
          '[class*="map"]',
        ];

        for (const selector of containers) {
          const element = document.querySelector(selector);
          if (element) {
            return { found: true, element, selector };
          }
        }
        return { found: false, element: null, selector: null };
      };

      const { found, element, selector } = checkElementsExist();

      if (!found) {
        console.error('Ни один из контейнеров карты не найден');
        alert('Ошибка: Не удалось найти элементы для экспорта. Пожалуйста, обновите страницу.');
        return;
      }

      const result = await performExport(element);

      return result;
    } catch (error) {
      console.error('Критическая ошибка экспорта:', error);
      // Альтернативный способ - экспортируем только SVG
      await exportSimpleSVG();
    }
  }, []);

  const performExport = async (originalContainer) => {
    try {
      // Проверяем, что контейнер существует
      if (!originalContainer) {
        throw new Error('Контейнер не существует');
      }

      // Создаем временный контейнер для экспорта
      const tempContainer = document.createElement('div');

      // Клонируем контейнер с проверкой
      try {
        const clonedContainer = originalContainer.cloneNode(true);
        tempContainer.appendChild(clonedContainer);
        document.body.appendChild(tempContainer);
      } catch (cloneError) {
        console.error('Ошибка клонирования контейнера:', cloneError);
        throw new Error('Не удалось клонировать контейнер');
      }

      // Удаляем кнопки управления
      try {
        const buttonsToRemove = tempContainer.querySelectorAll(
          '.reset-zoom-button, .reset-region-button',
        );
        buttonsToRemove.forEach((button) => {
          if (button.parentNode) {
            button.parentNode.removeChild(button);
          }
        });
      } catch (buttonError) {
        console.warn('Ошибка удаления кнопок:', buttonError);
      }

      // Удаляем все элементы с классами, которые могут мешать
      try {
        const unwantedElements = tempContainer.querySelectorAll('.custom-tooltip, .ignore-export');
        unwantedElements.forEach((element) => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        });
      } catch (unwantedError) {
        console.warn('Ошибка удаления ненужных элементов:', unwantedError);
      }

      // Используем html2canvas для экспорта с высоким качеством
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;

      const result = await html2canvas(tempContainer, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 20000,
        timeout: 20000,
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
        windowWidth: tempContainer.scrollWidth,
        windowHeight: tempContainer.scrollHeight,
        pixelRatio: window.devicePixelRatio || 1,
        letterRendering: true,
        ignoreElements: (element) => {
          return (
            element.classList?.contains('ignore-export') ||
            element.classList?.contains('custom-tooltip') ||
            element.classList?.contains('reset-zoom-button') ||
            element.classList?.contains('reset-region-button')
          );
        },
      });

      // Удаляем временный контейнер
      try {
        if (tempContainer.parentNode) {
          document.body.removeChild(tempContainer);
        }
      } catch (removeError) {
        console.warn('Ошибка удаления временного контейнера:', removeError);
      }

      return result.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('Ошибка высококачественного экспорта:', error);
      // Попробуем простой способ
      await exportSimpleSVG();
    }
  };

  const exportSimpleSVG = async () => {
    try {
      const svgElement = document.querySelector('.russia-map-svg');

      if (svgElement) {
        // Создаем изображение из SVG с высоким качеством
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.onload = () => {
          // Увеличиваем размеры для лучшего качества
          canvas.width = img.width * 3;
          canvas.height = img.height * 3;
          ctx.fillStyle = '#2c3e50';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const link = document.createElement('a');
          link.download = 'russian_map_high_quality.png';
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();
        };

        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        img.src = url;
      } else {
        console.error('Не удалось найти SVG элемент для экспорта');
        alert('Не удалось экспортировать изображение. Пожалуйста, обновите страницу.');
      }
    } catch (error) {
      console.error('Ошибка простого экспорта:', error);
      alert('Ошибка экспорта. Пожалуйста, попробуйте позже.');
    }
  };

  return { exportMapWithLegend };
};
