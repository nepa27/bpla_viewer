// utils/loadYmaps.js
export const loadYmapsScript = () => {
  // Проверяем, не загружен ли уже скрипт
  if (window.ymaps) {
    window.ymapsLoaded = true;
    window.dispatchEvent(new CustomEvent('loadYmaps', { detail: window.ymaps }));
    return Promise.resolve(window.ymaps);
  }

  return new Promise((resolve, reject) => {
    // Создаем тег script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    // Используем import.meta.env для получения переменной окружения VITE_
    const apiKey = import.meta.env.VITE_YANDEX_API_KEY;
    if (!apiKey) {
      console.warn(
        'API ключ Yandex Maps не найден в переменных окружения (VITE_YANDEX_API_KEY). Загрузка API без ключа.',
      );
      // Можно оставить без ключа для тестирования, но это ограничено
    }
    script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${apiKey ? `&apikey=${apiKey}` : ''}`;
    script.async = true;

    script.onload = () => {
      // Ждем, пока ymaps будет готов
      window.ymaps.ready(() => {
        window.ymapsLoaded = true;
        window.dispatchEvent(new CustomEvent('loadYmaps', { detail: window.ymaps }));
        resolve(window.ymaps);
      });
    };

    script.onerror = (error) => {
      reject(new Error(`Ошибка загрузки скрипта Yandex Maps: ${error.message}`));
    };

    document.head.appendChild(script);
  });
};
