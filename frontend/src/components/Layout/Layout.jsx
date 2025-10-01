// components/Layout.jsx
import { useState } from 'react';

import { Outlet } from 'react-router-dom';

import { Drawer } from '../Drawer/Drawer';
import './Layout.css';

const Layout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="layout">
      {/* Кнопка для открытия Drawer */}
      <button
        className={`drawer-toggle-button ${isDrawerOpen ? 'open' : ''}`}
        onClick={toggleDrawer}
        aria-label={isDrawerOpen ? 'Закрыть меню' : 'Открыть меню'}
      >
        ☰
      </button>

      {/* Основной контент */}
      <main className="layout-main">
        <Outlet />
      </main>

      {/* Боковое меню */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onToggle={toggleDrawer}
      />
    </div>
  );
};

export default Layout;
