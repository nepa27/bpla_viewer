import { useMutation } from '@tanstack/react-query';

import { timeToDateConverter } from '../utils/functions';
import ROUTES from '../utils/routes';

const BASE_URL =
  import.meta.env.VITE_IS_WORK == 'prod'
    ? import.meta.env.VITE_API_URL
    : import.meta.env.VITE_API_URL_WORK;

/**
 * Хук для скачивания Excel-файла
 * Возвращает mutation: { mutate, isLoading, error, isSuccess }
 */
export const useFileExcelDownload = () => {
  return useMutation({
    mutationFn: async (dateRange) => {
      if (!Array.isArray(dateRange) || dateRange.length < 2) {
        throw new Error('Некорректный диапазон дат');
      }

      const from = timeToDateConverter(dateRange[0].toDate());
      const to = timeToDateConverter(dateRange[1].toDate());

      const response = await fetch(`${BASE_URL}${ROUTES.EXСEL_EXPORT}?from=${from}&to=${to}`, {
        method: 'GET',
        // credentials: 'include', 
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Неизвестная ошибка');
        throw new Error(`Ошибка сервера: ${response.status} ${errorText}`);
      }

      return response.blob();
    },
    onSuccess: (blob) => {
      // Запускаем скачивание
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flight_statistics.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Ошибка при скачивании Excel:', error);
    },
  });
};
