// components/Drawer/Drawer.jsx
import { useState } from 'react';

import { useRegions } from '../../hooks/useRegions';
import { prepareRegionsForMenu } from '../../utils/prepareRegionsData';
import ROUTES from '../../utils/routes';
import './Drawer.css';
import { DrawerFooter } from './DrawerFooter';
import { DrawerHeader } from './DrawerHeader';
import { DrawerNavigation } from './DrawerNavigation';

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_WORK;

export const Drawer = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegionsExpanded, setIsRegionsExpanded] = useState(true);

  const menuItems = [
    // { label: 'Главная', path: ROUTES.HOME },
    // { label: 'Все регионы', path: ROUTES.REGIONS },
    // { label: 'Статистика', path: '/statistics' },
    { label: 'Документация Swagger', path: `${BASE_URL}/docs` }, //'http://192.168.0.133:8000/docs' },
    { label: 'Документация Redoc', path: `${BASE_URL}/redoc` }, //'http://192.168.0.133:8000/docs' },
    { label: 'Презентация', path: `${BASE_URL}/prezentation` }, //'http://192.168.0.133:8000/prezentation' }, // @TODO
    { label: 'Админ панель', path: `${BASE_URL}/admin/flight/list` }, //'http://192.168.0.133:8000/admin/flight/list' },
  ];
  // Получаем данные регионов
  const { data: regionsData } = useRegions();

  // Подготавливаем данные регионов
  const regions = prepareRegionsForMenu(regionsData);

  // Очистка поиска
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <>
      {/* Overlay для закрытия при клике вне меню */}
      {isOpen && (
        <div
          className="drawer-overlay"
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-hidden="true"
        />
      )}

      {/* Боковое меню */}
      <aside className={`drawer ${isOpen ? 'open' : 'closed'}`}>
        <DrawerHeader onClose={onClose} />

        <DrawerNavigation
          menuItems={menuItems}
          regions={regions}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          clearSearch={clearSearch}
          isRegionsExpanded={isRegionsExpanded}
          setIsRegionsExpanded={setIsRegionsExpanded}
          onClose={onClose}
        />

        <DrawerFooter />
      </aside>
    </>
  );
};
