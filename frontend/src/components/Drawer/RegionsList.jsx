// components/Drawer/RegionsList.jsx
import { Link, useLocation } from 'react-router-dom';

import './RegionsList.css';

export const RegionsList = ({ regions, searchTerm, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Список регионов */}
      {regions.length > 0 &&
        regions.map((region) => (
          <li key={region.id} className="drawer-menu-item">
            <Link
              to={region.path}
              className={`drawer-menu-link drawer-region-link ${location.pathname === region.path ? 'active' : ''}`}
              onClick={onClose}
            >
              {region.name}
            </Link>
          </li>
        ))}

      {/* Сообщение, если ничего не найдено */}
      {searchTerm && regions.length === 0 && (
        <li className="drawer-menu-item">
          <div className="drawer-no-results">Регионы не найдены</div>
        </li>
      )}

      {/* Сообщение о количестве регионов */}
      {!searchTerm && (
        <li className="drawer-menu-item">
          <div className="drawer-regions-count">Всего регионов: {regions.length}</div>
        </li>
      )}
    </>
  );
};
