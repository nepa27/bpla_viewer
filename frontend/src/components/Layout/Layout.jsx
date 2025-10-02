/* eslint-disable no-unused-vars */
import { useState } from 'react';

import { Outlet } from 'react-router-dom';

import { Drawer } from '../Drawer/Drawer';
import style from './Layout.module.css';

const Layout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className={style.layout}>
      <button
        className={`${style['drawer-toggle-button']} ${isDrawerOpen ? 'open' : ''}`}
        onClick={toggleDrawer}
        aria-label={isDrawerOpen ? 'Закрыть меню' : 'Открыть меню'}
      >
        ☰
      </button>

      <main className={style['layout-main']}>
        <Outlet />
      </main>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onToggle={toggleDrawer}
      />
    </div>
  );
};

export default Layout;
