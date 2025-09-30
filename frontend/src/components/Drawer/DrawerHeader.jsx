// components/Drawer/DrawerHeader.jsx
import './DrawerHeader.css';

export const DrawerHeader = ({ onClose }) => {
  return (
    <div className="drawer-header">
      <h2>Навигация</h2>
      <button className="drawer-close-button" onClick={onClose} aria-label="Закрыть меню">
        ×
      </button>
    </div>
  );
};
