/* eslint-disable no-unused-vars */
import { memo, useCallback, useMemo } from 'react';

import './DrawerNavigation.css';
import { MenuItem } from './MenuItem';
import { RegionsList } from './RegionsList';
import { RegionsSearch } from './RegionsSearch';
import { RegionsSectionHeader } from './RegionsSectionHeader';

export const DrawerNavigation = memo(
  ({
    menuItems,
    regions,
    searchTerm,
    setSearchTerm,
    clearSearch,
    isRegionsExpanded,
    setIsRegionsExpanded,
    onClose,
  }) => {
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

    const toggleSearchSection = useCallback(() => setIsRegionsExpanded((prev) => !prev), []);

    return (
      <nav className="drawer-nav">
        <ul className="drawer-menu">
          {menuItems.map((item) => (
            <MenuItem key={item.path} item={item} onClose={onClose} />
          ))}

          <li className="drawer-menu-divider">
            <hr />
          </li>

          <RegionsSectionHeader isExpanded={isRegionsExpanded} onToggle={toggleSearchSection} />

          {isRegionsExpanded && (
            <RegionsSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              clearSearch={clearSearch}
            />
          )}

          {isRegionsExpanded && (
            <RegionsList regions={filteredRegions} searchTerm={searchTerm} onClose={onClose} />
          )}
        </ul>
      </nav>
    );
  },
);
