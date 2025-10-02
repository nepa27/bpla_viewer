/* eslint-disable no-unused-vars */
import { useState } from 'react';

import { useGzipPolygonsData } from '../../hooks/useGzipPolygonsData';
import { prepareRegionsForMenu } from '../../utils/prepareRegionsData';
import './Drawer.css';
import { DrawerFooter } from './DrawerFooter';
import { DrawerHeader } from './DrawerHeader';
import { DrawerNavigation } from './DrawerNavigation';

const BASE_URL =
  import.meta.env.VITE_IS_WORK == 'prod'
    ? import.meta.env.VITE_API_URL
    : import.meta.env.VITE_API_URL_WORK;

export const Drawer = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegionsExpanded, setIsRegionsExpanded] = useState(true);

  const menuItems = [
    {
      label: 'Документация',
      path: 'https://docs.google.com/document/d/1EyT4ExZmKhAPZVgl-wzLFLzGn0BVEHXfD-EQQTDKYhs/edit?usp=sharing',
    },
    {
      label: 'Презентация',
      path: `https://docs.google.com/presentation/d/1M3pVkCrbEOC9_y0Jh8oyeLK19jmj9u08aOPOabSDkTo/edit?usp=sharing`,
    },
    { label: 'Демонстрация работы', path: ' https://disk.yandex.ru/d/yxUuDdwFjy7zuA' },
    { label: 'Админ панель', path: `${BASE_URL}/admin/flight/list` },
  ];
  const { data: regionsData } = useGzipPolygonsData();

  const regions = prepareRegionsForMenu(regionsData);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <>
      {isOpen && (
        <div
          className="drawer-overlay"
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-hidden="true"
        />
      )}

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
