import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../hooks/useAuth';

// Конфигурация базового URL
const BASE_URL =
  import.meta.env.VITE_IS_WORK == 'prod'
    ? import.meta.env.VITE_API_URL
    : import.meta.env.VITE_API_URL_WORK;

// Хук для скачивания Excel-файла
export const useFileExcelDownload = () => {
  return useMutation({
    mutationFn: async (dateRange) => {
      if (!Array.isArray(dateRange) || dateRange.length < 2) {
        throw new Error('Некорректный диапазон дат');
      }

      const from = dateRange[0].toDate();
      const to = dateRange[1].toDate();

      const response = await fetch(`${BASE_URL}/excel-export?from=${from}&to=${to}`, {
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

// Хук для регистрации
export const useSignupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user']);
    },
    onError: (error) => {
      throw error;
    },
  });
};

// Хук для входа по логину/паролю
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (authData) => {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user']);
    },
    onError: (error) => {
      throw error;
    },
  });
};

// Хук для входа по лицу
export const useFaceLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ face_descriptor }) => {
      const response = await fetch(`${BASE_URL}/face-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ face_descriptor }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Face login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user']);
    },
    onError: (error) => {
      throw error;
    },
  });
};

// Хук для выхода
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
    },
  });
};
