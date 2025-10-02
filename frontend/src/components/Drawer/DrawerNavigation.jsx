import { useMemo } from 'react';

import './DrawerNavigation.css';
import { RegionsList } from './RegionsList';
import { RegionsSearch } from './RegionsSearch';
import { RegionsSectionHeader } from './RegionsSectionHeader';

export const DrawerNavigation = ({
  menuItems,
  regions,
  searchTerm,
  setSearchTerm,
  clearSearch,
  isRegionsExpanded,
  setIsRegionsExpanded,
  onClose,
}) => {
  // Фильтруем регионы
  const filteredRegions = useMemo(() => {
    if (!regions?.length) {
      return [];
    }

    if (!searchTerm) {
      return regions;
    }

    const term = searchTerm.toLowerCase().trim();
    return regions.filter((region) => region.name.toLowerCase().includes(term));
  }, [regions, searchTerm]);

  return (
    <nav className="drawer-nav">
      <ul className="drawer-menu">
        {/* Основные пункты меню */}
        {menuItems.map((item) => (
          <MenuItem key={item.path} item={item} onClose={onClose} />
        ))}

        {/* Разделитель */}
        <li className="drawer-menu-divider">
          <hr />
        </li>

        {/* Заголовок раздела регионов */}
        <RegionsSectionHeader
          isExpanded={isRegionsExpanded}
          onToggle={() => setIsRegionsExpanded(!isRegionsExpanded)}
        />

        {/* Поиск по регионам */}
        {isRegionsExpanded && (
          <RegionsSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clearSearch={clearSearch}
          />
        )}

        {/* Список регионов */}
        {isRegionsExpanded && (
          <RegionsList regions={filteredRegions} searchTerm={searchTerm} onClose={onClose} />
        )}
      </ul>
    </nav>
  );
};

// Компонент для отдельного пункта меню
const MenuItem = ({ item, onClose }) => {
  return (
    <li className="drawer-menu-item">
      <a
        href={item.path}
        className="drawer-menu-link"
        onClick={(e) => {
          e.preventDefault();
          window.location.href = item.path;
          onClose();
        }}
      >
        {item.label}
      </a>
    </li>
  );
};
